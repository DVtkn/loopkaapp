import { User, PairRequest } from "../types.ts";

export async function sendPairRequestApi(fromLogin: string, toLogin: string, token: string): Promise<{ request?: PairRequest; message?: string; error?: string }> {
  const res = await fetch("/api/pair/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fromLogin, toLogin }),
  });
  return await res.json();
}

export async function acceptPairRequestApi(fromLogin: string, toLogin: string, token: string): Promise<{ status?: string; me?: User; partner?: User; error?: string }> {
  const res = await fetch("/api/pair/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fromLogin, toLogin }),
  });
  return await res.json();
}

export async function rejectPairRequestApi(fromLogin: string, toLogin: string, token: string): Promise<{ status?: string; error?: string }> {
  const res = await fetch("/api/pair/reject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fromLogin, toLogin }),
  });
  return await res.json();
}

export async function disconnectPairApi(login: string, token: string): Promise<{ status?: string; user?: User; error?: string }> {
  const res = await fetch("/api/pair/disconnect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ login }),
  });
  return await res.json();
}

export async function fetchPairStatusApi(login: string, token: string): Promise<{
  paired: boolean;
  user: User;
  partner: User | null;
  incomingRequests: PairRequest[];
  outgoingRequests: PairRequest[];
  error?: string;
}> {
  const res = await fetch(`/api/pair/status/${encodeURIComponent(login)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}
