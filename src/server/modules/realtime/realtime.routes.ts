import { Router } from "express";
import { validateBody } from "../../shared/middleware/validation.ts";
import { requireAuth, AuthenticatedRequest } from "../../shared/middleware/auth.middleware.ts";
import { touchEventSchema } from "../../shared/validators/touch.validator.ts";
import {
  sendQuickTouch,
  getUserTouches,
  registerSSEClient,
  removeSSEClient,
  pushSubscriptions,
  handleHeartbeat,
  getEventsPoll,
} from "./realtime.service.ts";
import { logger } from "../../shared/utils/logger.ts";

export const realtimeRouter = Router();

// Heartbeat endpoint for Vercel Serverless (client pings every 25-30s)
realtimeRouter.post("/heartbeat", async (req: AuthenticatedRequest, res) => {
  try {
    const login = req.user?.login || req.body?.login;
    if (!login) {
      return res.status(400).json({ error: "Не указан логин" });
    }
    const result = await handleHeartbeat(login);
    return res.json(result);
  } catch (err) {
    logger.error("Ошибка обработки heartbeat", err);
    return res.status(500).json({ error: "Ошибка heartbeat" });
  }
});

// Smart Polling endpoint for Vercel Serverless (client polls every 2-3s in active tab)
realtimeRouter.get("/events-poll", async (req: AuthenticatedRequest, res) => {
  try {
    const login = (req.user?.login || req.query?.login || "") as string;
    if (!login) {
      return res.status(400).json({ error: "Не указан логин" });
    }
    const result = await getEventsPoll({
      login,
      coupleId: req.query?.coupleId as string,
      lastEventId: req.query?.lastEventId as string,
      since: req.query?.since as string,
    });
    return res.json(result);
  } catch (err) {
    logger.error("Ошибка опроса событий events-poll", err);
    return res.status(500).json({ error: "Ошибка опроса событий" });
  }
});

// Endpoint for sending a quick touch action to partner
realtimeRouter.post("/touch", requireAuth, validateBody(touchEventSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await sendQuickTouch(req.body);
    return res.json(result);
  } catch (err) {
    logger.error("Ошибка отправки быстрого касания", err);
    return res.status(500).json({ error: "Ошибка отправки касания" });
  }
});

// Endpoint for fetching recent touches for a user (polling fallback)
realtimeRouter.get("/touches/:login", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const touches = getUserTouches(req.params.login);
    return res.json({ touches });
  } catch (err) {
    logger.error("Ошибка загрузки касаний", err);
    return res.status(500).json({ error: "Ошибка загрузки касаний" });
  }
});

// Server-Sent Events (SSE) stream for instant real-time delivery (<50ms)
realtimeRouter.get("/events-stream/:login", requireAuth, (req: AuthenticatedRequest, res) => {
  const login = String(req.params.login || "").toLowerCase().replace(/^@/, "");

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  res.write(": connected\n\n");
  registerSSEClient(login, res);

  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeSSEClient(login, res);
  });
});

export const pushRouter = Router();

pushRouter.post("/subscribe", requireAuth, (req, res) => {
  const { subscription, partnerId, coupleId } = req.body;
  if (subscription) {
    pushSubscriptions.push({
      subscription,
      partnerId,
      coupleId,
      subscribedAt: new Date().toISOString(),
    });
    logger.info("Новая подписка на push-уведомления зарегистрирована", { coupleId });
  }
  return res.json({ status: "subscribed", count: pushSubscriptions.length });
});

pushRouter.post("/send-test", requireAuth, (req, res) => {
  const { title, body } = req.body;
  return res.json({
    status: "dispatched",
    title: title || "Loop • Внимание партнёра",
    body: body || "Тестовое уведомление доставлено.",
  });
});
