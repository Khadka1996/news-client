"use client";

import { getAccessToken, refreshAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type CreateArticleInput = {
  title: string;
  excerpt?: string;
  content: { time: number; blocks: Array<{ type: string; data: Record<string, unknown> }>; version: string };
  featuredImage?: string;
  categoryId: string;
  authorIds: string[];
  tagNames?: string[];
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  scheduledFor?: string;
  isFeatured?: boolean;
  isBreakingNews?: boolean;
};

type AdminArticleResponse = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  authors?: Array<{ author?: { name?: string } | null }>;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  scheduledFor?: string | null;
  publishedAt?: string | null;
  views?: number;
};

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers || { Accept: "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response = await fetch(url, { ...init, credentials: "include", headers });
  if (response.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      response = await fetch(url, { ...init, credentials: "include", headers });
    }
  }
  if (response.status === 204) return undefined as T;

  const payload = await response.json();
  if (!response.ok) {
    const details = Array.isArray(payload?.details)
      ? `: ${payload.details.map((detail: { field?: string; message?: string }) => `${detail.field || "request"} ${detail.message || "is invalid"}`).join(", ")}`
      : "";
    throw new Error(`${payload?.error || "Unable to load news."}${details}`);
  }
  return payload as T;
}

export async function fetchAdminNews(page = 1, pageSize = 8, filters: { status?: string; categoryId?: string; search?: string } = {}): Promise<{
  articles: AdminArticleResponse[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.categoryId && filters.categoryId !== "all") params.set("categoryId", filters.categoryId);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  return request(`${API_URL}/articles/admin/list?${params.toString()}`);
}

export async function createAdminArticle(input: CreateArticleInput) {
  return request(`${API_URL}/articles`, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json", Accept: "application/json" }),
    body: JSON.stringify(input),
  });
}

export type AdminArticleDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: { blocks?: Array<{ data?: { html?: string } }> };
  categoryId: string;
  category?: { id: string; name: string } | null;
  authors?: Array<{ author?: { id: string; name: string } | null }>;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  scheduledFor?: string | null;
  featuredImage?: string | null;
  isFeatured?: boolean;
  isBreakingNews?: boolean;
};

export function fetchAdminArticle(slug: string) {
  return request<AdminArticleDetail>(`${API_URL}/articles/admin/${encodeURIComponent(slug)}`);
}

export function updateAdminArticle(id: string, input: Partial<CreateArticleInput>) {
  return request<AdminArticleDetail>(`${API_URL}/articles/${id}`, {
    method: "PATCH",
    headers: new Headers({ "Content-Type": "application/json", Accept: "application/json" }),
    body: JSON.stringify(input),
  });
}

export function deleteAdminArticle(id: string) {
  return request<void>(`${API_URL}/articles/${id}`, { method: "DELETE" });
}

export async function uploadArticleImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await request<{ path: string }>(`${API_URL}/articles/image`, {
    method: "POST",
    body: formData,
  });
  return response.path.startsWith("http") ? response.path : `${API_URL.replace(/\/api\/?$/, "")}${response.path}`;
}
