import crypto from "crypto";
import { eq, sql, and, or, inArray, ne, count } from "drizzle-orm";
import { db, isSqlConfigured } from "../../db/client.ts";
import { testSessions, testAnswers, couples, coupleData, users, userPsychProfiles, coupleReports, testDrafts } from "../../db/schema.ts";
import { TESTS_REGISTRY, getSphereByTestId, TEST_REGISTRY_ENTRIES } from "@/src/shared/tests.registry.ts";
import { logger } from "../../shared/utils/logger.ts";
import { DatabaseUnavailableError } from "../../shared/errors/index.ts";
import { calculatePsychProfile } from "./psychometrics.calc.ts";
import { calculateCoupleRadarMatrix, CoupleRadarResult } from "./report.matrix.ts";

/** Единый реестр всех тестов — источник правды (SSOT). */
export { TESTS_REGISTRY, getSphereByTestId, TEST_REGISTRY_ENTRIES };

export const CATALOG_TEST_IDS = Object.keys(TESTS_REGISTRY);

export const EXPECTED_QUESTIONS = Object.fromEntries(
  Object.entries(TESTS_REGISTRY as Record<string, TestDefinition>).map(([id, def]) => [id, def.totalQuestions])
);

export interface TestDefinition {
  id: string;
  title: string;
  sphere: "trust" | "closeness" | "communication" | "values" | "intimacy" | "lifestyle";
  totalQuestions: number;
}

/**
 * Атомарная отправка ответов теста с валидацией из реестра.
 * Гарантирует: userId из JWT, проверка кол-ва ответов, транзакция, draft cleanup, профиль, отчет.
 */
export async function atomicSubmitTestAnswers(
  testId: string,
  coupleId: string,
  userLogin: string,
  answers: Array<{ questionId: string; value: any }>
) {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && (!isSqlConfigured() || !db)) {
    throw new DatabaseUnavailableError();
  }

  // 1. Строгая валидация через реестр
  const testDef = TESTS_REGISTRY[testId];
  if (!testDef) {
    throw new Error(`Unknown testId: ${testId}`);
  }
  if (answers.length !== testDef.totalQuestions) {
    const missing = testDef.totalQuestions - answers.length;
    throw new Error(
      `ValidationFailed: Expected ${testDef.totalQuestions} answers for "${testDef.title}", got ${answers.length}. Missing ${missing} question(s).`
    );
  }

  if (isSqlConfigured() && db) {
    return await db.transaction(async (tx) => {
      // 2. userId берётся строго из JWT
      const [u] = await tx.select().from(users).where(eq(users.login, userLogin));
      const userId = u ? u.id : userLogin;

      // 3. Находим/создаём сессию in_progress
      let session = await tx
        .select()
        .from(testSessions)
        .where(
          and(
            eq(testSessions.coupleId, coupleId),
            eq(testSessions.testId, testId),
            eq(testSessions.status, "in_progress")
          )
        )
        .limit(1);

      if (!session.length) {
        const newSessionId = crypto.randomUUID();
        const [created] = await tx
          .insert(testSessions)
          .values({
            id: newSessionId,
            testId,
            coupleId,
            testClass: "couple",
            status: "in_progress",
          })
          .returning();
        session = [created];
      }
      const sessionId = session[0].id;

      // 4. Пакетная вставка ответов
      const answerRecords = answers.map((a) => ({
        id: crypto.randomUUID(),
        sessionId,
        userId,
        questionId: a.questionId,
        selectedValue: String(a.value),
        weight: "1.00",
        reactionTimeMs: null,
        toggleCount: 0,
        targetType: "self",
        rawPayload: null,
      }));
      await tx.insert(testAnswers).values(answerRecords);

      // 5. Удаляем черновик этого теста у этого пользователя
      await tx.delete(testDrafts).where(
        and(eq(testDrafts.userId, userId), eq(testDrafts.testId, testId))
      );

      // 6. Пересчёт психопрофиля пользователя (24 шкалы)
      await _recalculateUserProfile(tx, coupleId, userId, testId);

      // 7. Триггер отчета о паре (проверка и запись coupleReport)
      const triggerResult = await _triggerCoupleReportIfReady(tx, coupleId, userId);

      // 8. Помечаем сессию завершённой
      await tx.update(testSessions)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(testSessions.id, sessionId));

      return {
        status: "completed",
        testId,
        userId,
        sessionId,
        answersCount: answers.length,
        harmonyState: triggerResult,
      };
    });
  }

  // Dev fallback
  return { status: "recorded_locally", testId, message: "Dev mode: no DB" };
}

/** Инкрементальная отправка ответа (для режима вопрос-за-вопросом) */
export async function submitTestAnswer(
  params: {
    sessionId?: string;
    testId: string;
    coupleId: string;
    userLogin: string;
    questionId: string;
    selectedValue?: string | number;
    expectedQuestionsCount?: number;
    reactionTimeMs?: number | null;
    toggleCount?: number | null;
    targetType?: string | null;
    rawPayload?: any;
  }
) {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && (!isSqlConfigured() || !db)) {
    throw new DatabaseUnavailableError();
  }

  const testDef = TESTS_REGISTRY[params.testId];
  if (!testDef) {
    throw new Error(`Unknown testId: ${params.testId}`);
  }

  if (isSqlConfigured() && db) {
    return await db.transaction(async (tx) => {
      const [u] = await tx.select().from(users).where(eq(users.login, params.userLogin));
      const userId = u ? u.id : params.userLogin;

      let sessionId = params.sessionId;
      if (!sessionId) {
        let session = await tx
          .select()
          .from(testSessions)
          .where(
            and(
              eq(testSessions.coupleId, params.coupleId),
              eq(testSessions.testId, params.testId),
              eq(testSessions.status, "in_progress")
            )
          )
          .limit(1);

        if (!session.length) {
          const newSessionId = crypto.randomUUID();
          const [created] = await tx
            .insert(testSessions)
            .values({
              id: newSessionId,
              testId: params.testId,
              coupleId: params.coupleId,
              testClass: "couple",
              status: "in_progress",
            })
            .returning();
          session = [created];
        }
        sessionId = session[0].id;
      }

      // Upsert ответа (on conflict update)
      await tx.insert(testAnswers).values({
        id: crypto.randomUUID(),
        sessionId,
        userId,
        questionId: params.questionId,
        selectedValue: String(params.selectedValue ?? ""),
        weight: "1.00",
        reactionTimeMs: params.reactionTimeMs ?? null,
        toggleCount: params.toggleCount ?? 0,
        targetType: params.targetType ?? "self",
        rawPayload: params.rawPayload ?? null,
      }).onConflictDoUpdate({
        target: [testAnswers.sessionId, testAnswers.userId, testAnswers.questionId],
        set: {
          selectedValue: String(params.selectedValue ?? ""),
          reactionTimeMs: params.reactionTimeMs ?? null,
          toggleCount: params.toggleCount ?? 0,
          targetType: params.targetType ?? "self",
          rawPayload: params.rawPayload ?? null,
        },
      });

      return {
        status: "answer_recorded",
        testId: params.testId,
        userId,
        sessionId,
        questionId: params.questionId,
      };
    });
  }

  return { status: "recorded_locally", testId: params.testId, message: "Dev mode: no DB" };
}

/** Сохранить черновик теста */
export async function saveTestDraft(
  userLogin: string,
  testId: string,
  currentQuestionIndex: number,
  answers: Array<{ questionId: string; value: any }>
) {
  if (!isSqlConfigured() || !db) {
    return { status: "saved_locally", message: "Dev mode: no DB" };
  }

  const [u] = await db.select().from(users).where(eq(users.login, userLogin));
  const userId = u ? u.id : userLogin;

  await db.insert(testDrafts).values({
    userId,
    testId,
    currentQuestionIndex,
    answers,
  }).onConflictDoUpdate({
    target: [testDrafts.userId, testDrafts.testId],
    set: {
      currentQuestionIndex,
      answers,
      updatedAt: new Date(),
    },
  });

  return { status: "saved", testId, currentQuestionIndex };
}

/** Получить черновик теста */
export async function getTestDraft(userLogin: string, testId: string) {
  if (!isSqlConfigured() || !db) {
    return null;
  }

  const [u] = await db.select().from(users).where(eq(users.login, userLogin));
  const userId = u ? u.id : userLogin;

  const [draft] = await db
    .select()
    .from(testDrafts)
    .where(and(eq(testDrafts.userId, userId), eq(testDrafts.testId, testId)))
    .limit(1);

  return draft ?? null;
}

/** Удалить черновик теста */
export async function clearTestDraft(userLogin: string, testId: string) {
  if (!isSqlConfigured() || !db) {
    return { status: "cleared_locally", message: "Dev mode: no DB" };
  }

  const [u] = await db.select().from(users).where(eq(users.login, userLogin));
  const userId = u ? u.id : userLogin;

  await db.delete(testDrafts).where(
    and(eq(testDrafts.userId, userId), eq(testDrafts.testId, testId))
  );

  return { status: "cleared", testId };
}

/** Получить статусы тестов для пользователя */
export async function getTestsStatusForUser(userLogin: string) {
  if (!isSqlConfigured() || !db) {
    return CATALOG_TEST_IDS.map((testId) => ({
      testId,
      isCompletedByMe: false,
      isCompletedByPartner: false,
    }));
  }

  const [u] = await db.select().from(users).where(eq(users.login, userLogin));
  if (!u) return [];

  const userId = u.id;

  // Находим пару пользователя
  const [couple] = await db
    .select()
    .from(couples)
    .where(or(eq(couples.user1Id, userId), eq(couples.user2Id, userId)))
    .limit(1);

  if (!couple) {
    return CATALOG_TEST_IDS.map((testId) => ({
      testId,
      isCompletedByMe: false,
      isCompletedByPartner: false,
    }));
  }

  const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;

  if (!partnerId) {
    return CATALOG_TEST_IDS.map((testId) => ({
      testId,
      isCompletedByMe: false,
      isCompletedByPartner: false,
    }));
  }

  // Получаем завершенные тесты пользователя
  const myCompleted = await db
    .select({ testId: testSessions.testId })
    .from(testSessions)
    .innerJoin(testAnswers, eq(testAnswers.sessionId, testSessions.id))
    .where(and(eq(testAnswers.userId, userId), eq(testSessions.status, "completed")));

  // Получаем завершенные тесты партнера
  const partnerCompleted = await db
    .select({ testId: testSessions.testId })
    .from(testSessions)
    .innerJoin(testAnswers, eq(testAnswers.sessionId, testSessions.id))
    .where(and(eq(testAnswers.userId, partnerId), eq(testSessions.status, "completed")));

  const mySet = new Set(myCompleted.map((r) => r.testId));
  const partnerSet = new Set(partnerCompleted.map((r) => r.testId));

  return CATALOG_TEST_IDS.map((testId) => ({
    testId,
    isCompletedByMe: mySet.has(testId),
    isCompletedByPartner: partnerSet.has(testId),
  }));
}

/** Пересчёт психопрофиля пользователя (24 шкалы) */
async function _recalculateUserProfile(
  tx: any,
  coupleId: string,
  userId: string,
  testId: string
) {
  // Получаем все ответы пользователя по этому тесту
  const answers = await tx
    .select()
    .from(testAnswers)
    .innerJoin(testSessions, eq(testAnswers.sessionId, testSessions.id))
    .where(and(eq(testAnswers.userId, userId), eq(testSessions.testId, testId), eq(testSessions.status, "completed")));

  if (!answers.length) return;

  // Группируем ответы по шкалам и считаем баллы
  const scaleScores: Record<string, number> = {};
  const scaleCounts: Record<string, number> = {};

  for (const row of answers) {
    const ans = row.test_answers;
    const scale = ans.scaleId || "unknown";
    const val = Number(ans.selectedValue);
    scaleScores[scale] = (scaleScores[scale] || 0) + val;
    scaleCounts[scale] = (scaleCounts[scale] || 0) + 1;
  }

  const traitScores: Record<string, number> = {};
  for (const scale of Object.keys(scaleScores)) {
    traitScores[scale] = scaleCounts[scale] > 0
      ? Math.round((scaleScores[scale] / scaleCounts[scale]) * 100)
      : 50;
  }

  // Upsert профиля
  await tx.insert(userPsychProfiles).values({
    userId,
    coupleId,
    sessionId: answers[0]?.test_answers.sessionId || "",
    traitScores,
    eSafety: "50.00",
    aAutonomy: "50.00",
    cCloseness: "50.00",
    rRepair: "50.00",
    vFuture: "50.00",
    rawResponses: answers.map((r: { test_answers: any }) => r.test_answers),
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: [userPsychProfiles.userId],
    set: {
      traitScores,
      eSafety: "50.00",
      aAutonomy: "50.00",
      cCloseness: "50.00",
      rRepair: "50.00",
      vFuture: "50.00",
rawResponses: answers.map((r: { test_answers: any }) => r.test_answers),
      updatedAt: new Date(),
    },
  });
}

/** Триггер: проверка готовности couple report и расчёт радара */
async function _triggerCoupleReportIfReady(
  tx: any,
  coupleId: string,
  userId: string
): Promise<{ state: "PARTNER_PENDING" | "BOTH_COMPLETED" | "REPORT_GENERATED"; radar?: CoupleRadarResult }> {
  // Проверяем, прошли ли оба пользователя все 6 тестов
  const tests = await tx
    .select({ testId: testSessions.testId, userId: testAnswers.userId })
    .from(testSessions)
    .innerJoin(testAnswers, eq(testAnswers.sessionId, testSessions.id))
    .where(and(eq(testSessions.coupleId, coupleId), eq(testSessions.status, "completed")));

  const completedByUser = new Map<string, Set<string>>();
  for (const row of tests) {
    const { testId, userId: uId } = row;
    if (!completedByUser.has(uId)) completedByUser.set(uId, new Set());
    completedByUser.get(uId)!.add(testId);
  }

  const allTestIds = CATALOG_TEST_IDS;
  const userIds = Array.from(completedByUser.keys());

  if (userIds.length < 2) {
    return { state: "PARTNER_PENDING" };
  }

  const [user1Tests, user2Tests] = [completedByUser.get(userIds[0]), completedByUser.get(userIds[1])];
  const user1Complete = allTestIds.every((t) => user1Tests?.has(t));
  const user2Complete = allTestIds.every((t) => user2Tests?.has(t));

  if (!user1Complete || !user2Complete) {
    return { state: "PARTNER_PENDING" };
  }

  // Оба прошли все тесты — считаем радар через calculateCoupleRadarMatrix
  // Получаем психопрофили обоих пользователей в транзакции
  const [profile1, profile2] = await Promise.all([
    tx.select().from(userPsychProfiles).where(eq(userPsychProfiles.userId, userIds[0])).limit(1),
    tx.select().from(userPsychProfiles).where(eq(userPsychProfiles.userId, userIds[1])).limit(1),
  ]);

  const v1 = profile1[0]?.traitScores;
  const v2 = profile2[0]?.traitScores;

  if (!v1 || !v2) {
    return { state: "BOTH_COMPLETED" }; // профили еще не готовы
  }

  const vec1 = {
    eSafety: v1.eSafety ?? 50,
    aAutonomy: v1.aAutonomy ?? 50,
    cCloseness: v1.cCloseness ?? 50,
    rRepair: v1.rRepair ?? 50,
    vFuture: v1.vFuture ?? 50,
    consistencyScore: v1.consistencyScore ?? 95,
  };
  const vec2 = {
    eSafety: v2.eSafety ?? 50,
    aAutonomy: v2.aAutonomy ?? 50,
    cCloseness: v2.cCloseness ?? 50,
    rRepair: v2.rRepair ?? 50,
    vFuture: v2.vFuture ?? 50,
    consistencyScore: v2.consistencyScore ?? 95,
  };

  const radarResult = calculateCoupleRadarMatrix(vec1, vec2);

  // Сохраняем/обновляем coupleReport
  await tx.insert(coupleReports).values({
    coupleId,
    sessionId: "",
    radarMetrics: radarResult.radar,
    radarTrust: radarResult.radar.trust,
    radarCloseness: radarResult.radar.closeness,
    radarCommunication: radarResult.radar.communication,
    radarIntimacy: radarResult.radar.intimacy,
    radarValues: radarResult.radar.values,
    radarLifestyle: radarResult.radar.values, // используем values как lifestyle
    archetypeTitle: radarResult.archetype.title,
    archetypeDescription: radarResult.archetype.description,
    leadSpheres: radarResult.archetype.leadSpheres,
    synergyPoints: radarResult.blindSpots.synergies,
    growthZones: radarResult.blindSpots.discrepancies.map(d => d.title),
    blindSpots: radarResult.blindSpots.discrepancies,
    calculatedAt: new Date(),
  }).onConflictDoUpdate({
    target: [coupleReports.coupleId],
    set: {
      radarMetrics: radarResult.radar,
      radarTrust: radarResult.radar.trust,
      radarCloseness: radarResult.radar.closeness,
      radarCommunication: radarResult.radar.communication,
      radarIntimacy: radarResult.radar.intimacy,
      radarValues: radarResult.radar.values,
      radarLifestyle: radarResult.radar.values,
      archetypeTitle: radarResult.archetype.title,
      archetypeDescription: radarResult.archetype.description,
      leadSpheres: radarResult.archetype.leadSpheres,
      synergyPoints: radarResult.blindSpots.synergies,
      growthZones: radarResult.blindSpots.discrepancies.map(d => d.title),
      blindSpots: radarResult.blindSpots.discrepancies,
      calculatedAt: new Date(),
    },
  });

  return { state: "REPORT_GENERATED", radar: radarResult };
}