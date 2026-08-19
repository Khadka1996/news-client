"use client";

import { getAccessToken, refreshAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  order: number;
  postCount: number;
  isActive: boolean;
  createdAt?: string;
};

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
};

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  let response = await fetch(url, { credentials: "include", ...init, headers });
  if (response.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      response = await fetch(url, { credentials: "include", ...init, headers });
    }
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || "Request failed");
  return payload as T;
}

export type AdminCategoryPage = { categories: AdminCategory[]; total: number; active: number; inactive: number; topCategory: AdminCategory | null; percentChange: { total: number; active: number; inactive: number }; page: number; pageSize: number };
export const fetchAdminCategories = (page = 1, pageSize = 8, search = "", status: "active" | "inactive" | "all" = "all") => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search.trim()) params.set("search", search.trim());
  if (status !== "all") params.set("status", status);
  return request<AdminCategoryPage>(`${API_URL}/categories/admin/list?${params.toString()}`);
};
export const createCategory = (input: CategoryInput) => request<AdminCategory>(`${API_URL}/categories`, { method: "POST", body: JSON.stringify(input) });
export const updateCategory = (id: string, input: Partial<CategoryInput>) => request<AdminCategory>(`${API_URL}/categories/${id}`, { method: "PATCH", body: JSON.stringify(input) });
export const deleteCategory = (id: string) => request<void>(`${API_URL}/categories/${id}`, { method: "DELETE" });