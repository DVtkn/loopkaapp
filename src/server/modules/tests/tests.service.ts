import crypto from "crypto";
import { eq, sql, and, or, inArray } from "drizzle-orm";
import { db, isSqlConfigured } from "../../db/client.ts";
import { testSessions, testAnswers, couples, coupleData, users, userPsychProfiles, coupleReports, testDrafts } from "../../db/schema.ts";
import { logger } from "../../shared/utils/logger.ts";
import { DatabaseUnavailableError } from "../../shared/errors/index.ts";
import { getCoupleData, saveCoupleData } from "../../services/storageService.ts";
import { calculateIndividualVector } from './psychometrics.calc.ts';
import { calculateCoupleMatrix } from './couple-matrix.calc.ts';

export async function saveTestDraft(userId: string, testId: string, currentQuestionIndex: number, answers: any) {
  if (!isSqlConfigured) return;
  await db.insert(testDrafts).values({
    userId,
    testId,
    currentQuestionIndex,
    answers,
    updatedAt: new Date()
  }).onConflictDoUpdate({
    target: [testDrafts.userId, testDrafts.testId],
    set: { currentQuestionIndex, answers, updatedAt: new Date() }
  });
}

export async function getTestDraft(userId: string, testId: string) {
  if (!isSqlConfigured) return null;
  const drafts = await db.select().from(testDrafts).where(
    and(eq(testDrafts.userId, userId), eq(testDrafts.testId, testId))
  ).limit(1);
  return drafts[0] || null;
}

export async function clearTestDraft(userId: string, testId: string) {
  if (!isSqlConfigured) return;
  await db.delete(testDrafts).where(
    and(eq(testDrafts.userId, userId), eq(testDrafts.testId, testId))
  );
}

export const CATALOG_TEST_IDS = [
  'TEST-S1',
  'TEST-S2',
  'TEST-S3',
  'TEST-C1',
  'TEST-S4',
  'TEST-D1',
  'TEST-D2',
];

export const EXPECTED_QUESTIONS: Record<string, number> = {
  'TEST-S1': 6,
  'TEST-S2': 6,
  'TEST-S3': 5,
  'TEST-C1': 4,
  'TEST-S4': 5,
  'TEST-D1': 5,
  'TEST-D2': 5,
};

export interface TestStatusItem {
  testId: string;
  isCompletedByMe: boolean;
  isCompletedByPartner: boolean;
  myAnswersCount: number;
  partnerAnswersCount: number;
  expectedQuestionsCount: number;
  status: 'not_started' | 'waiting_partner' | 'partner_ready' | 'both_done';
}

export async function getTestsStatusForUser(userLogin: string, authUserId?: string): Promise<TestStatusItem[]> {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && (!isSqlConfigured() || !db)) {
    throw new DatabaseUnavailableError();
  }

  const cleanLogin = userLogin.toLowerCase().trim().replace(/^@/, '');

  if (isSqlConfigured() && db) {
    // 1. Fetch current user from DB
    let currentDbUser = null;
    if (authUserId) {
      const [u] = await db.select().from(users).where(eq(users.id, authUserId));
      currentDbUser = u;
    }
    if (!currentDbUser && cleanLogin) {
      const [u] = await db.select().from(users).where(eq(users.login, cleanLogin));
      currentDbUser = u;
    }

    if (!currentDbUser) {
      return CATALOG_TEST_IDS.map((testId) => ({
        testId,
        isCompletedByMe: false,
        isCompletedByPartner: false,
        myAnswersCount: 0,
        partnerAnswersCount: 0,
        expectedQuestionsCount: EXPECTED_QUESTIONS[testId] || 5,
        status: 'not_started' as const,
      }));
    }

    const currentUserId = currentDbUser.id;

    // 2. Fetch partner from DB
    let partnerDbUser = null;
    if (currentDbUser.partnerLogin) {
      const cleanPartner = currentDbUser.partnerLogin.toLowerCase().trim().replace(/^@/, '');
      const [pu] = await db.select().from(users).where(eq(users.login, cleanPartner));
      partnerDbUser = pu;
    }

    const partnerUserId = partnerDbUser ? partnerDbUser.id : null;
    const cleanPartnerLogin = partnerDbUser ? partnerDbUser.login.toLowerCase().trim().replace(/^@/, '') : null;

    // 3. Find potential coupleIds for test sessions
    const possibleCoupleIds = [cleanLogin];
    if (cleanPartnerLogin) {
      possibleCoupleIds.push(cleanPartnerLogin);
      possibleCoupleIds.push([cleanLogin, cleanPartnerLogin].sort().join('_'));
    }

    // Also look up in couples table if exists
    const [coupleRecord] = await db
      .select()
      .from(couples)
      .where(
        or(
          eq(couples.user1Id, currentUserId),
          eq(couples.user2Id, currentUserId)
        )
      );
    if (coupleRecord && coupleRecord.id) {
      possibleCoupleIds.push(coupleRecord.id);
    }

    const sessions = await db
      .select()
      .from(testSessions)
      .where(inArray(testSessions.coupleId, possibleCoupleIds));

    const result: TestStatusItem[] = [];

    for (const testId of CATALOG_TEST_IDS) {
      const expectedCount = EXPECTED_QUESTIONS[testId] || 5;
      const testSessionList = sessions.filter((s) => s.testId === testId);
      const testSessionIds = testSessionList.map((s) => s.id);

      let myAnswersCount = 0;
      let partnerAnswersCount = 0;

      if (testSessionIds.length > 0) {
        // Query testAnswers strictly for current user
        const myAnswers = await db
          .select({ questionId: testAnswers.questionId })
          .from(testAnswers)
          .where(
            and(
              eq(testAnswers.userId, currentUserId),
              inArray(testAnswers.sessionId, testSessionIds)
            )
          );
        const uniqueMyQuestions = new Set(myAnswers.map((a) => a.questionId));
        myAnswersCount = uniqueMyQuestions.size;

        if (partnerUserId) {
          const partnerAnswers = await db
            .select({ questionId: testAnswers.questionId })
            .from(testAnswers)
            .where(
              and(
                eq(testAnswers.userId, partnerUserId),
                inArray(testAnswers.sessionId, testSessionIds)
              )
            );
          const uniquePartnerQuestions = new Set(partnerAnswers.map((a) => a.questionId));
          partnerAnswersCount = uniquePartnerQuestions.size;
        }
      }

      const isCompletedByMe = myAnswersCount >= expectedCount;
      const isCompletedByPartner = partnerUserId ? partnerAnswersCount >= expectedCount : false;

      let status: 'not_started' | 'waiting_partner' | 'partner_ready' | 'both_done' = 'not_started';
      if (isCompletedByMe && isCompletedByPartner) {
        status = 'both_done';
      } else if (isCompletedByMe && !isCompletedByPartner) {
        status = 'waiting_partner';
      } else if (!isCompletedByMe && isCompletedByPartner) {
        status = 'partner_ready';
      }

      console.log(
        `[TEST STATUS CHECK] Req User: ${currentDbUser.login} (${currentUserId}) -> testId: ${testId}, count: ${myAnswersCount}/${expectedCount}, Completed: ${isCompletedByMe}`
      );
      logger.info(
        `[TEST STATUS CHECK] Req User: ${currentDbUser.login} (${currentUserId}) -> testId: ${testId}, count: ${myAnswersCount}/${expectedCount}, Completed: ${isCompletedByMe}`
      );

      result.push({
        testId,
        isCompletedByMe,
        isCompletedByPartner,
        myAnswersCount,
        partnerAnswersCount,
        expectedQuestionsCount: expectedCount,
        status,
      });
    }

    return result;
  }

  // Fallback (dev mode without SQL)
  const coupleKey = cleanLogin;
  const cData = await getCoupleData(coupleKey);
  const testsList = Array.isArray(cData?.tests) ? cData.tests : [];

  return CATALOG_TEST_IDS.map((testId) => {
    const expectedCount = EXPECTED_QUESTIONS[testId] || 5;
    const t = testsList.find((x: any) => x.id === testId);
    
    const myAnswers = t?.userAnswers?.[cleanLogin] || t?.userAnswers?.[authUserId || ''] || {};
    const myCount = Object.keys(myAnswers).length;
    const isCompletedByMe = myCount >= expectedCount;

    return {
      testId,
      isCompletedByMe,
      isCompletedByPartner: false,
      myAnswersCount: myCount,
      partnerAnswersCount: 0,
      expectedQuestionsCount: expectedCount,
      status: isCompletedByMe ? ('waiting_partner' as const) : ('not_started' as const),
    };
  });
}

export interface SubmitAnswerParams {
  sessionId?: string;
  testId: string;
  coupleId: string;
  userLogin: string;
  authUserId?: string;
  questionId: string;
  selectedValue?: string | number;
  expectedQuestionsCount?: number;
  reactionTimeMs?: number | null;
  toggleCount?: number | null;
  targetType?: string | null;
  rawPayload?: any;
}

export async function processTestCompletion(
  tx: any,
  sessionId: string,
  userId: string,
  coupleId: string
) {
  // 1. СЛОЙ 2: Агрегируем личный профиль текущего пользователя (24 шкалы)
  const allSessionsForCouple = await tx.select().from(testSessions).where(eq(testSessions.coupleId, coupleId));
  const sessionIds = allSessionsForCouple.map((s: any) => s.id);
  
  const rawUserAnswers = sessionIds.length > 0 
    ? await tx.select().from(testAnswers).where(inArray(testAnswers.sessionId, sessionIds))
    : [];

  const userAnswers = rawUserAnswers.filter((a: any) => a.userId === userId);
  const individualVector = calculateIndividualVector(userAnswers);

  await tx.insert(userPsychProfiles).values({
    userId,
    coupleId,
    sessionId,
    traitScores: individualVector.traitScores,
    dominantVectors: individualVector.dominantVectors,
    eSafety: individualVector.eSafety.toFixed(2),
    aAutonomy: individualVector.aAutonomy.toFixed(2),
    cCloseness: individualVector.cCloseness.toFixed(2),
    rRepair: individualVector.rRepair.toFixed(2),
    vFuture: individualVector.vFuture.toFixed(2),
    consistencyScore: individualVector.consistencyScore.toFixed(2),
    updatedAt: new Date()
  }).onConflictDoUpdate({
    target: userPsychProfiles.userId,
    set: {
      traitScores: individualVector.traitScores,
      dominantVectors: individualVector.dominantVectors,
      eSafety: individualVector.eSafety.toFixed(2),
      aAutonomy: individualVector.aAutonomy.toFixed(2),
      cCloseness: individualVector.cCloseness.toFixed(2),
      rRepair: individualVector.rRepair.toFixed(2),
      vFuture: individualVector.vFuture.toFixed(2),
      consistencyScore: individualVector.consistencyScore.toFixed(2),
      updatedAt: new Date()
    }
  });

  // 2. БАРЬЕР ОЖИДАНИЯ: Проверяем, есть ли готовый профиль у второго партнера
  const [couple] = await tx.select().from(couples).where(eq(couples.id, coupleId));
  if (!couple) return { state: 'PARTNER_PENDING', personalVector: individualVector };

  const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
  if (!partnerId) {
    return { state: 'PARTNER_PENDING', personalVector: individualVector };
  }

  const [partnerProfile] = await tx
    .select()
    .from(userPsychProfiles)
    .where(eq(userPsychProfiles.userId, partnerId));

  if (!partnerProfile) {
    return {
      state: 'PARTNER_PENDING',
      personalVector: individualVector
    };
  }

  // 3. ВЕРШИНА ПИРАМИДЫ: Оба профиля на месте — строим 6-сферную матрицу союза
  const partnerScales = (partnerProfile.traitScores as any) || {
    s1: 50, s2: 50, s3: 50, s4: 50,
    s5: 50, s6: 50, s7: 50, s8: 50,
    s9: 50, s10: 50, s11: 50, s12: 50,
    s13: 50, s14: 50, s15: 50, s16: 50,
    s17: 50, s18: 50, s19: 50, s20: 50,
    s21: 50, s22: 50, s23: 50, s24: 50,
  };

  const radarReport = calculateCoupleMatrix(individualVector.traitScores, partnerScales);

  await tx.insert(coupleReports).values({
    id: crypto.randomUUID(),
    sessionId,
    coupleId,
    radarMetrics: radarReport.radar,
    radarTrust: radarReport.radar.trust.toFixed(2),
    radarCloseness: radarReport.radar.closeness.toFixed(2),
    radarCommunication: radarReport.radar.communication.toFixed(2),
    radarIntimacy: radarReport.radar.intimacy.toFixed(2),
    radarValues: radarReport.radar.values.toFixed(2),
    archetypeTitle: radarReport.archetype.title,
    archetypeDescription: radarReport.archetype.description,
    leadSpheres: radarReport.archetype.leadSpheres,
    synergyPoints: radarReport.synergyPoints,
    growthZones: radarReport.growthZones,
    blindSpots: {
      destructivePatterns: radarReport.destructivePatternsDetected,
      growthZones: radarReport.growthZones,
    },
    calculatedAt: new Date(),
    createdAt: new Date(),
  }).onConflictDoUpdate({
    target: coupleReports.coupleId,
    set: {
      radarMetrics: radarReport.radar,
      radarTrust: radarReport.radar.trust.toFixed(2),
      radarCloseness: radarReport.radar.closeness.toFixed(2),
      radarCommunication: radarReport.radar.communication.toFixed(2),
      radarIntimacy: radarReport.radar.intimacy.toFixed(2),
      radarValues: radarReport.radar.values.toFixed(2),
      archetypeTitle: radarReport.archetype.title,
      archetypeDescription: radarReport.archetype.description,
      leadSpheres: radarReport.archetype.leadSpheres,
      synergyPoints: radarReport.synergyPoints,
      growthZones: radarReport.growthZones,
      blindSpots: {
        destructivePatterns: radarReport.destructivePatternsDetected,
        growthZones: radarReport.growthZones,
      },
      calculatedAt: new Date()
    }
  });

  return {
    state: 'HARMONY_READY',
    personalVector: individualVector,
    coupleReport: radarReport
  };
}

export async function submitTestAnswer(params: SubmitAnswerParams) {
  const {
    testId,
    coupleId,
    userLogin,
    questionId,
    selectedValue = 0,
    expectedQuestionsCount = 15,
    reactionTimeMs,
    toggleCount,
    targetType,
    rawPayload,
  } = params;

  const isProd = process.env.NODE_ENV === "production";
  if (isProd && (!isSqlConfigured() || !db)) {
    throw new DatabaseUnavailableError();
  }

  if (isSqlConfigured() && db) {
    try {
      return await db.transaction(async (tx) => {
        let session = null;
        if (params.sessionId) {
          const [found] = await tx
            .select()
            .from(testSessions)
            .where(eq(testSessions.id, params.sessionId))
            .for("update");
          session = found;
        } else {
          const foundSessions = await tx
            .select()
            .from(testSessions)
            .where(eq(testSessions.coupleId, coupleId))
            .for("update");
          session = foundSessions.find(
            (s) => s.testId === testId && s.status === "in_progress"
          );
        }

        if (!session) {
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
          session = created;
        }

        if (session.status === "completed") {
          return { status: "already_completed", sessionId: session.id };
        }

        const [u] = await tx.select().from(users).where(eq(users.login, userLogin));
        const userId = u ? u.id : userLogin;

        const answerId = crypto.randomUUID();
        await tx
          .insert(testAnswers)
          .values({
            id: answerId,
            sessionId: session.id,
            userId,
            questionId,
            selectedValue: selectedValue.toString(),
            weight: '1.00',
            reactionTimeMs: reactionTimeMs ?? null,
            toggleCount: toggleCount ?? 0,
            targetType: targetType ?? 'self',
            rawPayload: rawPayload ?? null,
          })
          .onConflictDoUpdate({
            target: [testAnswers.sessionId, testAnswers.userId, testAnswers.questionId],
            set: {
              selectedValue: selectedValue.toString(),
              reactionTimeMs: reactionTimeMs ?? null,
              toggleCount: toggleCount ?? 0,
              targetType: targetType ?? 'self',
              rawPayload: rawPayload ?? null,
            },
          });

        const participantsProgress = await tx
          .select({
            userId: testAnswers.userId,
            count: sql<number>`count(*)`,
          })
          .from(testAnswers)
          .where(eq(testAnswers.sessionId, session.id))
          .groupBy(testAnswers.userId);

        const myProgress = participantsProgress.find((p: any) => p.userId === userId);
        const myCount = myProgress ? Number(myProgress.count) : 0;
        let harmonyState = null;

        if (myCount >= expectedQuestionsCount) {
          harmonyState = await processTestCompletion(tx, session.id, userId, coupleId);
        }

        const bothPartnersCompleted =
          participantsProgress.length === 2 &&
          participantsProgress.every((p: any) => Number(p.count) >= expectedQuestionsCount);

        if (!bothPartnersCompleted) {
          return {
            status: "waiting_for_partner",
            sessionId: session.id,
            completedCount: participantsProgress.length,
            harmonyState
          };
        }

        await tx
          .update(testSessions)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(testSessions.id, session.id));

        try {
          const currentData = await getCoupleData(coupleId);
          if (currentData) {
            currentData.totalXP = (currentData.totalXP || 0) + 150;
            if (!currentData.xpHistory) currentData.xpHistory = [];
            currentData.xpHistory.push({
              id: crypto.randomUUID(),
              amount: 150,
              reason: `Завершение парного теста ${testId}`,
              timestamp: new Date().toISOString(),
            });
            await saveCoupleData(coupleId, currentData);
          }
        } catch (err) {
          logger.warn("Ошибка начисления XP в coupleData", { coupleId }, err);
        }

        return {
          status: "completed",
          allFinished: true,
          sessionId: session.id,
          xpAwarded: 150,
          harmonyState
        };
      });
    } catch (txErr) {
      if (isProd) throw txErr;
      logger.warn("Transaction failed in dev mode", { coupleId }, txErr);
      return { status: "waiting_for_partner", allFinished: false };
    }
  }

  return { status: "recorded_locally", allFinished: false };
}
