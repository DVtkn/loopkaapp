import { CoupleData } from "../types.ts";

export async function syncCoupleDataApi(
  login1: string,
  login2: string | null | undefined,
  payload: Partial<CoupleData>,
  token: string
): Promise<{ status?: string; key?: string; data?: CoupleData; error?: string }> {
  const res = await fetch("/api/couple/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ login1, login2, payload }),
  });
  return await res.json();
}

export async function fetchCoupleDataApi(
  key: string,
  token: string
): Promise<{ data: CoupleData | null; error?: string }> {
  const res = await fetch(`/api/couple/data/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

export async function sendQuickTouchApi(
  params: {
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
  },
  token: string
): Promise<any> {
  const res = await fetch("/api/couple/touch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return await res.json();
}
