import fs from 'fs';
import path from 'path';
import { sql, eq, or } from 'drizzle-orm';
import { db, isSqlConfigured } from '../../db/index.ts';
import { users, coupleData } from '../../db/schema.ts';
import { logger } from '../logger.ts';
import { DbUser, DbUserInsert, JsonStoreShape } from '../types.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db_store.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err: unknown) {
    logger.error('Не удалось создать директорию для аварийного хранилища', err, { path: DATA_DIR });
  }
}

export function readEmergencyFile(): JsonStoreShape {
  ensureDataDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || {},
        pairRequests: parsed.pairRequests || [],
        coupleData: parsed.coupleData || {},
        chatMessages: parsed.chatMessages || [],
        rateLimits: parsed.rateLimits || {},
      };
    }
  } catch (err: unknown) {
    logger.error('Ошибка чтения аварийного файла db_store.json', err);
  }
  return { users: {}, pairRequests: [], coupleData: {}, chatMessages: [], rateLimits: {} };
}

export function writeEmergencyFile(data: JsonStoreShape): void {
  if (process.env.NODE_ENV === "production") {
    // В Cloud Run контейнер эфемерен. Запись в файл бесполезна и может
    // скрыть проблему с БД. В production этот фолбэк полностью отключён.
    return;
  }
  ensureDataDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err: unknown) {
    logger.error('Ошибка записи в аварийный файл db_store.json', err);
  }
}

export async function findUserByLogin(login: string): Promise<DbUser | undefined> {
  const clean = login.trim().toLowerCase().replace(/^@/, '');
  if (!clean) return undefined;

  if (isSqlConfigured() && db) {
    try {
      const res = await db
        .select()
        .from(users)
        .where(sql`LOWER(${users.login}) = ${clean}`)
        .limit(1);
      if (res && res.length > 0) {
        return res[0];
      }
      return undefined;
    } catch (err: unknown) {
      logger.warn('SQL запрос findUserByLogin завершился с ошибкой, переключение на резервный файл', { login: clean }, err);
    }
  }

  const store = readEmergencyFile();
  return store.users[clean] || Object.values(store.users).find((u) => u && String(u.login).toLowerCase() === clean);
}

export async function findUserByQuery(query: string): Promise<DbUser | undefined> {
  const clean = query.trim().toLowerCase().replace(/^@/, '');
  if (!clean) return undefined;

  if (isSqlConfigured() && db) {
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
        return res[0];
      }
      return undefined;
    } catch (err: unknown) {
      logger.warn('SQL запрос findUserByQuery завершился с ошибкой, переключение на резервный файл', { query: clean }, err);
    }
  }

  const store = readEmergencyFile();
  return (
    store.users[clean] ||
    Object.values(store.users).find(
      (u) => u && (String(u.login).toLowerCase() === clean || String(u.name || '').toLowerCase() === clean)
    )
  );
}

export async function upsertUser(userData: DbUserInsert): Promise<void> {
  const cleanLogin = userData.login.trim().toLowerCase().replace(/^@/, '');
  const normalizedData = { ...userData, login: cleanLogin };

  if (isSqlConfigured() && db) {
    try {
      await db
        .insert(users)
        .values(normalizedData)
        .onConflictDoUpdate({
          target: users.login,
          set: normalizedData,
        });
      return;
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "production") {
        logger.error('CRITICAL: SQL upsertUser failed in production. File fallback is disabled.', err, { login: cleanLogin });
        throw err;
      }
      logger.error('SQL запись пользователя завершилась сбоем, сохранение в аварийное хранилище', err, { login: cleanLogin });
    }
  }

  if (process.env.NODE_ENV === "production") {
     throw new Error("Cannot save user: Database is not configured and file fallback is disabled in production.");
  }

  const store = readEmergencyFile();
  store.users[cleanLogin] = { ...(store.users[cleanLogin] || {}), ...normalizedData } as DbUser;
  writeEmergencyFile(store);
}

export async function getCoupleData(key: string): Promise<any | null> {
  if (isSqlConfigured() && db) {
    try {
      const rows = await db.select().from(coupleData).where(eq(coupleData.id, key)).limit(1);
      if (rows && rows.length > 0) {
        return rows[0].data;
      }
      return null;
    } catch (err: unknown) {
      logger.warn('SQL чтение coupleData сбоит, попытка чтения аварийного файла', { key }, err);
    }
  }

  const store = readEmergencyFile();
  return store.coupleData?.[key] || null;
}

export async function saveCoupleData(key: string, data: any): Promise<void> {
  const now = new Date().toISOString();

  if (isSqlConfigured() && db) {
    try {
      await db
        .insert(coupleData)
        .values({
          id: key,
          data,
          lastUpdatedAt: now,
        })
        .onConflictDoUpdate({
          target: coupleData.id,
          set: {
            data,
            lastUpdatedAt: now,
          },
        });
      return;
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "production") {
        logger.error('CRITICAL: SQL saveCoupleData failed in production. File fallback is disabled.', err, { key });
        throw err;
      }
      logger.error('SQL запись coupleData сбоит, сохранение в аварийный файл', err, { key });
    }
  }

  if (process.env.NODE_ENV === "production") {
     throw new Error("Cannot save couple data: Database is not configured and file fallback is disabled in production.");
  }

  const store = readEmergencyFile();
  if (!store.coupleData) store.coupleData = {};
  store.coupleData[key] = data;
  writeEmergencyFile(store);
}
