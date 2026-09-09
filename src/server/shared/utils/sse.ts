import { Response } from "express";

export interface TouchRecord {
  id: string;
  senderLogin: string;
  senderName: string;
  targetLogin: string;
  actionType: string;
  title: string;
  subtitle?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  customNote?: string;
  createdAt: string;
}

export const recentTouches: TouchRecord[] = [];
export const sseClients: Map<string, Response[]> = new Map();

export function registerSSEClient(login: string, res: Response) {
  const cleanLogin = login.toLowerCase().replace(/^@/, "");
  if (!sseClients.has(cleanLogin)) {
    sseClients.set(cleanLogin, []);
  }
  sseClients.get(cleanLogin)!.push(res);
}

export function removeSSEClient(login: string, res: Response) {
  const cleanLogin = login.toLowerCase().replace(/^@/, "");
  const clients = sseClients.get(cleanLogin);
  if (clients) {
    const idx = clients.indexOf(res);
    if (idx !== -1) clients.splice(idx, 1);
    if (clients.length === 0) sseClients.delete(cleanLogin);
  }
}

export function sendSSEEventToUser(login: string, eventType: string, payload: any) {
  const cleanLogin = login.toLowerCase().replace(/^@/, "");
  const clients = sseClients.get(cleanLogin);
  if (clients && clients.length > 0) {
    const data = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    clients.forEach((res) => {
      try {
        res.write(data);
      } catch (err) {
        // client disconnected
      }
    });
  }
}
