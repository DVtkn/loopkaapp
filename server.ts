import "dotenv/config";

console.log("=== ПРОВЕРКА КОНФИГУРАЦИИ ===");
console.log(
  "GROQ_API_KEY загружен:",
  process.env.GROQ_API_KEY
    ? "ДА (начинается на " + process.env.GROQ_API_KEY.substring(0, 10) + "...)"
    : "НЕТ (undefined)"
);
console.log("=============================");

import { db, createPool, isSqlConfigured } from "./src/db/index.ts";
import { users, pairRequests, coupleData, chatMessages } from "./src/db/schema.ts";
import { eq, or, desc, and, sql } from "drizzle-orm";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";

// Rate limiter for login endpoint (5 failed attempts per IP+login per 15 mins)
interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}
const loginRateLimits = new Map<string, RateLimitEntry>();

function checkLoginRateLimit(key: string): { allowed: boolean; remainingMs?: number } {
  const now = Date.now();
  const entry = loginRateLimits.get(key);
  if (!entry) return { allowed: true };
  if (now > entry.resetAt) {
    loginRateLimits.delete(key);
    return { allowed: true };
  }
  if (entry.attempts >= 5) {
    return { allowed: false, remainingMs: entry.resetAt - now };
  }
  return { allowed: true };
}

function recordFailedLoginAttempt(key: string) {
  const now = Date.now();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const entry = loginRateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    loginRateLimits.set(key, { attempts: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.attempts += 1;
  }
}

function clearLoginRateLimit(key: string) {
  loginRateLimits.delete(key);
}

// Dummy hash for timing attack mitigation when user is not found
const DUMMY_HASH = "$2b$10$e8I8/g4P7s.Sg43L7kE8.eL39j34uV658m9m3m3m3m3m3m3m3m3m3";

async function verifyPassword(inputPass: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    return await bcrypt.compare(inputPass, storedHash);
  }
  // Legacy plaintext fallback
  return inputPass === storedHash;
}

const currentDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Persistent JSON Storage paths
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db_store.json");

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.error("Error creating data dir:", e);
  }
}

interface DbFileStore {
  users: Record<string, any>;
  pairRequests: any[];
  coupleData: Record<string, any>;
  chatMessages?: any[];
}

function readDbFile(): DbFileStore {
  ensureDataDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || {},
        pairRequests: parsed.pairRequests || [],
        coupleData: parsed.coupleData || {},
        chatMessages: parsed.chatMessages || [],
      };
    }
  } catch (e) {
    console.error("Error reading db_store.json", e);
  }
  return { users: {}, pairRequests: [], coupleData: {}, chatMessages: [] };
}

function writeDbFile(data: DbFileStore) {
  ensureDataDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing db_store.json", e);
  }
}

function saveUserToFile(userObj: any) {
  if (!userObj || !userObj.login) return;
  const store = readDbFile();
  const cleanKey = String(userObj.login).trim().toLowerCase().replace(/^@/, "");
  store.users[cleanKey] = { ...store.users[cleanKey], ...userObj };
  writeDbFile(store);
}

function addPairRequestToFile(reqObj: any) {
  const store = readDbFile();
  if (!store.pairRequests) store.pairRequests = [];
  store.pairRequests = store.pairRequests.filter((r: any) => r.id !== reqObj.id);
  store.pairRequests.push(reqObj);
  writeDbFile(store);
}

function removePairRequestsFromFile(predicate: (r: any) => boolean) {
  const store = readDbFile();
  if (!store.pairRequests) return;
  store.pairRequests = store.pairRequests.filter((r: any) => !predicate(r));
  writeDbFile(store);
}

async function findUserByLogin(loginInput: string) {
  if (!loginInput) return undefined;
  const clean = String(loginInput).trim().toLowerCase().replace(/^@/, "");
  if (!clean) return undefined;

  if (isSqlConfigured()) {
    try {
      const res = await db
        .select()
        .from(users)
        .where(sql`LOWER(${users.login}) = ${clean}`)
        .limit(1);
      if (res && res.length > 0) {
        saveUserToFile(res[0]);
        return res[0];
      }
    } catch (e) {
      // Quiet fallback to file store
    }
  }

  const store = readDbFile();
  const fileUser = store.users[clean] || Object.values(store.users).find((u: any) => u && String(u.login).toLowerCase() === clean);
  if (fileUser && isSqlConfigured()) {
    try {
      await db.insert(users).values(fileUser).onConflictDoNothing().catch(() => {});
    } catch (_) {}
  }

  return fileUser;
}

async function findUserByQuery(query: string) {
  if (!query) return undefined;
  const clean = String(query).trim().toLowerCase().replace(/^@/, "");
  if (!clean) return undefined;

  // 1. Try SQL query first if configured
  if (isSqlConfigured()) {
    try {
      const res = await db
        .select()
        .from(users)
        .where(
          or(
            eq(users.login, clean),
            sql`LOWER(${users.login}) = ${clean}`,
            sql`LOWER(${users.name}) = ${clean}`
          )
        )
        .limit(1);
      if (res && res.length > 0) {
        saveUserToFile(res[0]);
        return res[0];
      }
    } catch (e) {
      // Quiet fallback to file store
    }
  }

  // 2. Check persistent file store
  const store = readDbFile();
  const fileUser = store.users[clean] || Object.values(store.users).find((u: any) => u && (String(u.login).toLowerCase() === clean || String(u.name || "").toLowerCase() === clean));
  if (fileUser && isSqlConfigured()) {
    // Attempt background restore to SQL
    try {
      await db.insert(users).values(fileUser).onConflictDoNothing().catch(() => {});
    } catch (_) {}
  }

  return fileUser;
}

// Initialize tables and sync SQL & File backup
async function initDatabase() {
  ensureDataDir();
  if (!isSqlConfigured()) {
    console.log("ℹ️ [Database] Cloud SQL not configured — using zero-latency persistent JSON file storage (/data/db_store.json).");
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
        created_at text NOT NULL
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS gender text;

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
    `);
    console.log("✅ PostgreSQL database tables initialized/verified.");
  } catch (err: any) {
    console.warn("PostgreSQL table init note (will use dual-storage fallback):", err?.message || err);
  }

  // Sync users between SQL and File Store
  try {
    const sqlUsers = await db.select().from(users);
    const store = readDbFile();
    let modified = false;

    // Load SQL users to file store
    for (const u of sqlUsers) {
      const k = u.login.toLowerCase();
      if (!store.users[k]) {
        store.users[k] = u;
        modified = true;
      }
    }

    // Load file users to SQL if missing
    for (const [k, u] of Object.entries(store.users)) {
      if (u && typeof u === "object") {
        const found = sqlUsers.find((su) => su.login.toLowerCase() === k);
        if (!found) {
          try {
            await db.insert(users).values(u as any).onConflictDoNothing().catch(() => {});
          } catch (_) {}
        }
      }
    }

    if (modified) {
      writeDbFile(store);
    }
  } catch (err: any) {
    console.warn("Initial sync note:", err?.message || err);
  }
}

// In-memory subscriptions store for Web Push notifications
const pushSubscriptions: any[] = [];

// ===== AI CONFIGURATION (только Groq) =====
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// Перебор моделей ВНУТРИ Groq: если одна отключена, сработает следующая
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-120b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
];

async function callGroqChat(
  messages: Array<{ role: string; content: string }>,
): Promise<string | null> {
  if (!GROQ_API_KEY) {
    console.error("❌ [AI] GROQ_API_KEY не задан в окружении (.env)");
    return null;
  }

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          messages,
          model,
          temperature: 0.5,
          max_tokens: 650,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log(`✅ [AI] Groq ответил (модель: ${model})`);
          return content;
        }
      }

      const errText = await response.text();
      console.error(`❌ [AI] Groq ${model} → статус ${response.status}: ${errText.slice(0, 250)}`);
      // Неверный/заблокированный ключ — пробовать другие модели бессмысленно
      if (response.status === 401 || response.status === 403) return null;
    } catch (err) {
      console.error(`❌ [AI] Groq ${model} → сетевая ошибка:`, err);
    }
  }
  return null;
}

// Fallback smart psychologist engine when online AI APIs are offline or rate-limited
function generateSmartPsychologistReply(
  userMessage: string,
  partnerName: string,
  partner2Name: string
): string {
  const text = (userMessage || "").toLowerCase();

  if (text.includes("ссора") || text.includes("ругаем") || text.includes("обид") || text.includes("конфликт") || text.includes("спор")) {
    return `**Взгляд психолога**: За каждым острым конфликтом и обидой всегда стоит уязвимое чувство — страх быть неуслышанным или отвергнутым. Защитная реакция часто выглядит как злость, но корень зарыт глубже.

**Практика / Готовая фраза**: Попробуйте взять паузу на 15 минут и сказать ${partner2Name}:
«Мне очень жаль, что наш разговор зашёл в тупик. Я очень ценю нас и хочу всё обсудить спокойно, когда эмоции немного утихнут».

**Вопрос для вас**: Какая именно ваша неудовлетворённая потребность стоит за этой ситуацией?`;
  }

  if (text.includes("ревн") || text.includes("измен") || text.includes("не довер")) {
    return `**Взгляд психолога**: Ревность — это не признак нелюбви, а подсвеченный страх утраты безопасности и ценности в глазах партнёра.

**Практика / Готовая фраза**: Поделитесь чувством через уязвимость с ${partner2Name}:
«Знаешь, иногда во мне просыпается тревога. Мне очень важно слышать, что я для тебя ценен и важен».

**Вопрос для вас**: Что партнёр может сделать сегодня, чтобы вы почувствовали большую надёжность?`;
  }

  if (text.includes("устал") || text.includes("быт") || text.includes("рутин") || text.includes("нет времени")) {
    return `**Взгляд психолога**: Накопленная бытовая усталость незаметно истощает эмоциональный баланс пары. Если не пополнять «банк теплых впечатлений», обычные мелочи начинают раздражать.

**Практика / Готовая фраза**: Договоритесь о 10-минутном ритуале с ${partner2Name}:
«Давай сейчас на 10 минут отложим все телефоны и дела, просто выпьем чаю и обнимемся».

**Вопрос для вас**: Какую одну бытовую обязанность вы можете облегчить или перераспределить на этой неделе?`;
  }

  if (text.includes("внимани") || text.includes("одиночест") || text.includes("холод") || text.includes("отдаля")) {
    return `**Взгляд психолога**: Чувство дистанции в отношениях — это естественный сигнал о том, что ваш эмоциональный контакт требует обновления.

**Практика / Готовая фраза**: Задайте ${partner2Name} тёплый открытый вопрос:
«Я соскучился по нашим глубоким разговорам. Как ты себя чувствуешь в последнее время и о чём чаще всего думаешь?»

**Вопрос для вас**: Какое совместное занятие раньше приносило вам больше всего радости и лёгкости?`;
  }

  return `**Взгляд психолога**: Любые переживания в паре — это точка роста для вашего эмоционального контакта. Главное — подходить к диалогу не из позиции претензий, а из желания понять друг друга.

**Практика / Готовая фраза**: Попробуйте сформулировать мысль через Я-высказывание:
«Я чувствую тревогу, когда происходят подобные ситуации, потому что для меня очень важна наша близость с ${partner2Name}».

**Вопрос для вас**: Что прямо сейчас поможет вам почувствовать себя одной уверенной командой?`;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    appName: "Loop Pro",
    version: "1.1.0",
    totalUsers: 0,
    hasGroqKey: Boolean(GROQ_API_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Stored Interfaces
interface StoredUser {
  id: string;
  login: string;
  passwordHash: string;
  name: string;
  avatarEmoji: string;
  partnerLogin: string | null;
  pairedAt?: string;
  startDate?: string;
  city?: string;
  loveLanguage?: string;
  attachmentStyle?: string;
  currentMood?: {
    emoji: string;
    label: string;
    note: string;
    updatedAt: string;
  };
  createdAt: string;
}

// Helper: Get couple key from two logins

// Auth: Get all safe users
app.get("/api/auth/users", async (req, res) => {
  try {
    const userMap: Record<string, any> = {};

    // 1. From File Store
    const store = readDbFile();
    for (const [k, u] of Object.entries(store.users || {})) {
      if (u && typeof u === "object") {
        const { passwordHash, ...safe } = u as any;
        userMap[k.toLowerCase()] = safe;
      }
    }

    // 2. From SQL if configured
    if (isSqlConfigured()) {
      try {
        const allSqlUsers = await db.select().from(users);
        for (const u of allSqlUsers) {
          const { passwordHash, ...safe } = u;
          userMap[u.login.toLowerCase()] = safe;
          saveUserToFile(u);
        }
      } catch (e) {
        // Quiet fallback
      }
    }

    return res.json({ users: Object.values(userMap) });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Admin: Wipe all accounts & data for clean deploy/production
app.post("/api/admin/clear-all-data", async (req, res) => {
  try {
    if (isSqlConfigured()) {
      try {
        await db.delete(users);
        await db.delete(pairRequests);
        await db.delete(coupleData);
        await db.delete(chatMessages);
      } catch (e) {
        // Quiet fallback
      }
    }
    writeDbFile({ users: {}, pairRequests: [], coupleData: {}, chatMessages: [] });
    return res.json({
      status: "ok",
      message: "All accounts and data have been cleared successfully.",
    });
  } catch (err) {
    console.error("Clear data error:", err);
    return res.status(500).json({ error: "Failed to clear data" });
  }
});

// Auth: Sync local client accounts to server (prevents 404 on container restart)
app.post("/api/auth/sync", async (req, res) => {
  try {
    const { accounts } = req.body;
    let modified = false;
    for (const [key, acc] of Object.entries(accounts || {})) {
      if (acc && typeof acc === "object") {
        const accObj = acc as Record<string, any>;
        const cleanKey = String(accObj.login || key)
          .trim()
          .toLowerCase()
          .replace(/^@/, "");
        const existing = await findUserByLogin(cleanKey);
        if (cleanKey && !existing) {
          const rawPass = accObj.password ? String(accObj.password).trim() : "123456";
          const hashedPassword = await bcrypt.hash(rawPass, 10);
          const newUserRecord = {
            id: accObj.id || "u_" + Date.now(),
            login: cleanKey,
            passwordHash: hashedPassword,
            name: accObj.name || cleanKey,
            avatarEmoji: accObj.avatarEmoji || "sparkles",
            partnerLogin: accObj.partnerLogin || null,
            pairedAt: accObj.pairedAt || null,
            startDate: accObj.startDate || null,
            city: accObj.city || null,
            loveLanguage: accObj.loveLanguage || null,
            attachmentStyle: accObj.attachmentStyle || null,
            currentMood: accObj.currentMood || null,
            createdAt: new Date().toISOString(),
          };
          if (isSqlConfigured()) {
            try {
              await db.insert(users).values(newUserRecord).onConflictDoNothing();
            } catch (_) {}
          }
          saveUserToFile(newUserRecord);
          modified = true;
        }
      }
    }
    return res.json({ status: "ok", synced: modified });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Auth: Register (Login + Password)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { login, password, name, gender, avatarEmoji } = req.body;
    const cleanLogin = String(login || "")
      .trim()
      .toLowerCase()
      .replace(/^@/, "");
    const cleanInputPass = String(password || "").trim();

    if (!cleanLogin || cleanLogin.length < 3) {
      return res
        .status(400)
        .json({ error: "Логин должен содержать от 3 символов" });
    }
    if (!cleanInputPass || cleanInputPass.length < 3) {
      return res
        .status(400)
        .json({ error: "Пароль должен содержать от 3 символов" });
    }

    const existing = await findUserByLogin(cleanLogin);
    if (existing) {
      return res.status(400).json({ error: "Пользователь с таким логином уже существует" });
    }

    const hashedPassword = await bcrypt.hash(cleanInputPass, 10);
    const defaultEmoji = avatarEmoji || (gender === 'female' ? 'female' : gender === 'male' ? 'male' : 'sparkles');

    const newUser = {
      id: "u_" + Date.now() + "_" + Math.random().toString(36).substring(7),
      login: cleanLogin,
      passwordHash: hashedPassword,
      name: name ? String(name).trim() : cleanLogin,
      gender: gender ? String(gender) : (cleanLogin.endsWith('a') || cleanLogin.endsWith('ya') ? 'female' : 'male'),
      avatarEmoji: defaultEmoji,
      partnerLogin: null,
      pairedAt: null,
      startDate: null,
      city: null,
      loveLanguage: null,
      attachmentStyle: null,
      currentMood: null,
      createdAt: new Date().toISOString(),
    };

    if (isSqlConfigured()) {
      try {
        await db.insert(users).values(newUser).onConflictDoNothing();
      } catch (sqlErr) {
        // Quiet fallback
      }
    }
    saveUserToFile(newUser);

    const { passwordHash, ...safeUser } = newUser;
    return res.json({ status: "ok", user: safeUser });
  } catch (err: any) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Ошибка регистрации: " + (err?.message || String(err)) });
  }
});

// Auth: Login (Login + Password)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { login, password } = req.body;
    const cleanLogin = String(login || "")
      .trim()
      .toLowerCase()
      .replace(/^@/, "");
    const cleanInputPass = String(password || "").trim();

    if (!cleanLogin || !cleanInputPass) {
      return res.status(400).json({ error: "Заполните логин и пароль" });
    }

    // Rate Limiting Check
    const rateKey = `${req.ip}_${cleanLogin}`;
    const rateCheck = checkLoginRateLimit(rateKey);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: "Слишком много неудачных попыток входа. Попробуйте позже.",
      });
    }

    const user = await findUserByLogin(cleanLogin);
    if (!user) {
      // Execute dummy compare to prevent timing side-channel attacks
      await bcrypt.compare(cleanInputPass, DUMMY_HASH);
      recordFailedLoginAttempt(rateKey);
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    const isMatch = await verifyPassword(cleanInputPass, user.passwordHash);
    if (!isMatch) {
      recordFailedLoginAttempt(rateKey);
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    // Clear failed attempts on successful login
    clearLoginRateLimit(rateKey);

    // Auto-migrate legacy plaintext password to bcrypt hash
    if (!user.passwordHash.startsWith("$2a$") && !user.passwordHash.startsWith("$2b$") && !user.passwordHash.startsWith("$2y$")) {
      try {
        const newHash = await bcrypt.hash(cleanInputPass, 10);
        if (isSqlConfigured()) {
          await db.update(users).set({ passwordHash: newHash }).where(eq(users.login, user.login)).catch(() => {});
        }
        user.passwordHash = newHash;
        saveUserToFile(user);
      } catch (migrationErr) {
        // Quiet fallback
      }
    }

    const { passwordHash, ...safeUser } = user;
    let partnerSafe = null;
    if (user.partnerLogin) {
      const p = await findUserByLogin(user.partnerLogin);
      if (p) {
        const { passwordHash: ph2, ...rest } = p;
        partnerSafe = rest;
      }
    }

    return res.json({ status: "ok", user: safeUser, partner: partnerSafe });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Ошибка входа: " + (err?.message || String(err)) });
  }
});

// Auth: Get User by Login
app.get("/api/auth/user/:login", async (req, res) => {
  try {
    const user = await findUserByLogin(req.params.login);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    const { passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Auth: Update Profile
app.post("/api/auth/update-profile", async (req, res) => {
  try {
    const {
      login,
      name,
      gender,
      avatarEmoji,
      loveLanguage,
      attachmentStyle,
      currentMood,
      startDate,
      city,
    } = req.body;
    const user = await findUserByLogin(login);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (gender !== undefined) updates.gender = String(gender);
    if (avatarEmoji !== undefined) updates.avatarEmoji = String(avatarEmoji);
    if (loveLanguage !== undefined) updates.loveLanguage = String(loveLanguage);
    if (attachmentStyle !== undefined)
      updates.attachmentStyle = String(attachmentStyle);
    if (startDate !== undefined) updates.startDate = String(startDate);
    if (city !== undefined) updates.city = String(city);
    if (currentMood !== undefined) updates.currentMood = currentMood;

    if (isSqlConfigured()) {
      try {
        await db.update(users).set(updates).where(eq(users.login, user.login));
      } catch (_) {}
    }
    const updatedUser = { ...user, ...updates };
    saveUserToFile(updatedUser);
    const { passwordHash, ...safeUser } = updatedUser;
    return res.json({ status: "ok", user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: "Ошибка обновления профиля" });
  }
});

// Auth: Change Password
app.post("/api/auth/change-password", async (req, res) => {
  try {
    const { login, oldPassword, newPassword } = req.body;
    const cleanLogin = String(login || "").trim().toLowerCase().replace(/^@/, "");
    const cleanOld = String(oldPassword || "").trim();
    const cleanNew = String(newPassword || "").trim();

    if (!cleanLogin) return res.status(400).json({ error: "Укажите логин" });
    if (!cleanOld || !cleanNew || cleanNew.length < 3) {
      return res.status(400).json({ error: "Новый пароль должен содержать от 3 символов" });
    }

    const user = await findUserByLogin(cleanLogin);
    if (!user) return res.status(401).json({ error: "Неверный логин или пароль" });

    const isMatch = await verifyPassword(cleanOld, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверный старый пароль" });
    }

    const newHash = await bcrypt.hash(cleanNew, 10);
    if (isSqlConfigured()) {
      try {
        await db
          .update(users)
          .set({ passwordHash: newHash })
          .where(eq(users.login, user.login));
      } catch (_) {}
    }

    user.passwordHash = newHash;
    saveUserToFile(user);

    return res.json({ status: "ok", message: "Пароль успешно изменён" });
  } catch (err) {
    return res.status(500).json({ error: "Ошибка смены пароля" });
  }
});

// Auth: Reset Password (when user forgot password)
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { login, newPassword } = req.body;
    const cleanLogin = String(login || "")
      .trim()
      .toLowerCase()
      .replace(/^@/, "");
    const cleanNewPass = String(newPassword || "").trim();

    if (!cleanLogin) return res.status(400).json({ error: "Укажите логин" });
    if (!cleanNewPass || cleanNewPass.length < 3)
      return res.status(400).json({ error: "Новый пароль должен содержать от 3 символов" });

    const user = await findUserByLogin(cleanLogin);
    if (!user) return res.status(404).json({ error: `Пользователь @${cleanLogin} не найден` });

    const newHash = await bcrypt.hash(cleanNewPass, 10);
    if (isSqlConfigured()) {
      try {
        await db
          .update(users)
          .set({ passwordHash: newHash })
          .where(eq(users.login, user.login));
      } catch (_) {}
    }

    user.passwordHash = newHash;
    saveUserToFile(user);

    const { passwordHash, ...safeUser } = user;
    return res.json({ status: "ok", user: safeUser, message: "Пароль успешно обновлён" });
  } catch (err) {
    return res.status(500).json({ error: "Ошибка сброса пароля" });
  }
});

// Pairing: Send Pair Request by Login
app.post("/api/pair/request", async (req, res) => {
  try {
    const { fromLogin, toLogin } = req.body;
    const cleanFrom = String(fromLogin || "")
      .trim()
      .toLowerCase()
      .replace(/^@/, "");
    const cleanTo = String(toLogin || "")
      .trim()
      .toLowerCase()
      .replace(/^@/, "");

    if (!cleanFrom || !cleanTo)
      return res
        .status(400)
        .json({ error: "Укажите логины обоих пользователей" });
    if (cleanFrom === cleanTo)
      return res
        .status(400)
        .json({ error: "Вы не можете создать пару с самим собой" });

    const fromUser = await findUserByQuery(cleanFrom);
    if (!fromUser)
      return res.status(404).json({ error: "Ваш аккаунт не найден." });

    const toUser = await findUserByQuery(cleanTo);
    if (!toUser)
      return res
        .status(404)
        .json({ error: `Пользователь @${cleanTo} пока не зарегистрирован.` });

    // 1. If already paired with each other (or one of them is already linked to the other)
    const isFromLinkedToTarget = fromUser.partnerLogin && fromUser.partnerLogin.toLowerCase() === cleanTo;
    const isToLinkedToFrom = toUser.partnerLogin && toUser.partnerLogin.toLowerCase() === cleanFrom;

    if (isFromLinkedToTarget || isToLinkedToFrom) {
      const now = fromUser.pairedAt || toUser.pairedAt || new Date().toISOString();
      if (isSqlConfigured()) {
        try {
          await db.update(users).set({ partnerLogin: cleanTo, pairedAt: now }).where(eq(users.login, cleanFrom));
          await db.update(users).set({ partnerLogin: cleanFrom, pairedAt: now }).where(eq(users.login, cleanTo));
          await db.delete(pairRequests).where(
            or(
              and(eq(pairRequests.fromLogin, cleanTo), eq(pairRequests.toLogin, cleanFrom)),
              and(eq(pairRequests.fromLogin, cleanFrom), eq(pairRequests.toLogin, cleanTo))
            )
          );
        } catch (_) {}
      }

      saveUserToFile({ ...fromUser, partnerLogin: cleanTo, pairedAt: now });
      saveUserToFile({ ...toUser, partnerLogin: cleanFrom, pairedAt: now });
      removePairRequestsFromFile(
        (r) =>
          (r.fromLogin === cleanTo && r.toLogin === cleanFrom) ||
          (r.fromLogin === cleanFrom && r.toLogin === cleanTo)
      );

      const updatedFrom = await findUserByQuery(cleanFrom);
      const updatedTo = await findUserByQuery(cleanTo);
      const { passwordHash: p1, ...safeFrom } = updatedFrom;
      const { passwordHash: p2, ...safeTo } = updatedTo;
      return res.json({
        status: "paired",
        message: `Вы успешно объединены в пару с @${cleanTo}!`,
        user: safeFrom,
        partner: safeTo,
      });
    }

    // 2. If current user is already in a pair with another user
    if (fromUser.partnerLogin) {
      return res
        .status(400)
        .json({ error: `Вы уже состоите в паре с @${fromUser.partnerLogin}. Сначала отвяжите партнёра в кабинете.` });
    }

    // 3. If target user is already in a pair with another user
    if (toUser.partnerLogin) {
      return res
        .status(400)
        .json({ error: `Пользователь @${cleanTo} уже состоит в паре с другим пользователем.` });
    }

    const store = readDbFile();
    const fileReqs = store.pairRequests || [];

    const existingReq = fileReqs.some(
      (r) => r.fromLogin === cleanFrom && r.toLogin === cleanTo && r.status === "PENDING"
    );
    if (existingReq)
      return res
        .status(400)
        .json({ error: "Вы уже отправили запрос этому пользователю." });

    const existingInverseReq = fileReqs.some(
      (r) => r.fromLogin === cleanTo && r.toLogin === cleanFrom && r.status === "PENDING"
    );
    if (existingInverseReq) {
      // Auto accept
      const now = new Date().toISOString();
      if (isSqlConfigured()) {
        try {
          await db.update(users).set({ partnerLogin: cleanFrom, pairedAt: now }).where(eq(users.login, cleanTo));
          await db.update(users).set({ partnerLogin: cleanTo, pairedAt: now }).where(eq(users.login, cleanFrom));
          await db.delete(pairRequests).where(
            and(eq(pairRequests.fromLogin, cleanTo), eq(pairRequests.toLogin, cleanFrom))
          );
        } catch (_) {}
      }

      saveUserToFile({ ...fromUser, partnerLogin: cleanTo, pairedAt: now });
      saveUserToFile({ ...toUser, partnerLogin: cleanFrom, pairedAt: now });
      removePairRequestsFromFile(
        (r) => r.fromLogin === cleanTo && r.toLogin === cleanFrom
      );

      const updatedFrom = await findUserByQuery(cleanFrom);
      const updatedTo = await findUserByQuery(cleanTo);
      const { passwordHash: p1, ...safeFrom } = updatedFrom;
      const { passwordHash: p2, ...safeTo } = updatedTo;
      return res.json({
        status: "paired",
        message: "Вы успешно создали пару (встречный запрос принят)!",
        user: safeFrom,
        partner: safeTo,
      });
    }

    const newReq = {
      id: "req_" + Date.now(),
      fromLogin: cleanFrom,
      fromName: fromUser.name || cleanFrom,
      fromAvatar: fromUser.avatarEmoji || "sparkles",
      toLogin: cleanTo,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    if (isSqlConfigured()) {
      try {
        await db.insert(pairRequests).values(newReq);
      } catch (_) {}
    }
    addPairRequestToFile(newReq);

    return res.json({ status: "ok", message: "Запрос успешно отправлен!" });
  } catch (err) {
    console.error("Pair request error:", err);
    return res.status(500).json({ error: "Ошибка отправки запроса" });
  }
});

// Pairing: Accept Pair Request
app.post("/api/pair/accept", async (req, res) => {
  try {
    const { myLogin, partnerLogin } = req.body;
    const cleanMe = String(myLogin).trim().toLowerCase().replace(/^@/, "");
    const cleanPartner = String(partnerLogin)
      .trim()
      .toLowerCase()
      .replace(/^@/, "");

    const meUser = await findUserByQuery(cleanMe);
    const partnerUser = await findUserByQuery(cleanPartner);

    if (!meUser || !partnerUser)
      return res.status(404).json({ error: "Пользователь не найден" });

    const now = new Date().toISOString();
    if (isSqlConfigured()) {
      try {
        await db.update(users).set({ partnerLogin: cleanPartner, pairedAt: now }).where(eq(users.login, cleanMe));
        await db.update(users).set({ partnerLogin: cleanMe, pairedAt: now }).where(eq(users.login, cleanPartner));
        await db.delete(pairRequests).where(
          or(
            and(eq(pairRequests.fromLogin, cleanPartner), eq(pairRequests.toLogin, cleanMe)),
            and(eq(pairRequests.fromLogin, cleanMe), eq(pairRequests.toLogin, cleanPartner))
          )
        );
      } catch (_) {}
    }

    saveUserToFile({ ...meUser, partnerLogin: cleanPartner, pairedAt: now });
    saveUserToFile({ ...partnerUser, partnerLogin: cleanMe, pairedAt: now });
    removePairRequestsFromFile(
      (r) =>
        (r.fromLogin === cleanPartner && r.toLogin === cleanMe) ||
        (r.fromLogin === cleanMe && r.toLogin === cleanPartner)
    );

    const updatedMe = await findUserByQuery(cleanMe);
    const updatedPartner = await findUserByQuery(cleanPartner);

    const { passwordHash: p1, ...safeMe } = updatedMe;
    const { passwordHash: p2, ...safePartner } = updatedPartner;
    return res.json({ status: "ok", user: safeMe, partner: safePartner });
  } catch (err) {
    console.error("Accept pair error:", err);
    return res.status(500).json({ error: "Ошибка подтверждения пары" });
  }
});

// Pairing: Reject Pair Request
app.post("/api/pair/reject", async (req, res) => {
  try {
    const { myLogin, partnerLogin } = req.body;
    const cleanMe = String(myLogin).trim().toLowerCase().replace(/^@/, "");
    const cleanPartner = String(partnerLogin)
      .trim()
      .toLowerCase()
      .replace(/^@/, "");

    if (isSqlConfigured()) {
      try {
        await db.delete(pairRequests).where(
          or(
            and(eq(pairRequests.fromLogin, cleanPartner), eq(pairRequests.toLogin, cleanMe)),
            and(eq(pairRequests.fromLogin, cleanMe), eq(pairRequests.toLogin, cleanPartner))
          )
        );
      } catch (_) {}
    }

    removePairRequestsFromFile(
      (r) =>
        (r.fromLogin === cleanPartner && r.toLogin === cleanMe) ||
        (r.fromLogin === cleanMe && r.toLogin === cleanPartner)
    );

    return res.json({ status: "ok" });
  } catch (err) {
    console.error("Reject pair error:", err);
    return res.status(500).json({ error: "Ошибка отклонения запроса" });
  }
});

// Pairing: Disconnect / Unpair
app.post("/api/pair/disconnect", async (req, res) => {
  try {
    const { login } = req.body;
    const cleanLogin = String(login || "")
      .trim()
      .toLowerCase()
      .replace(/^@/, "");
    const user = await findUserByQuery(cleanLogin);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const partnerLogin = user.partnerLogin;
    if (isSqlConfigured()) {
      try {
        await db.update(users).set({ partnerLogin: null, pairedAt: null }).where(eq(users.login, cleanLogin));
        if (partnerLogin) {
          await db.update(users).set({ partnerLogin: null, pairedAt: null }).where(eq(users.login, partnerLogin));
        }
      } catch (_) {}
    }

    saveUserToFile({ ...user, partnerLogin: null, pairedAt: null });

    if (partnerLogin) {
      const partnerUser = await findUserByQuery(partnerLogin);
      if (partnerUser) {
        saveUserToFile({ ...partnerUser, partnerLogin: null, pairedAt: null });
      }
    }

    const updatedUser = await findUserByQuery(cleanLogin);
    const { passwordHash, ...safeUser } = updatedUser;
    return res.json({ status: "ok", user: safeUser });
  } catch (err) {
    console.error("Disconnect error:", err);
    return res.status(500).json({ error: "Ошибка разрыва пары" });
  }
});

// Pairing: Get Pair Status & Pending Requests
app.get("/api/pair/status/:login", async (req, res) => {
  try {
    const login = String(req.params.login)
      .trim()
      .toLowerCase()
      .replace(/^@/, "");

    let user = await findUserByQuery(login);
    let partner = null;

    if (user?.partnerLogin) {
      partner = await findUserByQuery(user.partnerLogin);
      // Auto-heal bidirectional link if partner didn't have user set
      if (partner && (!partner.partnerLogin || partner.partnerLogin.toLowerCase() !== login)) {
        const pairedAt = user.pairedAt || new Date().toISOString();
        partner.partnerLogin = login;
        partner.pairedAt = pairedAt;
        saveUserToFile(partner);
        if (isSqlConfigured()) {
          await db.update(users).set({ partnerLogin: login, pairedAt }).where(eq(users.login, partner.login)).catch(() => {});
        }
      }
    } else if (user) {
      // Check if another user points to this user as partner
      const allStore = readDbFile();
      const linked = Object.values(allStore.users).find((u: any) => u && u.partnerLogin && String(u.partnerLogin).toLowerCase() === login);
      if (linked) {
        const pairedAt = linked.pairedAt || new Date().toISOString();
        user.partnerLogin = linked.login;
        user.pairedAt = pairedAt;
        saveUserToFile(user);
        if (isSqlConfigured()) {
          await db.update(users).set({ partnerLogin: linked.login, pairedAt }).where(eq(users.login, login)).catch(() => {});
        }
        partner = linked;
      }
    }

    const store = readDbFile();
    const allReqs = store.pairRequests || [];

    // Incoming requests where toLogin = login
    const inc = allReqs.filter((r: any) => r.toLogin === login && r.status === "PENDING");

    // Outgoing requests where fromLogin = login
    const out = allReqs.filter((r: any) => r.fromLogin === login && r.status === "PENDING");

    const safeUser = user ? (({ passwordHash, ...rest }) => rest)(user) : null;
    const safePartner = partner ? (({ passwordHash, ...rest }) => rest)(partner) : null;

    return res.json({
      status: "ok",
      incoming: inc,
      outgoing: out,
      incomingRequests: inc,
      outgoingRequests: out,
      user: safeUser,
      partner: safePartner,
    });
  } catch (err) {
    return res.status(500).json({ error: "Ошибка получения статуса" });
  }
});

// Shared Couple Data Sync (Pulse, Tests, Wishlists, Cravings, Invites)

app.get("/api/chat/messages/:coupleId", async (req, res) => {
  try {
    const { coupleId } = req.params;
    if (isSqlConfigured()) {
      try {
        const rows = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.coupleId, coupleId))
          .orderBy(desc(chatMessages.createdAt))
          .limit(100);
        if (rows && rows.length > 0) {
          return res.json({ messages: rows.reverse() });
        }
      } catch (e) {
        // Fallback to file store
      }
    }

    const store = readDbFile();
    const list = (store.chatMessages || []).filter((m: any) => m.coupleId === coupleId).slice(-100);
    return res.json({ messages: list });
  } catch (err) {
    console.error("Fetch chat error:", err);
    return res.status(500).json({ error: "Failed to fetch chat messages" });
  }
});

app.post("/api/chat/messages", async (req, res) => {
  try {
    const { id, coupleId, senderLogin, role, content, createdAt } = req.body;
    const msgObj = {
      id: id || "msg_" + Date.now(),
      coupleId,
      senderLogin,
      role,
      content,
      isRead: false,
      createdAt: createdAt || new Date().toISOString(),
    };

    if (isSqlConfigured()) {
      try {
        await db.insert(chatMessages).values(msgObj);
      } catch (e) {
        // Fallback
      }
    }

    const store = readDbFile();
    if (!store.chatMessages) store.chatMessages = [];
    store.chatMessages.push(msgObj);
    writeDbFile(store);

    return res.json({ success: true });
  } catch (err) {
    console.error("Send chat error:", err);
    return res.status(500).json({ error: "Failed to send chat message" });
  }
});

app.post("/api/couple/sync", async (req, res) => {
  try {
    const { login1, login2, payload } = req.body;
    if (!login1 || !login2)
      return res
        .status(400)
        .json({ error: "Необходимы логины обоих партнёров" });

    const l1 = String(login1).toLowerCase().replace(/^@/, "");
    const l2 = String(login2).toLowerCase().replace(/^@/, "");
    const key = [l1, l2].sort().join("_");

    const store = readDbFile();
    let existingData = store.coupleData?.[key] || {};

    if (isSqlConfigured()) {
      try {
        const existingRow = await db
          .select()
          .from(coupleData)
          .where(eq(coupleData.id, key))
          .limit(1);
        if (existingRow.length > 0) {
          existingData = existingRow[0].data as Record<string, any>;
        }
      } catch (e) {
        // Fallback
      }
    }

    const merged = {
      ...existingData,
      ...payload,
      lastUpdatedAt: new Date().toISOString(),
    };

    if (!store.coupleData) store.coupleData = {};
    store.coupleData[key] = merged;
    writeDbFile(store);

    if (isSqlConfigured()) {
      try {
        const existingRow = await db
          .select()
          .from(coupleData)
          .where(eq(coupleData.id, key))
          .limit(1);
        if (existingRow.length > 0) {
          await db
            .update(coupleData)
            .set({ data: merged, lastUpdatedAt: new Date().toISOString() })
            .where(eq(coupleData.id, key));
        } else {
          await db.insert(coupleData).values({
            id: key,
            data: merged,
            lastUpdatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        // Fallback
      }
    }

    return res.json({ status: "ok", data: merged });
  } catch (err) {
    console.error("Couple sync error:", err);
    return res.status(500).json({ error: "Ошибка синхронизации данных пары" });
  }
});

app.get("/api/couple/data/:login1/:login2", async (req, res) => {
  try {
    const { login1, login2 } = req.params;
    const l1 = String(login1).toLowerCase().replace(/^@/, "");
    const l2 = String(login2).toLowerCase().replace(/^@/, "");
    const key = [l1, l2].sort().join("_");

    const store = readDbFile();
    let data = store.coupleData?.[key] || null;

    if (isSqlConfigured()) {
      try {
        const existingRow = await db
          .select()
          .from(coupleData)
          .where(eq(coupleData.id, key))
          .limit(1);
        if (existingRow.length > 0) {
          data = existingRow[0].data;
        }
      } catch (e) {
        // Fallback
      }
    }

    return res.json({ data });
  } catch (err) {
    console.error("Couple data get error:", err);
    return res.status(500).json({ error: "Ошибка загрузки данных пары" });
  }
});

app.post("/api/push/subscribe", (req, res) => {
  const { subscription, partnerId, coupleId } = req.body;
  if (subscription) {
    pushSubscriptions.push({
      subscription,
      partnerId,
      coupleId,
      subscribedAt: new Date().toISOString(),
    });
  }
  res.json({ status: "subscribed", count: pushSubscriptions.length });
});

app.post("/api/push/send-test", async (req, res) => {
  const { title, body } = req.body;
  // In production, user's backend agent will wire up web-push package with VAPID keys:
  // webpush.sendNotification(subscription, JSON.stringify({ title, body }))
  res.json({
    status: "dispatched",
    title: title || "Loop • Внимание партнёра",
    body: body || "Тестовое уведомление доставлено.",
  });
});

// AI Psychologist Chat ("Сова")
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, coupleContext, currentPartner } = req.body;

    const partnerName = currentPartner?.name || "Партнёр";
    const partner2Name = coupleContext?.user2?.name || "Второй партнёр";

    const systemPrompt = `Ты — Сова, опытный, бережный и доказательный семейный психолог приложения для пар Loop.

ТВОЙ СТИЛЬ:
- Говори как настоящий чуткий психотерапевт: спокойно, поддерживающе, структурно и предельно ЛАКОНИЧНО.
- БЕЗ ВОДЫ И ШАБЛОННЫХ ВСТУПЛЕНИЙ: сразу переходи к сути вопроса.
- ДЛИНА ОТВЕТА: строго 70–130 слов (2-3 коротких смысловых блока). Ответ должен легко считываться с экрана смартфона за 20 секунд.

ФОРМАТИРОВАНИЕ ОТВЕТА:
- Используй только обычный текст, абзацы и эмодзи.
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать Markdown-таблицы, блоки кода (\`\`\`) или HTML-теги.
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
- Язык любви ${partner2Name}: ${coupleContext?.user2?.loveLanguage || "не указан"}
- Привязанность: ${coupleContext?.user1?.attachment || "не указано"}`;

    const lastUserMessageObj = messages && messages.length > 0 ? messages[messages.length - 1] : null;
    const lastUserText = lastUserMessageObj?.content || "";

    // Check off-topic
    const offTopicKeywords = [
      "шкаф", "код", "программ", "python", "javascript", "машин", "ремонт",
      "рецепт", "пирог", "президент", "политик", "забудь", "игнорируй"
    ];
    if (offTopicKeywords.some((k) => lastUserText.toLowerCase().includes(k))) {
      return res.json({
        reply: `Я семейный психолог Сова и специализируюсь исключительно на отношениях, чувствах и гармонии в паре.\n\nФизические и технические инструкции лучше посмотреть в руководстве пользователя. А вот если в процессе совместного дела возникло недопонимание или спор — я с радостью помогу всё экологично уладить! О чём в отношениях вы хотите поговорить?`,
        mode: "fallback_guardrail",
      });
    }

    // Единственный провайдер — Groq
    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    ];

    const groqReply = await callGroqChat(groqMessages);
    if (groqReply) {
      return res.json({ reply: groqReply, mode: "groq" });
    }

    console.error("❌ [AI] Groq недоступен — возвращаю заглушку");
    const smartReply = generateSmartPsychologistReply(lastUserText, partnerName, partner2Name);
    return res.json({
      reply: smartReply,
      mode: "smart_psychologist_engine",
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    const partnerName = req.body?.currentPartner?.name || "Партнёр";
    const partner2Name = req.body?.coupleContext?.user2?.name || "партнёр";
    const fallback = generateSmartPsychologistReply(
      req.body?.messages?.slice(-1)?.[0]?.content || "",
      partnerName,
      partner2Name
    );
    return res.json({
      reply: fallback,
      mode: "safety_fallback",
    });
  }
});

// AI Couple Report & Deep Insights Generator
app.post("/api/ai/generate-report", async (req, res) => {
  try {
    const { coupleData } = req.body;

    const prompt = `Проанализируй данные пары для приложения Loop и составь глубокий, научно обоснованный психологический отчёт о совместимости:
Данные пары: ${JSON.stringify(coupleData || {})}

Верни строго JSON со следующими полями:
{
  "title": "краткий вдохновляющий заголовок архетипа пары",
  "summary": "глубокий психологический вывод на 3-4 предложения",
  "strengths": ["сильная сторона 1", "сильная сторона 2", "сильная сторона 3"],
  "growthZones": ["зона роста 1", "зона роста 2"],
  "gottmanTips": "конкретная рекомендация по методу Джона Готтмана с упражнением для этой недели"
}`;

    // Единственный провайдер — Groq
    const groqReply = await callGroqChat([
      {
        role: "system",
        content:
          "Ты — эксперт семейной психологии. Отвечай строго валидным JSON без markdown обёрток.",
      },
      { role: "user", content: prompt },
    ]);

    if (groqReply) {
      try {
        const clean = groqReply
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const parsed = JSON.parse(clean);
        return res.json({ report: parsed });
      } catch (e) {
        console.warn("Groq JSON parse fallback", e);
      }
    }

    // 2. Fallback
    return res.json({
      report: {
        title: "«Гармоничный якорь & Общий парус»",
        summary:
          "Ваша пара демонстрирует высокий уровень базового доверия и прекрасную эмоциональную синхронизацию. Сильная сторона пары — способность слышать партнёра и обоюдное желание вкладываться в совместное качество времени.",
        strengths: [
          "Высокое совпадение в ценностях свободы и долгосрочных семейных планов (96%).",
          "Осознанное применение «мягкого старта» в спорах без перехода на личности (86%).",
          "Взаимная забота через язык «Качественного времени» и микро-сюрпризы (93%).",
        ],
        growthZones: [
          "Усталость в будние дни: важно договариваться об уровне энергии до вечерних планов.",
          "Баланс «Мы vs Я»: бережно сохранять личные хобби без чувства вины.",
        ],
        gottmanTips:
          'Практикуйте "Эмоциональный банковский счёт": делайте 5 позитивных микро-касаний на 1 сложный разговор.',
      },
    });
  } catch (err: any) {
    console.error("Report generation error:", err);
    return res.status(500).json({ error: "Ошибка генерации отчёта" });
  }
});

// AI Date Plan Generator
app.post("/api/ai/date-idea", async (req, res) => {
  try {
    const { vibe, budget, city, partner1, partner2 } = req.body;

    const prompt = `Составь персонализированный сценарий свидания для пары в приложении Loop:
Город: ${city || "Москва"}
Вайб: ${vibe || "Романтика и уют"}
Бюджет: ${budget || "Средний"}
Партнёр 1 (${partner1?.name}): Язык любви — ${partner1?.loveLanguage || "Время"}
Партнёр 2 (${partner2?.name}): Язык любви — ${partner2?.loveLanguage || "Прикосновения"}

Верни строго валидный JSON:
{
  "title": "Название свидания",
  "description": "Описание атмосферы и концепции",
  "steps": ["Шаг 1 с таймингом", "Шаг 2 с таймингом", "Шаг 3 с таймингом"],
  "topicToDiscuss": "Глубокий вопрос для душевного сближения во время свидания",
  "sweetDetail": "Маленькая деталь-сюрприз, которая порадует партнёра"
}`;

    // 1. Try Groq
    const groqReply = await callGroqChat([
      {
        role: "system",
        content:
          "Ты — романтический консьерж и организатор свиданий. Отвечай строго валидным JSON без лишнего текста.",
      },
      { role: "user", content: prompt },
    ]);

    if (groqReply) {
      try {
        const clean = groqReply
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const parsed = JSON.parse(clean);
        return res.json({ idea: parsed });
      } catch (e) {
        console.warn("Groq date JSON parse fallback", e);
      }
    }

    // 2. Fallback
    return res.json({
      idea: {
        title: `Романтический вечер в стиле «${vibe || "Уют и неспешность"}»`,
        description: `План свидания для ${partner1?.name || "вас"} и ${partner2?.name || "вашего партнёра"}: начните с неспешного кофе в тихом месте, прогуляйтесь по вечерним огням и завершите вечер глубоким разговором с карточками вопросов Loop.`,
        steps: [
          "18:30 — Встреча в любимом уютном месте без телефонов",
          "19:30 — Неспешная прогулка с обсуждением 3 приятных воспоминаний за месяц",
          "20:30 — Уютный ужин и обмен маленькими сюрпризами",
        ],
        topicToDiscuss:
          "Что из нашего совместного года заставило тебя больше всего улыбнуться?",
        sweetDetail:
          "Заранее спрячьте в карман пальто партнёра записку с теплым признанием",
      },
    });
  } catch (err) {
    console.error("Date generation error:", err);
    return res.status(500).json({ error: "Ошибка генерации свидания" });
  }
});

// Vite Middleware for SPA development & static serving
async function startServer() {
  await initDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Loop App Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
