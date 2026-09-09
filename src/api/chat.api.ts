import { ChatMessage } from "../types.ts";

export async function fetchCoupleMessagesApi(
  coupleId: string,
  token: string
): Promise<{ messages?: ChatMessage[]; error?: string }> {
  const res = await fetch(`/api/chat/messages/${encodeURIComponent(coupleId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

export async function sendChatMessageApi(
  params: { coupleId: string; senderLogin: string; content: string; role?: string },
  token: string
): Promise<{ message?: ChatMessage; error?: string }> {
  const res = await fetch("/api/chat/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return await res.json();
}

export async function fetchAIMessagesApi(
  login: string,
  token: string
): Promise<{ messages?: ChatMessage[]; error?: string }> {
  const res = await fetch(`/api/ai/messages/${encodeURIComponent(login)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

export async function sendAIChatApi(
  params: {
    messages: Array<{ role: string; content: string }>;
    userLogin?: string;
    currentPartner?: any;
    coupleContext?: any;
    context?: any;
  },
  token: string
): Promise<{ reply?: string; mode?: string; error?: string }> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return await res.json();
}

export async function generateAIReportApi(
  coupleProfile: any,
  radarScores: any,
  token: string
): Promise<any> {
  const res = await fetch("/api/ai/generate-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ coupleProfile, radarScores }),
  });
  return await res.json();
}

export async function generateAIDateIdeaApi(
  params: { budget?: string; vibe?: string; location?: string; coupleProfile?: any },
  token: string
): Promise<any> {
  const res = await fetch("/api/ai/date-idea", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return await res.json();
}
