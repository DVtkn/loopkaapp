import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { db, isSqlConfigured } from "../../db/client.ts";
import { testSessions, testAnswers, couples, coupleData, users, userPsychProfiles, coupleReports } from "../../db/schema.ts";
import { logger } from "../../shared/utils/logger.ts";
import { DatabaseUnavailableError } from "../../shared/errors/index.ts";
import { getCoupleData, saveCoupleData } from "../../services/storageService.ts";
import { calculateIndividualVector } from './psychometrics.calc.ts';
import { calculateCoupleRadarMatrix } from './report.matrix.ts';

export interface SubmitAnswerParams {
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

export async function processTestCompletion(
  tx: any,
  sessionId: string,
  userId: string,
  coupleId: string
) {
  // 1. СЛОЙ 2: Агрегируем личный профиль текущего пользователя
  const rawUserAnswers = await tx
    .select()
    .from(testAnswers)
    .where(eq(testAnswers.sessionId, sessionId));

  const userAnswers = rawUserAnswers.filter((a: any) => a.userId === userId);
  const individualVector = calculateIndividualVector(userAnswers);

  await tx.insert(userPsychProfiles).values({
    userId,
    coupleId,
    sessionId,
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
  if (!couple) return { state: 'WAITING_FOR_PARTNER', personalVector: individualVector };

  const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
  if (!partnerId) {
    return { state: 'WAITING_FOR_PARTNER', personalVector: individualVector };
  }

  const [partnerProfile] = await tx
    .select()
    .from(userPsychProfiles)
    .where(eq(userPsychProfiles.userId, partnerId));

  if (!partnerProfile) {
    return {
      state: 'WAITING_FOR_PARTNER',
      personalVector: individualVector
    };
  }

  // 3. ВЕРШИНА ПИРАМИДЫ: Оба вектора на месте
  const partnerVector = {
    eSafety: Number(partnerProfile.eSafety),
    aAutonomy: Number(partnerProfile.aAutonomy),
    cCloseness: Number(partnerProfile.cCloseness),
    rRepair: Number(partnerProfile.rRepair),
    vFuture: Number(partnerProfile.vFuture)
  };

  const radarReport = calculateCoupleRadarMatrix(individualVector, partnerVector);

  await tx.insert(coupleReports).values({
    id: crypto.randomUUID(),
    sessionId,
    coupleId,
    radarTrust: radarReport.radar.trust.toFixed(2),
    radarCloseness: radarReport.radar.closeness.toFixed(2),
    radarCommunication: radarReport.radar.communication.toFixed(2),
    radarIntimacy: radarReport.radar.intimacy.toFixed(2),
    radarValues: radarReport.radar.values.toFixed(2),
    archetypeTitle: radarReport.archetype.title,
    archetypeDescription: radarReport.archetype.description,
    leadSpheres: radarReport.archetype.leadSpheres,
    blindSpots: radarReport.blindSpots,
    calculatedAt: new Date()
  }).onConflictDoUpdate({
    target: coupleReports.coupleId,
    set: {
      radarTrust: radarReport.radar.trust.toFixed(2),
      radarCloseness: radarReport.radar.closeness.toFixed(2),
      radarCommunication: radarReport.radar.communication.toFixed(2),
      radarIntimacy: radarReport.radar.intimacy.toFixed(2),
      radarValues: radarReport.radar.values.toFixed(2),
      archetypeTitle: radarReport.archetype.title,
      archetypeDescription: radarReport.archetype.description,
      leadSpheres: radarReport.archetype.leadSpheres,
      blindSpots: radarReport.blindSpots,
      calculatedAt: new Date()
    }
  });

  return {
    state: 'COUPLE_HARMONY_READY',
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
