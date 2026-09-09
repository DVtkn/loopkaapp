import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import { sql } from "drizzle-orm";

import { db, createPool, isSqlConfigured } from "./db/client.ts";
import { users, pairRequests, coupleData, chatMessages, aiInsights, relationshipMetrics } from "./db/schema.ts";
import { config } from "./config.ts";
import { logger } from "./shared/utils/logger.ts";
import { callGroqChat } from "./modules/chat/chat.service.ts";
import { errorHandler } from "./shared/middleware/errorHandler.ts";
import { writeEmergencyFile } from "./services/storageService.ts";

import { authRouter } from "./modules/auth/auth.routes.ts";
import { pairingRouter } from "./modules/pairing/pairing.routes.ts";
import { coupleRouter } from "./modules/couple-data/couple.routes.ts";
import { chatRouter, aiRouter } from "./modules/chat/chat.routes.ts";
import { analyticsRouter } from "./modules/analytics/analytics.routes.ts";
import { photoRouter } from "./modules/photos/photos.routes.ts";
import { realtimeRouter, pushRouter } from "./modules/realtime/realtime.routes.ts";
import { testsRouter } from "./modules/tests/tests.routes.ts";

export { logger, callGroqChat };

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Database schema initialization & indexes creation
async function initDatabase() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isSqlConfigured()) {
    if (isProd) {
      const errMsg = "FATAL: В production-режиме (NODE_ENV=production) обязательно наличие переменной DATABASE_URL. Запуск сервера отклонён для предотвращения потери данных.";
      logger.error(errMsg);
      throw new Error(errMsg);
    }
    logger.info("Cloud SQL / PostgreSQL не настроен — используется резервное хранилище /data/db_store.json для dev-режима");
    return;
  }
  try {
    const pool = createPool();
    if (!pool) {
      if (isProd) {
        throw new Error("Не удалось создать пул подключений к PostgreSQL в production.");
      }
      return;
    }
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        login text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        name text NOT NULL,
        gender text,
        avatar_emoji text NOT NULL DEFAULT '✨',
        partner_login text,
        paired_at text,
        start_date text,
        city text,
        love_language text,
        attachment_style text,
        current_mood jsonb,
        last_active_at text,
        created_at text NOT NULL
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS gender text;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at text;

      CREATE TABLE IF NOT EXISTS pair_requests (
        id text PRIMARY KEY,
        from_login text NOT NULL,
        from_name text NOT NULL,
        from_avatar text NOT NULL,
        to_login text NOT NULL,
        status text NOT NULL,
        created_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS couple_data (
        id text PRIMARY KEY,
        data jsonb NOT NULL,
        last_updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id text PRIMARY KEY,
        couple_id text NOT NULL,
        sender_login text NOT NULL,
        role text NOT NULL,
        content text NOT NULL,
        is_read boolean DEFAULT false,
        created_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS relationship_metrics (
        id text PRIMARY KEY,
        couple_id text NOT NULL,
        metric_date text NOT NULL,
        radar_scores jsonb NOT NULL,
        mood_average real,
        mood_entries_count integer DEFAULT 0,
        interaction_count integer DEFAULT 0,
        quiz_completed boolean DEFAULT false,
        streak_days integer DEFAULT 0,
        created_at text NOT NULL,
        UNIQUE (couple_id, metric_date)
      );

      CREATE TABLE IF NOT EXISTS ai_insights (
        id text PRIMARY KEY,
        couple_id text NOT NULL,
        type text NOT NULL,
        content jsonb NOT NULL,
        period_start text NOT NULL,
        period_end text NOT NULL,
        created_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS photos (
        id text PRIMARY KEY,
        couple_id text NOT NULL,
        uploader_login text NOT NULL,
        image_bytes bytea NOT NULL,
        mime_type text NOT NULL,
        caption text,
        width integer,
        height integer,
        created_at timestamp with time zone NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS test_sessions (
        id text PRIMARY KEY,
        test_id text NOT NULL,
        couple_id text NOT NULL,
        test_class text NOT NULL DEFAULT 'couple',
        status text NOT NULL DEFAULT 'in_progress',
        completed_at timestamp with time zone,
        created_at timestamp with time zone NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS test_answers (
        id text PRIMARY KEY,
        session_id text NOT NULL,
        user_id text NOT NULL,
        question_id text NOT NULL,
        selected_value integer NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT NOW(),
        UNIQUE (session_id, user_id, question_id)
      );

      CREATE TABLE IF NOT EXISTS couple_reports (
        id text PRIMARY KEY,
        couple_id text NOT NULL,
        compatibility_score integer NOT NULL,
        archetype_title text NOT NULL,
        summary text NOT NULL,
        report_payload jsonb NOT NULL,
        generated_at timestamp with time zone NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS date_events (
        id text PRIMARY KEY,
        couple_id text NOT NULL,
        title text NOT NULL,
        description text,
        location text,
        event_date text NOT NULL,
        status text NOT NULL DEFAULT 'planned',
        created_at timestamp with time zone NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS care_notes (
        id text PRIMARY KEY,
        couple_id text NOT NULL,
        author_login text NOT NULL,
        target_login text NOT NULL,
        content text NOT NULL,
        category text NOT NULL DEFAULT 'general',
        is_completed boolean NOT NULL DEFAULT false,
        created_at timestamp with time zone NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS time_capsules (
        id text PRIMARY KEY,
        couple_id text NOT NULL,
        author_login text NOT NULL,
        title text NOT NULL,
        content text NOT NULL,
        open_at text NOT NULL,
        is_opened boolean NOT NULL DEFAULT false,
        created_at timestamp with time zone NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id text PRIMARY KEY,
        user_login text NOT NULL,
        couple_id text,
        subscription jsonb NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT NOW()
      );

      -- Индексы производительности (Drizzle & PostgreSQL)
      CREATE INDEX IF NOT EXISTS users_partner_login_idx ON users(partner_login);
      CREATE INDEX IF NOT EXISTS pair_requests_from_to_idx ON pair_requests(from_login, to_login);
      CREATE INDEX IF NOT EXISTS pair_requests_to_login_idx ON pair_requests(to_login);
      CREATE INDEX IF NOT EXISTS pair_requests_status_idx ON pair_requests(status);
      CREATE INDEX IF NOT EXISTS chat_messages_couple_created_idx ON chat_messages(couple_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS chat_messages_sender_login_idx ON chat_messages(sender_login);
      CREATE INDEX IF NOT EXISTS ai_insights_couple_created_idx ON ai_insights(couple_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS photos_couple_id_idx ON photos(couple_id);
      CREATE INDEX IF NOT EXISTS photos_created_at_idx ON photos(created_at DESC);
      CREATE INDEX IF NOT EXISTS test_sessions_couple_id_idx ON test_sessions(couple_id);
      CREATE INDEX IF NOT EXISTS test_sessions_test_id_idx ON test_sessions(test_id);
      CREATE INDEX IF NOT EXISTS test_answers_session_idx ON test_answers(session_id);
      CREATE INDEX IF NOT EXISTS test_answers_user_idx ON test_answers(user_id);
      CREATE INDEX IF NOT EXISTS couple_reports_couple_id_idx ON couple_reports(couple_id);
      CREATE INDEX IF NOT EXISTS date_events_couple_id_idx ON date_events(couple_id);
      CREATE INDEX IF NOT EXISTS care_notes_couple_id_idx ON care_notes(couple_id);
      CREATE INDEX IF NOT EXISTS time_capsules_couple_id_idx ON time_capsules(couple_id);
      CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions(user_login);
    `);
    logger.info("Таблицы и индексы базы данных успешно проверены/созданы в PostgreSQL");
  } catch (err: unknown) {
    logger.error("Ошибка инициализации базы данных в PostgreSQL", err);
  }
}

// 1. SECURITY & MIDDLEWARE
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 2. OBSERVABILITY: HEALTH CHECK
app.get("/api/health", async (req, res) => {
  const memory = process.memoryUsage();
  let dbStatus = "not_configured";
  let dbLatencyMs: number | null = null;
  let isDegraded = false;

  if (isSqlConfigured() && db) {
    const dbStart = Date.now();
    try {
      await db.execute(sql`SELECT 1`);
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = "connected";
    } catch (err: unknown) {
      dbStatus = "disconnected";
      isDegraded = true;
      logger.error("Health check: сбой проверки связи с базой данных", err);
    }
  }

  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

  res.status(isDegraded ? 503 : 200).json({
    status: isDegraded ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    uptime: uptimeFormatted,
    uptimeSeconds,
    environment: config.nodeEnv,
    database: {
      configured: isSqlConfigured(),
      status: dbStatus,
      ...(dbLatencyMs !== null ? { latencyMs: dbLatencyMs } : {}),
    },
    memory: {
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
    },
  });
});

// Admin endpoint for tests / staging resets
app.post("/api/admin/clear-all-data", async (req, res) => {
  try {
    if (isSqlConfigured() && db) {
      try {
        await db.delete(users);
        await db.delete(pairRequests);
        await db.delete(coupleData);
        await db.delete(chatMessages);
        await db.delete(relationshipMetrics);
        await db.delete(aiInsights);
      } catch (err: unknown) {
        logger.warn("Сбой очистки данных в SQL", undefined, err);
      }
    }
    writeEmergencyFile({ users: {}, pairRequests: [], coupleData: {}, chatMessages: [] });
    logger.info("Все данные приложения очищены через административный запрос");
    return res.json({
      status: "ok",
      message: "Все учётные записи и данные успешно очищены.",
    });
  } catch (err: unknown) {
    logger.error("Ошибка очистки данных", err);
    return res.status(500).json({ error: "Не удалось очистить данные" });
  }
});

// Client observability error logger
app.post("/api/log-error", (req, res) => {
  try {
    fs.appendFileSync("client-errors.log", JSON.stringify(req.body) + "\n");
  } catch (err: unknown) {
    logger.warn("Не удалось записать в client-errors.log", undefined, err);
  }
  logger.error("Клиентская ошибка интерфейса (UI/PWA)", null, {
    body: req.body,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  return res.json({ ok: true });
});

// 3. MOUNT MODULAR API ROUTERS
app.use("/api/auth", authRouter);
app.use("/api/pair", pairingRouter);
app.use("/api/couple", coupleRouter);
app.use("/api/couple", realtimeRouter);
app.use("/api/chat", chatRouter);
app.use("/api/ai", aiRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/tests", testsRouter);
app.use("/api/photos", photoRouter);
app.use("/api/push", pushRouter);

// Global Error Handler
app.use(errorHandler);

// 4. VITE / STATIC SPA SERVING
export async function startServer() {
  await initDatabase();

  const isProd = config.nodeEnv === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Loop backend listening on port ${PORT} [${config.nodeEnv}]`);
  });
}

export default app;
