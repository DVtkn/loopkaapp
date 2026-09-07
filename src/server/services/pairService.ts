import { eq, or, and } from 'drizzle-orm';
import crypto from 'crypto';
import { db, isSqlConfigured } from '../../db/index.ts';
import { users, pairRequests } from '../../db/schema.ts';
import { logger } from '../logger.ts';
import { readEmergencyFile, writeEmergencyFile, findUserByLogin } from './storageService.ts';
import { DbUser, DbPairRequest } from '../types.ts';

export async function acceptPair(cleanMe: string, cleanPartner: string) {
  const now = new Date().toISOString();

  let sqlSuccess = false;

  // 1. Transactional update in PostgreSQL (Single Source of Truth)
  if (isSqlConfigured() && db) {
    try {
      await db.transaction(async (tx) => {
        // Atomic partner connection
        await tx
          .update(users)
          .set({ partnerLogin: cleanPartner, pairedAt: now })
          .where(eq(users.login, cleanMe));

        await tx
          .update(users)
          .set({ partnerLogin: cleanMe, pairedAt: now })
          .where(eq(users.login, cleanPartner));

        // Delete active requests between these two
        await tx.delete(pairRequests).where(
          or(
            and(eq(pairRequests.fromLogin, cleanPartner), eq(pairRequests.toLogin, cleanMe)),
            and(eq(pairRequests.fromLogin, cleanMe), eq(pairRequests.toLogin, cleanPartner))
          )
        );
      });
      sqlSuccess = true;
      logger.info('Транзакция связывания пары успешно завершена', {
        partner1: cleanMe,
        partner2: cleanPartner,
      });
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "production") {
        logger.error('CRITICAL: Transaction acceptPair failed in production.', err, {
          partner1: cleanMe,
          partner2: cleanPartner,
        });
        throw err;
      }
      logger.error('Транзакция связывания пары завершилась ошибкой (откат)', err, {
        partner1: cleanMe,
        partner2: cleanPartner,
      });
    }
  }

  // 2. Fallback to file storage ONLY if SQL failed or is not configured
  if (!sqlSuccess) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cannot accept pair: Database is not configured and file fallback is disabled in production.");
    }
    logger.warn('Использован аварийный механизм связывания пары в файле db_store.json', {
      partner1: cleanMe,
      partner2: cleanPartner,
    });
    const store = readEmergencyFile();
    if (store.users[cleanMe]) {
      store.users[cleanMe] = { ...store.users[cleanMe], partnerLogin: cleanPartner, pairedAt: now };
    }
    if (store.users[cleanPartner]) {
      store.users[cleanPartner] = { ...store.users[cleanPartner], partnerLogin: cleanMe, pairedAt: now };
    }
    if (store.pairRequests) {
      store.pairRequests = store.pairRequests.filter(
        (r) =>
          !(
            (r.fromLogin === cleanPartner && r.toLogin === cleanMe) ||
            (r.fromLogin === cleanMe && r.toLogin === cleanPartner)
          )
      );
    }
    writeEmergencyFile(store);
  }

  const updatedMe = await findUserByLogin(cleanMe);
  const updatedPartner = await findUserByLogin(cleanPartner);

  return { updatedMe, updatedPartner };
}

export async function disconnectPair(cleanLogin: string) {
  const user = await findUserByLogin(cleanLogin);
  if (!user) {
    return { error: 'Пользователь не найден', status: 404 };
  }
  const partnerLogin = user.partnerLogin ? String(user.partnerLogin).toLowerCase() : null;

  let sqlSuccess = false;

  if (isSqlConfigured() && db) {
    try {
      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ partnerLogin: null, pairedAt: null })
          .where(eq(users.login, cleanLogin));

        if (partnerLogin) {
          await tx
            .update(users)
            .set({ partnerLogin: null, pairedAt: null })
            .where(eq(users.login, partnerLogin));

          await tx.delete(pairRequests).where(
            or(
              and(eq(pairRequests.fromLogin, cleanLogin), eq(pairRequests.toLogin, partnerLogin)),
              and(eq(pairRequests.fromLogin, partnerLogin), eq(pairRequests.toLogin, cleanLogin))
            )
          );
        }
      });
      sqlSuccess = true;
      logger.info('Транзакция разрыва пары успешно завершена', {
        user: cleanLogin,
        partner: partnerLogin,
      });
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "production") {
        logger.error('CRITICAL: Transaction disconnectPair failed in production.', err, {
          user: cleanLogin,
          partner: partnerLogin,
        });
        throw err;
      }
      logger.error('Транзакция разрыва пары завершилась ошибкой (откат)', err, {
        user: cleanLogin,
        partner: partnerLogin,
      });
    }
  }

  if (!sqlSuccess) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cannot disconnect pair: Database is not configured and file fallback is disabled in production.");
    }
    logger.warn('Использован аварийный механизм разрыва пары в файле db_store.json', {
      user: cleanLogin,
      partner: partnerLogin,
    });
    const store = readEmergencyFile();
    if (store.users[cleanLogin]) {
      store.users[cleanLogin] = { ...store.users[cleanLogin], partnerLogin: null, pairedAt: null };
    }
    if (partnerLogin && store.users[partnerLogin]) {
      store.users[partnerLogin] = { ...store.users[partnerLogin], partnerLogin: null, pairedAt: null };
    }
    if (store.pairRequests && partnerLogin) {
      store.pairRequests = store.pairRequests.filter(
        (r) =>
          !(
            (r.fromLogin === cleanLogin && r.toLogin === partnerLogin) ||
            (r.fromLogin === partnerLogin && r.toLogin === cleanLogin)
          )
      );
    }
    writeEmergencyFile(store);
  }

  const updatedUser = await findUserByLogin(cleanLogin);
  return { updatedUser, status: 200 };
}

export async function createPairRequest(fromUser: DbUser, toUser: DbUser) {
  const cleanFrom = fromUser.login.toLowerCase();
  const cleanTo = toUser.login.toLowerCase();
  const now = new Date().toISOString();
  const reqId = crypto.randomUUID();

  const reqObj: DbPairRequest = {
    id: reqId,
    fromLogin: cleanFrom,
    fromName: fromUser.name || cleanFrom,
    fromAvatar: fromUser.avatarEmoji || 'sparkles',
    toLogin: cleanTo,
    status: 'PENDING',
    createdAt: now,
  };

  let sqlSuccess = false;

  if (isSqlConfigured() && db) {
    try {
      // Remove any previous pending requests between them
      await db.transaction(async (tx) => {
        await tx.delete(pairRequests).where(
          or(
            and(eq(pairRequests.fromLogin, cleanFrom), eq(pairRequests.toLogin, cleanTo)),
            and(eq(pairRequests.fromLogin, cleanTo), eq(pairRequests.toLogin, cleanFrom))
          )
        );
        await tx.insert(pairRequests).values(reqObj);
      });
      sqlSuccess = true;
      logger.info('Запрос на пару создан (SQL транзакция)', { from: cleanFrom, to: cleanTo });
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "production") {
        logger.error('CRITICAL: Transaction createPairRequest failed in production.', err, { from: cleanFrom, to: cleanTo });
        throw err;
      }
      logger.error('Сбой создания запроса на пару в SQL', err, { from: cleanFrom, to: cleanTo });
    }
  }

  if (!sqlSuccess) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cannot create pair request: Database is not configured and file fallback is disabled in production.");
    }
    logger.warn('Запрос на пару сохранён в аварийное хранилище JSON', { from: cleanFrom, to: cleanTo });
    const store = readEmergencyFile();
    if (!store.pairRequests) store.pairRequests = [];
    store.pairRequests = store.pairRequests.filter(
      (r) =>
        !(
          (r.fromLogin === cleanFrom && r.toLogin === cleanTo) ||
          (r.fromLogin === cleanTo && r.toLogin === cleanFrom)
        )
    );
    store.pairRequests.push(reqObj);
    writeEmergencyFile(store);
  }

  return reqObj;
}
