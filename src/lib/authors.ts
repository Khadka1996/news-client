"use client";

import { getAccessToken, refreshAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const normalizeAvatarUrl = (avatar?: string | null): string | null | undefined => {
  if (!avatar) return avatar;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  return `${API_ORIGIN}/${avatar.replace(/^\/+/, "")}`;
};

export type AdminAuthor = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatar?: string | null;
  isActive: boolean;
  createdAt?: string;
  newsCount: number;
};

export type AuthorInput = {
  name: string;
  bio?: string;
  avatar?: string;
  isActive?: boolean;
};

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  let response = await fetch(url, { credentials: "include", cache: "no-store", ...init, headers });
  if (response.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      response = await fetch(url, { credentials: "include", ...init, headers });
    }
  }
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.error || "Request failed");
  return payload as T;
}

type AuthorApiResponse = Omit<AdminAuthor, "newsCount"> & { newsCount?: number; postCount?: number; _count?: { articles?: number } };

const normalizeAuthor = (author: AuthorApiResponse): AdminAuthor => ({
  ...author,
  avatar: normalizeAvatarUrl(author.avatar),
  newsCount: author.newsCount ?? author.postCount ?? author._count?.articles ?? 0,
});

export async function fetchAuthorsForAdmin(): Promise<AdminAuthor[]> {
  const authors = await request<AuthorApiResponse[]>(`${API_URL}/authors?includeInactive=true`);
  return authors.map(normalizeAuthor);
}

export async function createAuthor(input: AuthorInput): Promise<AdminAuthor> {
  return normalizeAuthor(await request<AuthorApiResponse>(`${API_URL}/authors`, { method: "POST", body: JSON.stringify(input) }));
}

export async function updateAuthor(id: string, input: Partial<AuthorInput>): Promise<AdminAuthor> {
  return normalizeAuthor(await request<AuthorApiResponse>(`${API_URL}/authors/${id}`, { method: "PATCH", body: JSON.stringify(input) }));
}
export const deleteAuthor = (id: string) => request<void>(`${API_URL}/authors/${id}`, { method: "DELETE" });

export async function uploadAuthorPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { path } = await request<{ path: string }>(`${API_URL}/authors/image`, {
    method: "POST",
    body: formData,
  });
  return normalizeAvatarUrl(path) || path;
}