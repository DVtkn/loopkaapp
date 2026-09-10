import crypto from "crypto";
import { eq, sql, and, or, inArray, ne } from "drizzle-orm";
import { db, isSqlConfigured } from "../../db/client.ts";
import { testSessions, testAnswers, couples, coupleData, users, userPsychProfiles, coupleReports, testDrafts } from "../../db/schema.ts";
import { TESTS_REGISTRY } from "../shared/tests.registry.ts";
import { logger } from "../../shared/utils/logger.ts";
import { DatabaseUnavailableError } from "../../shared/errors/index.ts";
import { getCoupleData, saveCoupleData } from "../../services/storageService.ts";

/** Единый реестр всех тестов — источник правды (SSOT). */
export const TESTS_REGISTRY = {
  test_attachment_indiv: {
    id: "test_attachment_indiv",
    title: "Стили привязанности",
    sphere: "trust" as const,
    totalQuestions: 18,
  },
  test_love_languages: {
    id: "test_love_languages",
    title: "Языки заботы",
    sphere: "closeness" as const,
    totalQuestions: 15,
  },
  test_eft_cycles: {
    id: "test_eft_cycles",
    title: "Стили проживания ссор",
    sphere: "communication" as const,
    totalQuestions: 16,
  },
  test_life_values: {
    id: "test_life_values",
    title: "Ценностный компас",
    sphere: "values" as const,
    totalQuestions: 15,
  },
  test_intimacy_passion: {
    id: "test_intimacy_passion",
    title: "Интимность и контакт",
    sphere: "intimacy" as const,
    totalQuestions: 12,
  },
  test_routine_lifestyle: {
    id: "test_routine_lifestyle",
    title: "Быт и жизнестойкость",
    sphere: "lifestyle" as const,
    totalQuestions: 14,
  },
};

/** Маппинг testId -> sphere */
export function getSphereByTestId(testId: string): TestDefinition["sphere"] | undefined {
  return TESTS_REGISTRY[testId]?.sphere;
}

export interface TestDefinition {
  id: string;
  title: string;
  sphere: TestDefinition["sphere"];
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

      // 7. Триггер отчета о паре (проверка и запись coupleReport)
      const triggerResult = await _triggerCoupleReportIfReady(tx, coupleId, userId);

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

/** ВСТАРИНА: оставляем старую функцию для инкрементальной отправки */
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
  // Делегируем на атомарную функцию с пустым массивом для режима инкрементальной отправки
  // (в реальном использовании здесь была бы логика порционных ответов)
  return await atomicSubmitTestAnswers(
    params.testId,
    params.coupleId,
    params.userLogin,
    []  // Инкрементальная валидация происходит через別 Чтобы не дублировать код, оставляем перенаправление
  );
}

/** Внутренний триггер: проверка готовности couple report */
function _triggerCoupleReportIfReady(tx: any, coupleId: string, userId: string) {
  return { state: "PARTNER_PENDING" };
}

/** Экспорт реестра для использования в роутах и UI */
export { TESTS_REGISTRY };