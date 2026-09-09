import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { db, isSqlConfigured } from "../../db/client.ts";
import { testSessions, testAnswers, couples, coupleData, users } from "../../db/schema.ts";
import { logger } from "../../shared/utils/logger.ts";
import { DatabaseUnavailableError } from "../../shared/errors/index.ts";
import { getCoupleData, saveCoupleData } from "../../services/storageService.ts";
import { sendSSEEventToUser } from "../../shared/utils/sse.ts";

export interface SubmitAnswerParams {
  sessionId?: string;
  testId: string;
  coupleId: string;
  userLogin: string;
  questionId: string;
  selectedValue: number;
  expectedQuestionsCount?: number;
}

export async function submitTestAnswer(params: SubmitAnswerParams) {
  const {
    testId,
    coupleId,
    userLogin,
    questionId,
    selectedValue,
    expectedQuestionsCount = 15,
  } = params;

  const isProd = process.env.NODE_ENV === "production";

  if (isProd && (!isSqlConfigured() || !db)) {
    throw new DatabaseUnavailableError();
  }

  // If SQL is available, execute with pessimistic transaction
  if (isSqlConfigured() && db) {
    try {
      return await db.transaction(async (tx) => {
        // 1. Find or create active session
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

        // 2. Find user UUID or fallback to userLogin
        const [u] = await tx.select().from(users).where(eq(users.login, userLogin));
        const userId = u ? u.id : userLogin;

        // 3. Atomically upsert answer
        const answerId = crypto.randomUUID();
        await tx
          .insert(testAnswers)
          .values({
            id: answerId,
            sessionId: session.id,
            userId,
            questionId,
            selectedValue,
          })
          .onConflictDoUpdate({
            target: [testAnswers.sessionId, testAnswers.userId, testAnswers.questionId],
            set: { selectedValue },
          });

        // 4. Check completion count by both partners
        const participantsProgress = await tx
          .select({
            userId: testAnswers.userId,
            count: sql<number>`count(*)`,
          })
          .from(testAnswers)
          .where(eq(testAnswers.sessionId, session.id))
          .groupBy(testAnswers.userId);

        const bothPartnersCompleted =
          participantsProgress.length === 2 &&
          participantsProgress.every((p) => Number(p.count) >= expectedQuestionsCount);

        if (!bothPartnersCompleted) {
          return {
            status: "waiting_for_partner",
            sessionId: session.id,
            completedCount: participantsProgress.length,
          };
        }

        // 5. Close session atomically
        await tx
          .update(testSessions)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(testSessions.id, session.id));

        // 6. Award +150 XP on server side in couple_data / couples
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
        };
      });
    } catch (txErr) {
      if (isProd) throw txErr;
      logger.warn("Transaction failed in dev mode, returning fallback", { coupleId }, txErr);
      return { status: "waiting_for_partner", allFinished: false };
    }
  }

  // Fallback in dev without SQL
  return { status: "recorded_locally", allFinished: false };
}
