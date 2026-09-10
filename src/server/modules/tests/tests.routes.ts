import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../../shared/middleware/validation.ts";
import { requireAuth, AuthenticatedRequest } from "../../shared/middleware/auth.middleware.ts";
import { requirePairOwnership } from "../../shared/middleware/requirePairOwnership.ts";
import { submitTestAnswer, getTestsStatusForUser, CATALOG_TEST_IDS, EXPECTED_QUESTIONS, saveTestDraft, getTestDraft, clearTestDraft } from "./tests.service.ts";
import { logger } from "../../shared/utils/logger.ts";

export const testsRouter = Router();

testsRouter.get("/status", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userLogin = req.user?.login;
    if (!userLogin) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }

    const statuses = await getTestsStatusForUser(userLogin);
    return res.status(200).json({
      success: true,
      statuses,
    });
  } catch (err) {
    logger.error("Ошибка получения статусов тестов", err);
    next(err);
  }
});

testsRouter.get("/catalog", requireAuth, async (_req, res) => {
  return res.status(200).json({
    success: true,
    testIds: CATALOG_TEST_IDS,
    expectedQuestions: EXPECTED_QUESTIONS,
  });
});

const submitAnswerSchema = z.object({
  sessionId: z.string().optional(),
  testId: z.string().min(1),
  coupleId: z.string().min(1),
  questionId: z.string().min(1),
  selectedValue: z.union([z.number(), z.string()]).optional().default(0),
  expectedQuestionsCount: z.number().optional(),
  reactionTimeMs: z.number().nullable().optional(),
  toggleCount: z.number().optional(),
  targetType: z.string().optional(),
  rawPayload: z.any().optional(),
});

testsRouter.post(
  "/submit-answer",
  requireAuth,
  requirePairOwnership,
  validateBody(submitAnswerSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const userLogin = req.user?.login;
      if (!userLogin) {
        return res.status(401).json({ error: "Необходима авторизация" });
      }

      const result = await submitTestAnswer({
        sessionId: req.body.sessionId,
        testId: req.body.testId,
        coupleId: req.body.coupleId,
        userLogin,
        questionId: req.body.questionId,
        selectedValue: req.body.selectedValue,
        expectedQuestionsCount: req.body.expectedQuestionsCount,
        reactionTimeMs: req.body.reactionTimeMs,
        toggleCount: req.body.toggleCount,
        targetType: req.body.targetType,
        rawPayload: req.body.rawPayload,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      logger.error("Ошибка фиксации ответа теста", err);
      next(err);
    }
  }
);

import { saveTestDraft, getTestDraft } from "./tests.service.ts";

const saveDraftSchema = z.object({
  testId: z.string().min(1),
  currentQuestionIndex: z.number().int().min(0),
  answers: z.any()
});

testsRouter.post("/draft", requireAuth, validateBody(saveDraftSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Необходима авторизация" });
    
    await saveTestDraft(userId, req.body.testId, req.body.currentQuestionIndex, req.body.answers);
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error("Ошибка сохранения черновика", err);
    next(err);
  }
});

testsRouter.get("/draft/:testId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Необходима авторизация" });
    
    const draft = await getTestDraft(userId, req.params.testId);
    return res.status(200).json({ success: true, draft });
  } catch (err) {
    logger.error("Ошибка получения черновика", err);
    next(err);
  }
});

testsRouter.delete("/draft/:testId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Необходима авторизация" });
    
    await clearTestDraft(userId, req.params.testId);
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error("Ошибка удаления черновика", err);
    next(err);
  }
});
