import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { sql } from "drizzle-orm";

import { db, createPool, isSqlConfigured } from "./db/client";
import { users, pairRequests, coupleData, chatMessages, aiInsights, relationshipMetrics } from "./db/schema";
import { config } from "./config";
import { logger } from "./shared/utils/logger";
import { callGroqChat } from "./modules/chat/chat.service";
import { errorHandler } from "./shared/middleware/errorHandler";
import { writeEmergencyFile } from "./services/storageService";

import { authRouter } from "./modules/auth/auth.routes";
import { pairingRouter } from "./modules/pairing/pairing.routes";
import { coupleRouter } from "./modules/couple-data/couple.routes";
import { chatRouter, aiRouter } from "./modules/chat/chat.routes";
import { analyticsRouter } from "./modules/analytics/analytics.routes";
import { photoRouter } from "./modules/photos/photos.routes";
import { realtimeRouter, pushRouter } from "./modules/realtime/realtime.routes";
import { testsRouter } from "./modules/tests/tests.routes";

export { logger, callGroqChat };

const app = express();

// Database schema initialization & indexes creation
export async function initDatabase() {
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
        created_at text NOT NULL,
        updated_at text NOT NULL,
        data_version integer NOT NULL DEFAULT 1
      );
      CREATE INDEX IF NOT EXISTS users_login_idx ON users(login);

      CREATE TABLE IF NOT EXISTS pair_requests (
        id text PRIMARY KEY,
        from_login text NOT NULL,
        to_login text NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        created_at text NOT NULL,
        updated_at text NOT NULL
      );
      CREATE INDEX IF NOT EXISTS pair_requests_to_login_idx ON pair_requests(to_login);
      CREATE INDEX IF NOT EXISTS pair_requests_from_login_idx ON pair_requests(from_login);

      CREATE TABLE IF NOT EXISTS couple_data (
        pair_key text PRIMARY KEY,
        user1_login text NOT NULL,
        user2_login text NOT NULL,
        data jsonb NOT NULL,
        version integer NOT NULL DEFAULT 1,
        updated_at text NOT NULL,
        updated_by text NOT NULL
      );
      CREATE INDEX IF NOT EXISTS couple_data_users_idx ON couple_data(user1_login, user2_login);

      CREATE TABLE IF NOT EXISTS couple_events (
        id text PRIMARY KEY,
        pair_key text NOT NULL,
        event_type text NOT NULL,
        sender_login text NOT NULL,
        payload jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at text NOT NULL
      );
      CREATE INDEX IF NOT EXISTS couple_events_pair_created_idx ON couple_events(pair_key, created_at DESC);

      CREATE TABLE IF NOT EXISTS chat_messages (
        id text PRIMARY KEY,
        sender_login text NOT NULL,
        recipient_login text NOT NULL,
        text text NOT NULL,
        created_at text NOT NULL
      );
      CREATE INDEX IF NOT EXISTS chat_messages_sender_recipient_idx ON chat_messages(sender_login, recipient_login);

      CREATE TABLE IF NOT EXISTS relationship_metrics (
        id text PRIMARY KEY,
        pair_key text NOT NULL,
        recorded_at text NOT NULL,
        pulse integer NOT NULL DEFAULT 70,
        sync_score integer NOT NULL DEFAULT 50,
        activity_count integer NOT NULL DEFAULT 0,
        metrics jsonb NOT NULL DEFAULT '{}'::jsonb
      );
      CREATE INDEX IF NOT EXISTS relationship_metrics_pair_recorded_idx ON relationship_metrics(pair_key, recorded_at DESC);

      CREATE TABLE IF NOT EXISTS ai_insights (
        id text PRIMARY KEY,
        pair_key text NOT NULL,
        insight_type text NOT NULL,
        content jsonb NOT NULL,
        priority text NOT NULL DEFAULT 'medium',
        is_read boolean NOT NULL DEFAULT false,
        created_at text NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ai_insights_pair_created_idx ON ai_insights(pair_key, created_at DESC);

      CREATE TABLE IF NOT EXISTS couple_photos (
        id text PRIMARY KEY,
        pair_key text NOT NULL,
        uploader_login text NOT NULL,
        mime_type text NOT NULL,
        file_size integer NOT NULL,
        data bytea NOT NULL,
        created_at text NOT NULL
      );
      CREATE INDEX IF NOT EXISTS couple_photos_pair_created_idx ON couple_photos(pair_key, created_at DESC);
    `);
    logger.info("Таблицы и индексы базы данных успешно проверены/созданы в PostgreSQL");
  } catch (err: unknown) {
    if (isProd) {
      const errorObj = err instanceof Error ? { message: err.message, stack: err.stack } : err;
      logger.error("КРИТИЧЕСКАЯ ОШИБКА инициализации таблиц PostgreSQL в production. Запуск остановлен.", { error: errorObj });
      throw err;
    } else {
      const errorObj = err instanceof Error ? { message: err.message, stack: err.stack } : err;
      logger.warn("Ошибка при проверке/создании таблиц PostgreSQL, переключаемся на аварийный режим:", { error: errorObj });
    }
  }
}

// Lazy/On-demand DB check for serverless
let dbInitPromise: Promise<void> | null = null;
export function ensureDatabaseInitialized(): Promise<void> {
  if (!dbInitPromise) {
    dbInitPromise = initDatabase().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}

// Middleware: ensure DB is initialized before processing API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health") {
    try {
      await ensureDatabaseInitialized();
    } catch (err) {
      logger.error("Database initialization failed during request:", err);
      return res.status(503).json({
        error: "База данных временно недоступна при запуске. Пожалуйста, повторите попытку через несколько секунд.",
      });
    }
  }
  next();
});

// Trust proxy for secure headers behind proxies/Vercel/Cloud Run
app.set("trust proxy", 1);

// 1. SECURITY & MIDDLEWARE
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https://*"],
        connectSrc: ["'self'", "https://*", "wss://*"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      // Allow localhost in development
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }
      // Allow any Vercel preview or production deployment domain
      if (origin.endsWith(".vercel.app") || origin.includes("ais-") || origin.includes("google.com")) {
        return callback(null, true);
      }
      // Otherwise allow to avoid blocking valid clients
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 2. OBSERVABILITY & MODULAR API ROUTER
const apiRouter = express.Router();

apiRouter.get("/health", async (req, res) => {
  const memory = process.memoryUsage();
  let dbStatus = "not_configured";
  let dbLatencyMs: number | null = null;

  if (isSqlConfigured() && db) {
    const start = Date.now();
    try {
      await db.execute(sql`SELECT 1`);
      dbLatencyMs = Date.now() - start;
      dbStatus = "connected";
    } catch (err: unknown) {
      dbStatus = "error";
      const errorObj = err instanceof Error ? { message: err.message } : err;
      logger.error("Health check DB ping failed:", { error: errorObj });
    }
  }

  const isHealthy = dbStatus === "connected" || dbStatus === "not_configured";
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json({
    status: isHealthy ? "ok" : "degraded",
    environment: config.nodeEnv,
    version: "2.1.0",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    system: {
      memoryRssMb: Math.round(memory.rss / 1024 / 1024),
      memoryHeapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
    },
  });
});

// Admin endpoint for tests / staging resets
apiRouter.post("/admin/clear-all-data", async (req, res) => {
  try {
    if (isSqlConfigured() && db) {
      try {
        await db.delete(chatMessages);
        await db.delete(coupleData);
        await db.delete(pairRequests);
        await db.delete(aiInsights);
        await db.delete(relationshipMetrics);
        await db.delete(users);
      } catch (err: unknown) {
        logger.warn("DB clear tables warning:", { error: String(err) });
      }
    }
    writeEmergencyFile({ users: {}, pairRequests: [], coupleData: {}, chatMessages: [], rateLimits: {}, photos: [] });
    return res.json({ ok: true });
  } catch (err: unknown) {
    logger.error("Failed to clear data:", err);
    return res.status(500).json({ error: "Failed to clear data" });
  }
});

// Client observability error logger
apiRouter.post("/log-error", (req, res) => {
  try {
    import("fs").then((fs) => {
      fs.appendFileSync("client-errors.log", JSON.stringify(req.body) + "\n");
    }).catch(() => {});
  } catch (err: unknown) {
    logger.error("Failed to write to client-errors.log:", err);
  }
  return res.json({ ok: true });
});

// 3. MOUNT MODULAR SUB-ROUTERS
apiRouter.use("/auth", authRouter);
apiRouter.use("/pair", pairingRouter);
apiRouter.use("/couple", coupleRouter);
apiRouter.use("/couple", realtimeRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/tests", testsRouter);
apiRouter.use("/photos", photoRouter);
apiRouter.use("/push", pushRouter);

// Universal mount: allows both /api/* and /* (handles Vercel rewrite prefix stripping)
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
