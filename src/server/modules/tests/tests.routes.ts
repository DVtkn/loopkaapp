import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../../shared/middleware/validation.ts";
import { requireAuth, AuthenticatedRequest } from "../../shared/middleware/auth.middleware.ts";
import { requirePairOwnership } from "../../shared/middleware/requirePairOwnership.ts";
import { submitTestAnswer, atomicSubmitTestAnswers } from "./tests.service.ts";
import { getSphereByTestId } from "../../shared/tests.registry.ts";
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

testsRouter.get("/overview", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userLogin = req.user?.login;
    if (!userLogin) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }

    const statuses = await getTestsStatusForUser(userLogin);
    // Маппим сферу через реестр
    const testsWithSphere = statuses.map((s) => ({
      ...s,
      sphere: getSphereByTestId(s.testId) || "unknown",
    }));

    // Маппим в формат контрактного ответа
    const overview = {
      totalTests: statuses.length,
      myCompletedCount: statuses.filter((s) => s.isCompletedByMe).length,
      partnerCompletedCount: statuses.filter((s) => s.isCompletedByPartner).length,
      isCoupleReportReady: statuses.every(
        (s) => s.isCompletedByMe && s.isCompletedByPartner
      ),
      tests: testsWithSphere.map((s) => ({
        id: s.testId,
        sphere: s.sphere,
        isCompletedByMe: s.isCompletedByMe,
        isCompletedByPartner: s.isCompletedByPartner,
        myDraft: null,
      })),
    };

    return res.status(200).json({
      success: true,
      ...overview,
    });
  } catch (err) {
    logger.error("Ошибка получения обзора тестов", err);
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