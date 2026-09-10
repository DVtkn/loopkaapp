import { User } from "../types.ts";

export interface AuthResponse {
  token?: string;
  user?: User;
  error?: string;
}

export async function loginUserApi(login: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  return await res.json();
}

export async function registerUserApi(login: string, password: string, name?: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password, name }),
  });
  return await res.json();
}

export async function fetchUserProfileApi(login: string, token: string): Promise<{ user?: User; error?: string }> {
  const res = await fetch(`/api/auth/user/${encodeURIComponent(login)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

export async function updateUserProfileApi(updates: Partial<User>, token: string): Promise<{ user?: User; error?: string }> {
  const res = await fetch("/api/auth/update-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  return await res.json();
}

export async function changePasswordApi(oldPassword: string, newPassword: string, token: string): Promise<{ status?: string; message?: string; error?: string }> {
  const res = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return await res.json();
}

export async function resetPasswordApi(login: string, newPassword: string): Promise<{ status?: string; message?: string; error?: string }> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, newPassword }),
  });
  return await res.json();
}

export async function fetchAllUsersApi(): Promise<{ users?: User[]; error?: string }> {
  const res = await fetch("/api/auth/users");
  return await res.json();
}
