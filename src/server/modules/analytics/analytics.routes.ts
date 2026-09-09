import { Router } from "express";
import { requireAuth, AuthenticatedRequest } from "../../shared/middleware/auth.middleware.ts";
import { requirePairOwnership } from "../../shared/middleware/requirePairOwnership.ts";
import {
  getTrends,
  fetchAiInsights,
  generateWeeklyInsight,
} from "./analytics.service.ts";
import { logger } from "../../shared/utils/logger.ts";

export const analyticsRouter = Router();

analyticsRouter.get("/trends/:coupleId", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { coupleId } = req.params;
    const days = parseInt(req.query.days as string, 10) || 30;
    const trends = await getTrends(coupleId, days);
    return res.json(trends);
  } catch (err) {
    logger.error("Ошибка получения аналитики трендов", err);
    return res.status(500).json({ error: "Не удалось получить аналитику трендов" });
  }
});

analyticsRouter.get("/insights/:coupleId", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { coupleId } = req.params;
    const insights = await fetchAiInsights(coupleId);
    return res.json({ insights });
  } catch (err) {
    logger.error("Ошибка получения инсайтов ИИ", err);
    return res.status(500).json({ error: "Не удалось получить инсайты" });
  }
});

analyticsRouter.post("/insights/generate", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { coupleId } = req.body;
    const insight = await generateWeeklyInsight(coupleId, req.body.contextData || {});
    return res.json({ insight });
  } catch (err) {
    logger.error("Ошибка генерации недельного инсайта", err);
    return res.status(500).json({ error: "Ошибка генерации инсайта" });
  }
});
