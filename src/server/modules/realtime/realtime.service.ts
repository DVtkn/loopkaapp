import { recentTouches, TouchRecord, sendSSEEventToUser, registerSSEClient, removeSSEClient } from "../../shared/utils/sse.ts";
import { logger } from "../../shared/utils/logger.ts";
import { db, isSqlConfigured } from "../../db/client.ts";
import { coupleEvents, users } from "../../db/schema.ts";
import { eq, or, and, gt, desc } from "drizzle-orm";

export interface PushSubscriptionRecord {
  subscription: any;
  partnerId?: string;
  coupleId?: string;
  subscribedAt: string;
}

export const pushSubscriptions: PushSubscriptionRecord[] = [];

export async function recordCoupleEvent(params: {
  coupleId: string;
  targetLogin: string;
  senderLogin: string;
  eventType: string;
  payload: any;
  id?: string;
}) {
  const eventId = params.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  if (isSqlConfigured() && db) {
    try {
      await db.insert(coupleEvents).values({
        id: eventId,
        coupleId: params.coupleId,
        targetLogin: params.targetLogin,
        senderLogin: params.senderLogin,
        eventType: params.eventType,
        payload: params.payload,
        createdAt: nowIso,
      });
    } catch (err: unknown) {
      logger.warn("Не удалось сохранить событие в таблицу couple_events", undefined, err);
    }
  }

  // Также пробуем доставить через SSE, если подписчик подключен
  sendSSEEventToUser(params.targetLogin, params.eventType, params.payload);

  return { id: eventId, createdAt: nowIso };
}

export async function sendQuickTouch(params: {
  senderLogin: string;
  senderName?: string;
  targetLogin: string;
  actionType: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  customNote?: string;
}) {
  const sLogin = String(params.senderLogin).toLowerCase().replace(/^@/, "");
  const tLogin = String(params.targetLogin).toLowerCase().replace(/^@/, "");

  // 10-second anti-spam debounce check per actionType between pair
  const now = Date.now();
  const tenSecondsAgo = now - 10000;
  const existingRecent = recentTouches.find(
    (t) =>
      t.senderLogin === sLogin &&
      t.targetLogin === tLogin &&
      t.actionType === params.actionType &&
      new Date(t.createdAt).getTime() > tenSecondsAgo
  );

  if (existingRecent) {
    return {
      status: "throttled",
      throttled: true,
      message: "Действие уже отправлено недавно",
      touch: existingRecent,
    };
  }

  const newTouch: TouchRecord = {
    id: `touch-${now}-${Math.random().toString(36).slice(2, 7)}`,
    senderLogin: sLogin,
    senderName: params.senderName || sLogin,
    targetLogin: tLogin,
    actionType: params.actionType,
    title: params.title || `${params.senderName || sLogin} обратил(а) на вас внимание`,
    subtitle: params.subtitle || "Только что",
    icon: params.icon || "heart",
    iconBg: params.iconBg || "bg-rose-500/10",
    iconColor: params.iconColor || "text-rose-500",
    customNote: params.customNote,
    createdAt: new Date().toISOString(),
  };

  recentTouches.unshift(newTouch);
  if (recentTouches.length > 200) recentTouches.pop();

  const coupleKey = [sLogin, tLogin].sort().join("_");

  // Сохраняем в таблицу couple_events в Neon DB
  if (isSqlConfigured() && db) {
    try {
      await db.insert(coupleEvents).values({
        id: newTouch.id,
        coupleId: coupleKey,
        targetLogin: tLogin,
        senderLogin: sLogin,
        eventType: "touch",
        payload: newTouch,
        createdAt: newTouch.createdAt,
      });
    } catch (err: unknown) {
      logger.warn("Не удалось записать касание в couple_events (PostgreSQL)", undefined, err);
    }
  }

  // Broadcast in realtime to target partner via Server-Sent Events (SSE) если сокет ещё жив
  sendSSEEventToUser(tLogin, "touch", newTouch);

  logger.info("Быстрое касание сохранено в БД и отправлено", {
    from: sLogin,
    to: tLogin,
    action: params.actionType,
  });

  return {
    status: "dispatched",
    throttled: false,
    touch: newTouch,
  };
}

export function getUserTouches(login: string) {
  const cleanLogin = String(login || "").toLowerCase().replace(/^@/, "");
  return recentTouches.filter(
    (t) => t.targetLogin === cleanLogin || t.senderLogin === cleanLogin
  );
}

export async function handleHeartbeat(login: string) {
  const cleanLogin = String(login || "").toLowerCase().replace(/^@/, "");
  const nowIso = new Date().toISOString();
  let partnerLastActiveAt: string | null = null;
  let partnerLogin: string | null = null;

  if (isSqlConfigured() && db && cleanLogin) {
    try {
      // 1. Обновляем активность текущего пользователя
      await db.update(users).set({ lastActiveAt: nowIso }).where(eq(users.login, cleanLogin));

      // 2. Получаем партнёра для проверки его статуса
      const [currentUserRecord] = await db.select().from(users).where(eq(users.login, cleanLogin)).limit(1);
      if (currentUserRecord?.partnerLogin) {
        partnerLogin = currentUserRecord.partnerLogin;
        const [partnerRecord] = await db.select().from(users).where(eq(users.login, partnerLogin)).limit(1);
        if (partnerRecord?.lastActiveAt) {
          partnerLastActiveAt = partnerRecord.lastActiveAt;
        }
      }
    } catch (err: unknown) {
      logger.warn("Heartbeat error in Neon DB", undefined, err);
    }
  }

  const isPartnerOnline = partnerLastActiveAt
    ? (Date.now() - new Date(partnerLastActiveAt).getTime()) < 60000
    : false;

  return {
    ok: true,
    timestamp: nowIso,
    login: cleanLogin,
    partnerLogin,
    partnerLastActiveAt,
    isPartnerOnline,
  };
}

export async function getEventsPoll(params: {
  login: string;
  coupleId?: string;
  lastEventId?: string;
  since?: string;
}) {
  const cleanLogin = String(params.login || "").toLowerCase().replace(/^@/, "");
  const nowIso = new Date().toISOString();
  const events: any[] = [];
  let partnerLastActiveAt: string | null = null;

  // 1. Загружаем статус партнёра из БД
  if (isSqlConfigured() && db && cleanLogin) {
    try {
      const [currentUserRecord] = await db.select().from(users).where(eq(users.login, cleanLogin)).limit(1);
      if (currentUserRecord?.partnerLogin) {
        const [partnerRecord] = await db.select().from(users).where(eq(users.login, currentUserRecord.partnerLogin)).limit(1);
        if (partnerRecord?.lastActiveAt) {
          partnerLastActiveAt = partnerRecord.lastActiveAt;
        }
      }

      // Загружаем события для cleanLogin за последние 45 секунд
      const cutoffTime = params.since || new Date(Date.now() - 45000).toISOString();
      const dbEvents = await db
        .select()
        .from(coupleEvents)
        .where(
          and(
            eq(coupleEvents.targetLogin, cleanLogin),
            gt(coupleEvents.createdAt, cutoffTime)
          )
        )
        .orderBy(desc(coupleEvents.createdAt))
        .limit(30);

      for (const ev of dbEvents) {
        if (params.lastEventId && ev.id === params.lastEventId) continue;
        events.push({
          id: ev.id,
          type: ev.eventType,
          data: ev.payload,
          createdAt: ev.createdAt,
        });
      }
    } catch (err: unknown) {
      logger.warn("Events poll error in Neon DB", undefined, err);
    }
  }

  // Fallback к in-memory recentTouches если в БД пусто
  if (events.length === 0) {
    const memoryTouches = recentTouches.filter(
      (t) => t.targetLogin === cleanLogin && (!params.lastEventId || t.id !== params.lastEventId)
    );
    for (const t of memoryTouches.slice(0, 10)) {
      events.push({
        id: t.id,
        type: "touch",
        data: t,
        createdAt: t.createdAt,
      });
    }
  }

  const isPartnerOnline = partnerLastActiveAt
    ? (Date.now() - new Date(partnerLastActiveAt).getTime()) < 60000
    : false;

  return {
    events,
    touches: getUserTouches(cleanLogin),
    partnerLastActiveAt,
    isPartnerOnline,
    serverTime: nowIso,
  };
}

export { recentTouches, sendSSEEventToUser, registerSSEClient, removeSSEClient };
