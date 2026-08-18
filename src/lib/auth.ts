"use client";

import { MockUser, UserRole, DEFAULT_AVATAR_COLOR } from "@/data/users";

const STORAGE_KEY = "shikka_auth_user";
const TOKEN_KEY = "shikka_auth_token";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function normalizeRole(role?: string): UserRole {
  switch ((role || "").toUpperCase()) {
    case "ADMIN":
      return "admin";
    case "MODERATOR":
      return "moderator";
    default:
      return "user";
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function saveAuthSession(user: MockUser, accessToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function toClientUser(
  user: Partial<MockUser> & {
    role?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    last_login?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  }
): MockUser {
  const role = normalizeRole(user.role);
  const firstName = user.firstName?.trim() || user.first_name?.trim() || "";
  const lastName = user.lastName?.trim() || user.last_name?.trim() || "";
  const legacyName = user.name?.trim() || "";
  const parts = legacyName ? legacyName.split(/\s+/).filter(Boolean) : [];
  const normalizedFirstName = firstName || parts[0] || "User";
  const normalizedLastName = lastName || parts.slice(1).join(" ") || "Account";
  const username = user.username?.trim() || `${normalizedFirstName.toLowerCase()}.${normalizedLastName.toLowerCase()}`;

  return {
    id: user.id ?? `u_user_${Date.now()}`,
    username,
    email: user.email ?? "",
    password: user.password ?? "",
    role,
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    avatar: user.avatar ?? null,
    active: user.active ?? true,
    designation: user.designation ?? (role === "admin" ? "Administrator" : role === "moderator" ? "Moderator" : "Reader"),
    avatarColor: user.avatarColor ?? DEFAULT_AVATAR_COLOR,
    lastLogin: user.lastLogin ?? user.last_login ?? null,
    createdAt: user.createdAt ?? user.created_at ?? null,
    updatedAt: user.updatedAt ?? user.updated_at ?? null,
  };
}

async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  try {
    const headers = new Headers(init.headers || {});
    const hasBody = init.body !== undefined && init.body !== null && init.body !== "";

    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    const res = await fetch(url, {
      credentials: "include",
      ...init,
      headers,
    });

    const contentType = res.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      const message = typeof payload === "string" ? payload : payload?.error || "Request failed";
      throw new Error(message);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Failed to connect to the server. Please check whether the backend is running.");
    }
    throw error;
  }
}

export async function login(email: string, password: string): Promise<MockUser | null> {
  const payload = await fetchJson<{ user: any; accessToken: string }>(`${API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const user = toClientUser(payload.user);
  saveAuthSession(user, payload.accessToken);
  return user;
}

export async function registerUser(name: string, email: string, password: string): Promise<MockUser> {
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "User";
  const lastName = parts.slice(1).join(" ") || "Account";
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, ".") || "user"}`;

  const payload = await fetchJson<{ user: any; accessToken: string }>(`${API_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      username,
      email: email.trim().toLowerCase(),
      password,
      firstName,
      lastName,
    }),
  });

  const user = toClientUser(payload.user);
  saveAuthSession(user, payload.accessToken);
  return user;
}

export async function fetchCurrentUserFromApi(): Promise<MockUser | null> {
  const token = getAccessToken();
  if (!token) {
    clearAuthSession();
    return null;
  }

  try {
    const payload = await fetchJson<{ user: any }>(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = toClientUser(payload.user);
    saveAuthSession(user, token);
    return user;
  } catch {
    clearAuthSession();
    return null;
  }
}

export async function updateCurrentUserProfile(input: {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
}): Promise<MockUser> {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const payload = await fetchJson<{ user: any }>(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });

  const user = toClientUser(payload.user);
  saveAuthSession(user, token);
  return user;
}

export async function fetchUsersForManagement(): Promise<MockUser[]> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const payload = await fetchJson<{ users: any[] }>(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return (payload.users || []).map((user) => toClientUser(user));
}

export async function fetchUserSummary() {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return fetchJson<{
    totalUsers: number;
    totalAdmins: number;
    totalModerators: number;
    totalDisabledAccounts: number;
    totalAccounts: number;
    percentChange: {
      totalUsers: number;
      totalAdmins: number;
      totalModerators: number;
      totalDisabledAccounts: number;
    };
    chart: Array<{ key: string; label: string; value: number; percent: number }>;
  }>(`${API_URL}/users/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateUserRole(id: string, role: "admin" | "moderator" | "user") {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");

  return fetchJson<{ id: string; role: string }>(`${API_URL}/users/${id}/role`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role: role.toUpperCase() }),
  });
}

export async function deleteUser(id: string) {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");

  return fetchJson<{ id: string }>(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateUserActive(id: string, active: boolean) {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");

  return fetchJson<{ id: string; active: boolean }>(`${API_URL}/users/${id}/active`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ active }),
  });
}

export function getCurrentUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return toClientUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function getRoleLandingPath(role: UserRole): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "moderator") return "/dashboard/moderator";
  return "/";
}

export async function logout() {
  const token = getAccessToken();

  try {
    if (token) {
      await fetchJson(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // ignore logout errors and clear client state anyway
  }

  clearAuthSession();
}
