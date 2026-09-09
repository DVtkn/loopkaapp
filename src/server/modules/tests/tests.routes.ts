import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../../shared/middleware/validation.ts";
import { requireAuth, AuthenticatedRequest } from "../../shared/middleware/auth.middleware.ts";
import { requirePairOwnership } from "../../shared/middleware/requirePairOwnership.ts";
import { submitTestAnswer } from "./tests.service.ts";
import { logger } from "../../shared/utils/logger.ts";

export const testsRouter = Router();

const submitAnswerSchema = z.object({
  sessionId: z.string().optional(),
  testId: z.string().min(1),
  coupleId: z.string().min(1),
  questionId: z.string().min(1),
  selectedValue: z.number(),
  expectedQuestionsCount: z.number().optional(),
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
