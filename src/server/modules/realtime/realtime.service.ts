import { recentTouches, TouchRecord, sendSSEEventToUser, registerSSEClient, removeSSEClient } from "../../shared/utils/sse.ts";
import { logger } from "../../shared/utils/logger.ts";

export interface PushSubscriptionRecord {
  subscription: any;
  partnerId?: string;
  coupleId?: string;
  subscribedAt: string;
}

export const pushSubscriptions: PushSubscriptionRecord[] = [];

export function sendQuickTouch(params: {
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

  // Broadcast in realtime to target partner via Server-Sent Events (SSE)
  sendSSEEventToUser(tLogin, "touch", newTouch);

  logger.info("Быстрое касание доставлено", {
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

export { recentTouches, sendSSEEventToUser, registerSSEClient, removeSSEClient };
