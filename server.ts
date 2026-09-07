import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import cors from "cors";
import { eq, or, desc, and, sql } from "drizzle-orm";

// Internal modules
import { db, createPool, isSqlConfigured } from "./src/db/index.ts";
import { users, pairRequests, coupleData, chatMessages, aiInsights, relationshipMetrics } from "./src/db/schema.ts";
import { recordDailyMetrics, getTrends } from "./src/server/analytics.ts";
import { generateWeeklyInsight } from "./src/server/insights.ts";
import { logger } from "./src/server/logger.ts";
import { config } from "./src/server/config.ts";
import {
  registerLimiter,
  loginLimiter,
  aiLimiter,
  pairLimiter,
} from "./src/server/middleware/rateLimit.ts";
import {
  validateBody,
  validateParams,
} from "./src/server/middleware/validation.ts";
import {
  registerSchema,
  loginRequestSchema,
  changePasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  pairRequestSchema,
  pairAcceptSchema,
  pairRejectSchema,
  pairDisconnectSchema,
  coupleSyncSchema,
  chatMessageCreateSchema,
  aiChatMessageSchema,
  aiReportSchema,
  aiDateIdeaSchema,
} from "./src/server/schemas.ts";
import {
  requireAuth,
  generateToken,
  AuthenticatedRequest,
} from "./src/server/middleware/auth.ts";
import {
  getPairKey,
  isUserInCouple,
  requirePairOwnership,
} from "./src/server/middleware/pairOwnership.ts";
import {
  findUserByLogin,
  findUserByQuery,
  upsertUser,
  getCoupleData,
  saveCoupleData,
  readEmergencyFile,
  writeEmergencyFile,
} from "./src/server/services/storageService.ts";
import {
  acceptPair,
  disconnectPair,
  createPairRequest,
} from "./src/server/services/pairService.ts";
import {
  callGroqChat,
  generateSmartPsychologistReply,
  saveAIMessageToDb,
} from "./src/server/aiService.ts";
import { DbUser, toSafeUser } from "./src/server/types.ts";

// Re-export logger and callGroqChat for backward compatibility with insights.ts
export { logger, callGroqChat };

const app = express();
const PORT = 3000;

// ==========================================
// 1. SECURITY & INFRASTRUCTURE MIDDLEWARE
// ==========================================
// Helmet configured for security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", ...(process.env.APP_URL ? [process.env.APP_URL] : [])],
        imgSrc: ["'self'", "data:", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        fontSrc: ["'self'", "data:"],
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    xFrameOptions: false,
  })
);

// CORS handling with support for dev, preview domains, and localhost
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const appUrl = process.env.APP_URL;
      const allowed = [...config.allowedOrigins, appUrl];
      
      if (
        allowed.includes(origin) ||
        origin.includes("run.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Payload sanitizer against injection
function sanitizeString(str: unknown): unknown {
  if (typeof str !== "string") return str;
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizePayload(obj: any): any {
  if (typeof obj === "string") return sanitizeString(obj);
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizePayload(item));
  }
  if (obj !== null && typeof obj === "object") {
    const sanitized: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizePayload(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizePayload(req.body);
  }
  next();
});

// Request Duration & Status Logging Middleware (Observability)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith("/api")) {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, {
        status: res.statusCode,
        durationMs: duration,
        ip: req.ip,
      });
    }
  });
  next();
});

// In-memory push subscription store (with optional VAPID dispatch)
interface PushSubscriptionRecord {
  subscription: any;
  partnerId?: string;
  coupleId?: string;
  subscribedAt: string;
}
const pushSubscriptions: PushSubscriptionRecord[] = [];

// Password verification with timing-attack mitigation
const DUMMY_HASH = "$2b$10$e8I8/g4P7s.Sg43L7kE8.eL39j34uV658m9m3m3m3m3m3m3m3m3m3";
async function verifyPassword(inputPass: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    return await bcrypt.compare(inputPass, storedHash);
  }
  return false;
}

// Database schema initialization & indexes creation
async function initDatabase() {
  if (!isSqlConfigured()) {
    logger.info("Cloud SQL не настроен — используется резервное постоянное хранилище /data/db_store.json");
    return;
  }
  try {
    const pool = createPool();
    if (!pool) return;
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

      -- Индексы производительности (Drizzle & PostgreSQL)
      CREATE INDEX IF NOT EXISTS users_partner_login_idx ON users(partner_login);
      CREATE INDEX IF NOT EXISTS pair_requests_from_to_idx ON pair_requests(from_login, to_login);
      CREATE INDEX IF NOT EXISTS pair_requests_to_login_idx ON pair_requests(to_login);
      CREATE INDEX IF NOT EXISTS pair_requests_status_idx ON pair_requests(status);
      CREATE INDEX IF NOT EXISTS chat_messages_couple_created_idx ON chat_messages(couple_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS chat_messages_sender_login_idx ON chat_messages(sender_login);
      CREATE INDEX IF NOT EXISTS ai_insights_couple_created_idx ON ai_insights(couple_id, created_at DESC);
    `);
    logger.info("Таблицы и индексы базы данных успешно проверены/созданы в PostgreSQL");
  } catch (err: unknown) {
    logger.error("Ошибка инициализации базы данных в PostgreSQL", err);
  }
}

// ==========================================
// 2. OBSERVABILITY: HEALTH CHECK
// ==========================================

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

// ==========================================
// 3. AUTHENTICATION & USER MANAGEMENT
// ==========================================

app.get("/api/auth/users", async (req, res) => {
  try {
    const userMap: Record<string, any> = {};

    if (isSqlConfigured() && db) {
      try {
        const allSqlUsers = await db.select().from(users);
        for (const u of allSqlUsers) {
          userMap[u.login.toLowerCase()] = toSafeUser(u);
        }
      } catch (err: unknown) {
        logger.warn("Сбой чтения списка пользователей из SQL, чтение из файла", undefined, err);
      }
    }

    if (Object.keys(userMap).length === 0) {
      const store = readEmergencyFile();
      for (const [k, u] of Object.entries(store.users || {})) {
        if (u && typeof u === "object") {
          userMap[k.toLowerCase()] = toSafeUser(u);
        }
      }
    }

    return res.json({ users: Object.values(userMap) });
  } catch (err: unknown) {
    logger.error("Ошибка в /api/auth/users", err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

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

app.post("/api/auth/sync", async (req, res) => {
  try {
    const { accounts } = req.body;
    if (!Array.isArray(accounts)) {
      return res.status(400).json({ error: "accounts must be an array" });
    }

    for (const acc of accounts) {
      if (acc && acc.login) {
        const existing = await findUserByLogin(acc.login);
        if (!existing) {
          const now = new Date().toISOString();
          const cleanLogin = String(acc.login).toLowerCase().replace(/^@/, "");
          const passwordHash = acc.passwordHash || (await bcrypt.hash(acc.password || "password123", 10));

          await upsertUser({
            id: acc.id || crypto.randomUUID(),
            login: cleanLogin,
            passwordHash,
            name: acc.name || cleanLogin,
            gender: acc.gender || null,
            avatarEmoji: acc.avatarEmoji || "sparkles",
            partnerLogin: acc.partnerLogin ? String(acc.partnerLogin).toLowerCase() : null,
            pairedAt: acc.pairedAt || null,
            startDate: acc.startDate || null,
            city: acc.city || null,
            loveLanguage: acc.loveLanguage || null,
            attachmentStyle: acc.attachmentStyle || null,
            currentMood: acc.currentMood || null,
            lastActiveAt: now,
            createdAt: acc.createdAt || now,
          });
        }
      }
    }

    return res.json({ status: "synced" });
  } catch (err: unknown) {
    logger.error("Ошибка синхронизации аккаунтов /api/auth/sync", err);
    return res.status(500).json({ error: "Ошибка синхронизации" });
  }
});

app.post("/api/auth/register", registerLimiter, validateBody(registerSchema), async (req, res) => {
  try {
    const { login, password, name } = req.body;
    const cleanLogin = String(login).trim().toLowerCase().replace(/^@/, "");

    const existing = await findUserByLogin(cleanLogin);
    if (existing) {
      return res.status(400).json({ error: "Пользователь с таким логином уже существует" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();
    const userId = crypto.randomUUID();

    const newUser: DbUser = {
      id: userId,
      login: cleanLogin,
      passwordHash,
      name: name?.trim() || cleanLogin,
      gender: null,
      avatarEmoji: "sparkles",
      partnerLogin: null,
      pairedAt: null,
      startDate: null,
      city: null,
      loveLanguage: null,
      attachmentStyle: null,
      currentMood: null,
      lastActiveAt: now,
      createdAt: now,
    };

    await upsertUser(newUser);
    const token = generateToken(cleanLogin);
    logger.info("Новый пользователь успешно зарегистрирован", { login: cleanLogin });

    return res.status(201).json({
      token,
      user: toSafeUser(newUser),
    });
  } catch (err: unknown) {
    logger.error("Ошибка регистрации пользователя", err);
    return res.status(500).json({ error: "Ошибка при регистрации" });
  }
});

app.post("/api/auth/login", loginLimiter, validateBody(loginRequestSchema), async (req, res) => {
  try {
    const { login, password } = req.body;
    const cleanLogin = String(login).trim().toLowerCase().replace(/^@/, "");

    const user = await findUserByLogin(cleanLogin);

    // Constant-time check mitigation
    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    const match = await verifyPassword(password, user.passwordHash);
    if (!match) {
      logger.security("Неудачная попытка входа", { login: cleanLogin, ip: req.ip });
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    // Update lastActiveAt
    const now = new Date().toISOString();
    user.lastActiveAt = now;
    await upsertUser(user);

    const token = generateToken(cleanLogin);
    logger.info("Пользователь успешно вошёл в систему", { login: cleanLogin });

    return res.json({
      token,
      user: toSafeUser(user),
    });
  } catch (err: unknown) {
    logger.error("Ошибка входа пользователя", err);
    return res.status(500).json({ error: "Ошибка при авторизации" });
  }
});

app.get("/api/auth/user/:login", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const paramLogin = String(req.params.login || "").toLowerCase().replace(/^@/, "");
    const userLogin = req.user?.login;

    if (paramLogin !== userLogin) {
      return res.status(403).json({ error: "Нет доступа к чужому профилю" });
    }

    const user = await findUserByLogin(paramLogin);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    return res.json({ user: toSafeUser(user) });
  } catch (err: unknown) {
    logger.error("Ошибка получения профиля пользователя", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/api/auth/update-profile", requireAuth, validateBody(updateProfileSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const userLogin = req.user?.login;
    if (!userLogin) return res.status(401).json({ error: "Неавторизован" });

    const user = await findUserByLogin(userLogin);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const { name, gender, avatarEmoji, city, startDate, loveLanguage, attachmentStyle, currentMood } = req.body;

    if (name !== undefined) user.name = name;
    if (gender !== undefined) user.gender = gender;
    if (avatarEmoji !== undefined) user.avatarEmoji = avatarEmoji;
    if (city !== undefined) user.city = city;
    if (startDate !== undefined) user.startDate = startDate;
    if (loveLanguage !== undefined) user.loveLanguage = loveLanguage;
    if (attachmentStyle !== undefined) user.attachmentStyle = attachmentStyle;
    if (currentMood !== undefined) user.currentMood = currentMood;
    user.lastActiveAt = new Date().toISOString();

    await upsertUser(user);
    logger.info("Профиль пользователя обновлен", { login: userLogin });
    return res.json({ user: toSafeUser(user) });
  } catch (err: unknown) {
    logger.error("Ошибка обновления профиля", err);
    return res.status(500).json({ error: "Ошибка при обновлении профиля" });
  }
});

app.post("/api/auth/change-password", requireAuth, validateBody(changePasswordSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const userLogin = req.user?.login;
    if (!userLogin) return res.status(401).json({ error: "Неавторизован" });

    const user = await findUserByLogin(userLogin);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const { oldPassword, newPassword } = req.body;
    const match = await verifyPassword(oldPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: "Старый пароль указан неверно" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await upsertUser(user);

    logger.info("Пароль пользователя успешно изменен", { login: userLogin });
    return res.json({ status: "ok", message: "Пароль успешно изменён" });
  } catch (err: unknown) {
    logger.error("Ошибка смены пароля", err);
    return res.status(500).json({ error: "Ошибка сервера при смене пароля" });
  }
});

app.post("/api/auth/reset-password", validateBody(resetPasswordSchema), async (req, res) => {
  try {
    const { login, newPassword } = req.body;
    const cleanLogin = String(login).toLowerCase().replace(/^@/, "");

    const user = await findUserByLogin(cleanLogin);
    if (!user) {
      return res.status(404).json({ error: "Пользователь с таким логином не найден" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await upsertUser(user);

    logger.info("Пароль сброшен", { login: cleanLogin });
    return res.json({ status: "ok", message: "Пароль успешно сброшен" });
  } catch (err: unknown) {
    logger.error("Ошибка сброса пароля", err);
    return res.status(500).json({ error: "Ошибка при сбросе пароля" });
  }
});

// ==========================================
// 4. PAIR CONNECTION & DISCONNECT
// ==========================================

app.post("/api/pair/request", requireAuth, pairLimiter, validateBody(pairRequestSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { fromLogin, toLogin } = req.body;
    const userLogin = req.user?.login;

    if (fromLogin !== userLogin) {
      return res.status(403).json({ error: "Нельзя отправить запрос от чужого имени" });
    }
    if (fromLogin === toLogin) {
      return res.status(400).json({ error: "Нельзя связать пару с самим собой" });
    }

    const fromUser = await findUserByLogin(fromLogin);
    const toUser = await findUserByQuery(toLogin);

    if (!fromUser) return res.status(404).json({ error: "Отправитель не найден" });
    if (!toUser) return res.status(404).json({ error: "Партнёр с таким логином или именем не найден" });

    const reqObj = await createPairRequest(fromUser, toUser);
    return res.status(201).json({ request: reqObj, message: "Запрос на соединение отправлен" });
  } catch (err: unknown) {
    logger.error("Ошибка создания запроса на соединение пары", err);
    return res.status(500).json({ error: "Ошибка отправки запроса на соединение" });
  }
});

app.post("/api/pair/accept", requireAuth, validateBody(pairAcceptSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { fromLogin, toLogin } = req.body;
    const userLogin = req.user?.login;

    // The user accepting must be toLogin
    if (toLogin !== userLogin) {
      return res.status(403).json({ error: "Вы не можете принять чужой запрос" });
    }

    const { updatedMe, updatedPartner } = await acceptPair(toLogin, fromLogin);
    return res.json({
      status: "connected",
      me: updatedMe ? toSafeUser(updatedMe) : null,
      partner: updatedPartner ? toSafeUser(updatedPartner) : null,
    });
  } catch (err: unknown) {
    logger.error("Ошибка принятия запроса пары", err);
    return res.status(500).json({ error: "Ошибка соединения пары" });
  }
});

app.post("/api/pair/reject", requireAuth, validateBody(pairRejectSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { fromLogin, toLogin } = req.body;
    const userLogin = req.user?.login;

    if (toLogin !== userLogin) {
      return res.status(403).json({ error: "Нет доступа" });
    }

    if (isSqlConfigured() && db) {
      try {
        await db.delete(pairRequests).where(
          and(eq(pairRequests.fromLogin, fromLogin), eq(pairRequests.toLogin, toLogin))
        );
      } catch (err: unknown) {
        logger.warn("Сбой удаления запроса пары из SQL", undefined, err);
      }
    }

    const store = readEmergencyFile();
    if (store.pairRequests) {
      store.pairRequests = store.pairRequests.filter(
        (r) => !(r.fromLogin === fromLogin && r.toLogin === toLogin)
      );
      writeEmergencyFile(store);
    }

    return res.json({ status: "rejected" });
  } catch (err: unknown) {
    logger.error("Ошибка отклонения запроса пары", err);
    return res.status(500).json({ error: "Ошибка при отклонении" });
  }
});

app.post("/api/pair/disconnect", requireAuth, validateBody(pairDisconnectSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { login } = req.body;
    const userLogin = req.user?.login;

    if (login !== userLogin) {
      return res.status(403).json({ error: "Нет доступа к разрыву чужой пары" });
    }

    const result = await disconnectPair(login);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.json({
      status: "disconnected",
      user: result.updatedUser ? toSafeUser(result.updatedUser) : null,
    });
  } catch (err: unknown) {
    logger.error("Ошибка разъединения пары", err);
    return res.status(500).json({ error: "Ошибка разъединения пары" });
  }
});

app.get("/api/pair/status/:login", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res) => {
  try {
    const login = String(req.params.login || "").toLowerCase().replace(/^@/, "");
    const userLogin = req.user?.login;

    const user = await findUserByLogin(login);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    let partner: DbUser | undefined;
    if (user.partnerLogin) {
      partner = await findUserByLogin(user.partnerLogin);
    }

    let incoming: any[] = [];
    let outgoing: any[] = [];

    if (isSqlConfigured() && db) {
      try {
        incoming = await db.select().from(pairRequests).where(and(eq(pairRequests.toLogin, login), eq(pairRequests.status, "PENDING")));
        outgoing = await db.select().from(pairRequests).where(and(eq(pairRequests.fromLogin, login), eq(pairRequests.status, "PENDING")));
      } catch (err: unknown) {
        logger.warn("Сбой выборки pair_requests из SQL, чтение из файла", undefined, err);
      }
    }

    if (incoming.length === 0 && outgoing.length === 0) {
      const store = readEmergencyFile();
      const allReqs = store.pairRequests || [];
      incoming = allReqs.filter((r) => r.toLogin === login && r.status === "PENDING");
      outgoing = allReqs.filter((r) => r.fromLogin === login && r.status === "PENDING");
    }

    return res.json({
      paired: !!user.partnerLogin,
      partner: partner ? toSafeUser(partner) : null,
      incomingRequests: incoming,
      outgoingRequests: outgoing,
    });
  } catch (err: unknown) {
    logger.error("Ошибка проверки статуса пары", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ==========================================
// 5. COUPLE DATA SYNC & CHAT
// ==========================================

app.post("/api/couple/sync", requireAuth, requirePairOwnership, validateBody(coupleSyncSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { login1, login2, payload } = req.body;

    const key = [login1, login2].sort().join("_");
    await saveCoupleData(key, payload);

    // Analytics: Record daily metrics
    try {
      const todayDate = new Date().toISOString().split("T")[0];
      await recordDailyMetrics(key, todayDate, payload);
    } catch (err: unknown) {
      logger.warn("Сбой записи ежедневных метрик в analytics", { coupleId: key }, err);
    }

    return res.json({ status: "synced", key, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    logger.error("Ошибка синхронизации данных пары", err);
    return res.status(500).json({ error: "Ошибка сохранения данных пары" });
  }
});

app.get("/api/couple/data/:login1/:login2", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res) => {
  try {
    const l1 = String(req.params.login1 || "").toLowerCase().replace(/^@/, "");
    const l2 = String(req.params.login2 || "").toLowerCase().replace(/^@/, "");

    const key = [l1, l2].sort().join("_");
    const data = await getCoupleData(key);

    return res.json({ data: data || null });
  } catch (err: unknown) {
    logger.error("Ошибка получения данных пары", err);
    return res.status(500).json({ error: "Ошибка загрузки данных пары" });
  }
});

app.get("/api/chat/messages/:coupleId", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res) => {
  try {
    const coupleId = String(req.params.coupleId || "");

    if (isSqlConfigured() && db) {
      try {
        const msgs = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.coupleId, coupleId))
          .orderBy(chatMessages.createdAt)
          .limit(150);
        return res.json({ messages: msgs });
      } catch (err: unknown) {
        logger.warn("Сбой чтения сообщений чата из SQL, чтение из файла", { coupleId }, err);
      }
    }

    const store = readEmergencyFile();
    const msgs = (store.chatMessages || [])
      .filter((m) => m.coupleId === coupleId)
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
      .slice(-150);

    return res.json({ messages: msgs });
  } catch (err: unknown) {
    logger.error("Ошибка получения сообщений чата", err);
    return res.status(500).json({ error: "Ошибка загрузки чата" });
  }
});

app.post("/api/chat/messages", requireAuth, requirePairOwnership, validateBody(chatMessageCreateSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { coupleId, senderLogin, text } = req.body;
    const userLogin = req.user?.login;

    if (senderLogin !== userLogin) {
      return res.status(403).json({ error: "Нельзя отправлять сообщения от чужого имени" });
    }

    const now = new Date().toISOString();
    const msg = {
      id: crypto.randomUUID(),
      coupleId,
      senderLogin,
      role: "partner1",
      content: text,
      isRead: false,
      createdAt: now,
    };

    if (isSqlConfigured() && db) {
      try {
        await db.insert(chatMessages).values(msg);
        return res.status(201).json({ message: msg });
      } catch (err: unknown) {
        logger.warn("Сбой сохранения сообщения чата в SQL, запись в файл", { coupleId }, err);
      }
    }

    const store = readEmergencyFile();
    if (!store.chatMessages) store.chatMessages = [];
    store.chatMessages.push(msg);
    writeEmergencyFile(store);

    return res.status(201).json({ message: msg });
  } catch (err: unknown) {
    logger.error("Ошибка сохранения сообщения чата", err);
    return res.status(500).json({ error: "Ошибка отправки сообщения" });
  }
});

app.get("/api/ai/messages/:login", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res) => {
  try {
    const login = String(req.params.login || "").toLowerCase().replace(/^@/, "");

    const aiCoupleId = `ai_${login}`;
    if (isSqlConfigured() && db) {
      try {
        const msgs = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.coupleId, aiCoupleId))
          .orderBy(chatMessages.createdAt)
          .limit(100);
        return res.json({ messages: msgs });
      } catch (err: unknown) {
        logger.warn("Сбой чтения истории ИИ из SQL, чтение из файла", { login }, err);
      }
    }

    const store = readEmergencyFile();
    const msgs = (store.chatMessages || [])
      .filter((m) => m.coupleId === aiCoupleId)
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
      .slice(-100);

    return res.json({ messages: msgs });
  } catch (err: unknown) {
    logger.error("Ошибка загрузки сообщений ИИ", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ==========================================
// 6. ANALYTICS & INSIGHTS
// ==========================================

app.get("/api/analytics/trends/:coupleId", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res) => {
  try {
    const { coupleId } = req.params;

    const days = parseInt(req.query.days as string, 10) || 30;
    const trends = await getTrends(coupleId, days);
    return res.json(trends);
  } catch (err: unknown) {
    logger.error("Ошибка получения аналитики трендов", err);
    return res.status(500).json({ error: "Не удалось получить аналитику трендов" });
  }
});

app.get("/api/analytics/insights/:coupleId", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res) => {
  try {
    const { coupleId } = req.params;

    if (!isSqlConfigured() || !db) {
      return res.json({ insights: [] });
    }

    const insights = await db
      .select()
      .from(aiInsights)
      .where(eq(aiInsights.coupleId, coupleId))
      .orderBy(desc(aiInsights.createdAt))
      .limit(10);

    return res.json({ insights });
  } catch (err: unknown) {
    logger.error("Ошибка получения инсайтов ИИ", err);
    return res.status(500).json({ error: "Не удалось получить инсайты" });
  }
});

app.post("/api/analytics/insights/generate", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res) => {
  try {
    const { coupleId } = req.body;

    const insight = await generateWeeklyInsight(coupleId, req.body.contextData || {});
    return res.json({ insight });
  } catch (err: unknown) {
    logger.error("Ошибка генерации недельного инсайта", err);
    return res.status(500).json({ error: "Ошибка генерации инсайта" });
  }
});

// ==========================================
// 7. PUSH NOTIFICATIONS
// ==========================================

app.post("/api/push/subscribe", requireAuth, (req, res) => {
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

app.post("/api/push/send-test", requireAuth, (req, res) => {
  const { title, body } = req.body;
  return res.json({
    status: "dispatched",
    title: title || "Loop • Внимание партнёра",
    body: body || "Тестовое уведомление доставлено.",
  });
});

// ==========================================
// 8. AI PSYCHOLOGY & COMPATIBILITY
// ==========================================

app.post("/api/ai/chat", aiLimiter, requireAuth, validateBody(aiChatMessageSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { messages, userLogin: bodyLogin } = req.body;
    const coupleContext = req.body.context || req.body.coupleContext;
    const currentPartner = req.body.currentPartner;
    const callerLogin = req.user?.login || bodyLogin;

    const partnerName = currentPartner?.name || "Партнёр";
    const partner2Name = coupleContext?.user2?.name || "Второй партнёр";

    const systemPrompt = `Ты — Сова, опытный, бережный и доказательный семейный психолог приложения для пар Loop.

ТВОЙ СТИЛЬ:
- Говори как настоящий чуткий психотерапевт: спокойно, поддерживающе, структурно и предельно ЛАКОНИЧНО.
- БЕЗ ВОДЫ И ШАБЛОННЫХ ВСТУПЛЕНИЙ: сразу переходи к сути вопроса.
- ДЛИНА ОТВЕТА: строго 70–130 слов (2-3 коротких смысловых блока). Ответ должен легко считываться с экрана смартфона за 20 секунд.

ФОРМАТИРОВАНИЕ ОТВЕТА:
- Используй только обычный текст, абзацы и эмодзи.
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать Markdown-таблицы, блоки кода или HTML-теги.
- Отвечай строго как эмпатичный собеседник в мессенджере.

СМЫСЛОВАЯ СТРУКТУРА ОТВЕТА:
1. **Взгляд психолога** (1–2 ёмких предложения: валидация чувств и корень динамики в паре).
2. **Практика / Готовая фраза** (1–2 точечных шага с конкретным речевым шаблоном в кавычках: «...», например по методу Готтмана или Я-высказыванию).
3. **Вопрос для вас** (1 точный, глубокий вопрос для диалога с собой или партнёром).

КАТЕГОРИЧЕСКИЕ ЗАПРЕТЫ:
- ❌ КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ любые таблицы (никаких символов «|---|---|» или ASCII-колонок).
- ❌ ЗАПРЕЩЕНЫ длинные простыни текста, банальности («вам просто нужно поговорить») и заумная терминология.
- ❌ ЗАПРЕЩЕН ОФФТОП (программирование, рецепты, политика, ремонт): вежливо откажись в одно тёплое предложение и верни тему к отношениям и чувствам.

Контекст пары:
- Собеседник: ${partnerName}
- Партнёр: ${partner2Name}
- Дней вместе: ${coupleContext?.daysTogether || 1}
- Язык любви ${partnerName}: ${coupleContext?.user1?.loveLanguage || "не указан"}
- Язык любви ${partner2Name}: ${coupleContext?.user2?.loveLanguage || "не указан"}`;

    const lastUserMessage = messages[messages.length - 1];
    const lastUserText = lastUserMessage?.content || "";

    // Guardrail off-topic check
    const offTopicKeywords = [
      "шкаф", "код", "программ", "python", "javascript", "машин", "ремонт",
      "рецепт", "пирог", "президент", "политик", "забудь", "игнорируй"
    ];
    if (offTopicKeywords.some((k) => lastUserText.toLowerCase().includes(k))) {
      return res.json({
        reply: "Я семейный психолог Сова и специализируюсь исключительно на отношениях, чувствах и гармонии в паре.\n\nФизические и технические инструкции лучше посмотреть в руководстве пользователя. А если в процессе совместного дела возникло недопонимание — я с радостью помогу всё экологично уладить! О чём в отношениях вы хотите поговорить?",
        mode: "fallback_guardrail",
      });
    }

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    ];

    const groqReply = await callGroqChat(groqMessages);
    if (groqReply) {
      await saveAIMessageToDb(callerLogin, lastUserText, groqReply);
      return res.json({ reply: groqReply, mode: "groq" });
    }

    const smartReply = generateSmartPsychologistReply(lastUserText, partnerName, partner2Name);
    await saveAIMessageToDb(callerLogin, lastUserText, smartReply);
    return res.json({
      reply: smartReply,
      mode: "smart_psychologist_engine",
    });
  } catch (err: unknown) {
    logger.error("Ошибка в AI чате Совы", err);
    const partnerName = req.body?.currentPartner?.name || "Партнёр";
    const partner2Name = req.body?.coupleContext?.user2?.name || "партнёр";
    const lastUserText = req.body?.messages?.slice(-1)?.[0]?.content || "";
    const fallback = generateSmartPsychologistReply(lastUserText, partnerName, partner2Name);
    await saveAIMessageToDb(req.user?.login, lastUserText, fallback);
    return res.json({
      reply: fallback,
      mode: "safety_fallback",
    });
  }
});

app.post("/api/ai/generate-report", aiLimiter, requireAuth, validateBody(aiReportSchema), async (req, res) => {
  try {
    const { coupleProfile, radarScores } = req.body;
    const prompt = `Проанализируй данные пары для приложения Loop и составь глубокий психологический отчёт:
Данные пары: ${JSON.stringify({ coupleProfile, radarScores })}

Верни строго JSON:
{
  "title": "краткий вдохновляющий заголовок архетипа пары",
  "summary": "вывод на 3-4 предложения",
  "strengths": ["сильная сторона 1", "сильная сторона 2", "сильная сторона 3"],
  "growthZones": ["зона роста 1", "зона роста 2"],
  "gottmanTips": "рекомендация по методу Готтмана с упражнением"
}`;

    const groqReply = await callGroqChat([
      { role: "system", content: "Ты — эксперт семейной психологии. Отвечай строго валидным JSON без markdown." },
      { role: "user", content: prompt },
    ]);

    if (groqReply) {
      try {
        const clean = groqReply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(clean);
        return res.json(parsed);
      } catch (err: unknown) {
        logger.warn("Сбой парсинга JSON ответа Groq для отчета", undefined, err);
      }
    }

    return res.json({
      title: "Гармоничный союз глубокой привязанности",
      summary: "Ваша пара демонстрирует высокий уровень взаимного уважения и эмоциональной поддержки. Ключевая сила союза — готовность слышать переживания партнёра.",
      strengths: ["Чуткое отношение к эмоциональному состоянию", "Открытость к диалогу", "Общие базовые ценности"],
      growthZones: ["Уделять больше времени совместному спонтанному отдыху", "Синхронизация бытовых ожиданий"],
      gottmanTips: "Практикуйте ежедневный 15-минутный ритуал «Разгрузка после рабочего дня»: слушайте партнёра без критики и советов, проявляя чистую эмпатию.",
    });
  } catch (err: unknown) {
    logger.error("Ошибка генерации отчета пары", err);
    return res.status(500).json({ error: "Ошибка генерации отчета" });
  }
});

app.post("/api/ai/date-idea", aiLimiter, requireAuth, validateBody(aiDateIdeaSchema), async (req, res) => {
  try {
    const { budget, vibe, location, coupleProfile } = req.body;
    const prompt = `Придумай оригинальное свидание для пары в Loop:
Бюджет: ${budget || "умеренный"}
Атмосфера: ${vibe || "романтичная"}
Локация: ${location || "в городе или дома"}
Профиль: ${JSON.stringify(coupleProfile || {})}

Верни строго JSON:
{
  "title": "название свидания",
  "tagline": "короткий цепляющий слоган",
  "description": "описание сценария на 2-3 предложения",
  "prepSteps": ["шаг 1", "шаг 2"],
  "conversationStarters": ["вопрос для пары 1", "вопрос для пары 2"]
}`;

    const groqReply = await callGroqChat([
      { role: "system", content: "Ты — креативный продюсер свиданий и психолог отношений. Отвечай валидным JSON." },
      { role: "user", content: prompt },
    ]);

    if (groqReply) {
      try {
        const clean = groqReply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return res.json(JSON.parse(clean));
      } catch (err: unknown) {
        logger.warn("Сбой парсинга JSON ответа Groq для свидания", undefined, err);
      }
    }

    return res.json({
      title: "Гастрономическое путешествие вслепую",
      tagline: "Вкус, доверие и новые тактильные впечатления",
      description: "Один из вас надевает повязку на глаза, а второй угощает заранее подготовленными необычными вкусами (сыры, ягоды, шоколад с солью). Затем меняетесь ролями.",
      prepSteps: ["Купить 4-5 контрастных закусок", "Подготовить мягкую повязку на глаза", "Включить медленный джаз или эмбиент"],
      conversationStarters: ["Какой момент наших отношений был для тебя самым вкусным и ярким?", "Какое блюдо или поездка больше всего запомнились нам обоим?"],
    });
  } catch (err: unknown) {
    logger.error("Ошибка генерации свидания", err);
    return res.status(500).json({ error: "Ошибка генерации свидания" });
  }
});

// ==========================================
// 9. CLIENT OBSERVABILITY: LOG-ERROR
// ==========================================

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

// ==========================================
// 10. CENTRALIZED ERROR HANDLING MIDDLEWARE
// ==========================================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Необработанное исключение при выполнении запроса", err, {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    error: config.nodeEnv === "production" ? "Внутренняя ошибка сервера" : err.message || "Ошибка сервера",
  });
});

// Process-level unhandled crash prevention & telemetry
process.on("uncaughtException", (error) => {
  logger.error("КРИТИЧЕСКАЯ ОШИБКА ПРОЦЕССА: Uncaught Exception", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("КРИТИЧЕСКАЯ ОШИБКА ПРОЦЕССА: Unhandled Rejection", reason, {
    promise: String(promise),
  });
});

// ==========================================
// 11. VITE SPA & STATIC ASSETS SERVER
// ==========================================

function checkEnvVariables() {
  const isProd = process.env.NODE_ENV === "production";
  const missing = [];
  
  if (!process.env.NEON_DATABASE_URL && !process.env.DATABASE_URL && !process.env.SQL_HOST) {
    missing.push('Database Connection String (NEON_DATABASE_URL / DATABASE_URL)');
  }
  if (!process.env.JWT_SECRET) {
    missing.push('JWT_SECRET');
  }
  if (!process.env.APP_URL) {
    missing.push('APP_URL');
  }

  if (missing.length > 0) {
    logger.warn(`Missing critical environment variables: ${missing.join(', ')}. Server will use fallbacks, which is NOT recommended for production.`);
  } else {
    logger.info('All critical environment variables are present.');
  }
}

async function startServer() {
  checkEnvVariables();
  await initDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith("index.html") || filePath.endsWith("sw.js")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
          } else if (filePath.includes("/assets/")) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          }
        },
      })
    );

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API Route Not Found" });
      }
      if (req.path.endsWith(".js") || req.path.endsWith(".css")) {
        return res.status(404).send("Asset not found");
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Loop App Server успешно запущен на http://0.0.0.0:${PORT}`);
  });
}

startServer();
