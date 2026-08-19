"use client";

import { getAccessToken, refreshAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type AdvertisementPosition =
  | "HOMEPAGE_TOP_BANNER"
  | "HOMEPAGE_MID_BANNER"
  | "HOMEPAGE_BOTTOM_BANNER"
  | "HOMEPAGE_SIDEBAR_TOP"
  | "HOMEPAGE_SIDEBAR_BOTTOM"
  | "HOMEPAGE_BETWEEN_SECTIONS"
  | "HOMEPAGE_HERO_OVERLAY"
  | "CATEGORY_TOP_BANNER"
  | "CATEGORY_IN_LIST"
  | "CATEGORY_SIDEBAR_1"
  | "CATEGORY_SIDEBAR_2"
  | "CATEGORY_SIDEBAR_3"
  | "CATEGORY_SIDEBAR_4"
  | "CATEGORY_SIDEBAR_5"
  | "CATEGORY_SIDEBAR_6"
  | "CATEGORY_SIDEBAR_7"
  | "CATEGORY_BEFORE_1"
  | "CATEGORY_BEFORE_2"
  | "CATEGORY_BEFORE_3"
  | "CATEGORY_BEFORE_4"
  | "CATEGORY_AFTER_1"
  | "CATEGORY_AFTER_2"
  | "CATEGORY_AFTER_3"
  | "ARTICLE_TOP_BANNER"
  | "ARTICLE_SIDEBAR_TOP"
  | "ARTICLE_SIDEBAR_BOTTOM"
  | "ARTICLE_IN_CONTENT"
  | "ARTICLE_AFTER_PARAGRAPH_1"
  | "ARTICLE_AFTER_PARAGRAPH_2"
  | "ARTICLE_AFTER_PARAGRAPH_3"
  | "ARTICLE_BOTTOM_BANNER"
  | "ARTICLE_BEFORE_COMMENTS"
  | "ARTICLE_AFTER_COMMENTS"
  | "BETWEEN_ARTICLES"
  | "HEADER_STICKY"
  | "FOOTER_STICKY"
  | "FOOTER_BANNER"
  | "MOBILE_STICKY_BOTTOM"
  | "MOBILE_IN_FEED"
  | "VIDEO_PRE_ROLL"
  | "VIDEO_MID_ROLL"
  | "VIDEO_SIDEBAR"
  | "POPUP_1"
  | "POPUP_2"
  | "PREMIUM_POPUP_ENTRY"
  | "PREMIUM_POPUP_EXIT"
  | "SEARCH_RESULTS_TOP"
  | "LATEST_NEWS_TOP"
  | "LATEST_NEWS_SIDEBAR"
  | "LATEST_NEWS_BOTTOM";

export type Advertisement = {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string | null;
  position: AdvertisementPosition;
  active: boolean;
  injectAfterParagraphs?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  impressions: number;
  clicks: number;
  createdById?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AdvertisementCreateInput = {
  title: string;
  imageUrl: string;
  targetUrl?: string;
  position: AdvertisementPosition;
  active?: boolean;
  injectAfterParagraphs?: number;
  startDate?: string;
  endDate?: string;
};

export type AdvertisementUpdateInput = Partial<AdvertisementCreateInput>;

async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  let response = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });

  if (response.status === 401 && token) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      headers.set("Authorization", `Bearer ${refreshedToken}`);
      response = await fetch(url, { credentials: "include", ...init, headers });
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export function formatAdvertisementPosition(position: string): string {
  return position
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export async function fetchAdvertisementsForAdmin(page = 1, pageSize = 20): Promise<{ advertisements: Advertisement[]; total: number; page: number; pageSize: number }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return fetchJson<{ advertisements: Advertisement[]; total: number; page: number; pageSize: number }>(`${API_URL}/advertisements/admin/list?page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchAdvertisementSummary(): Promise<{
  totalAds: number;
  activeAds: number;
  pausedAds: number;
  avgCtr: number;
  totalImpressions: number;
  totalClicks: number;
  percentChange: {
    totalAds: number;
    activeAds: number;
    pausedAds: number;
    avgCtr: number;
  };
  chart: Array<{ key: string; label: string; value: number; percent: number }>;
}> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return fetchJson<{
    totalAds: number;
    activeAds: number;
    pausedAds: number;
    avgCtr: number;
    totalImpressions: number;
    totalClicks: number;
    percentChange: {
      totalAds: number;
      activeAds: number;
      pausedAds: number;
      avgCtr: number;
    };
    chart: Array<{ key: string; label: string; value: number; percent: number }>;
  }>(`${API_URL}/advertisements/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createAdvertisement(input: AdvertisementCreateInput): Promise<Advertisement> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return fetchJson<Advertisement>(`${API_URL}/advertisements`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export async function updateAdvertisement(id: string, input: AdvertisementUpdateInput): Promise<Advertisement> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return fetchJson<Advertisement>(`${API_URL}/advertisements/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export async function deleteAdvertisement(id: string): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  await fetchJson<void>(`${API_URL}/advertisements/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export const AD_POSITION_OPTIONS: AdvertisementPosition[] = [
  "HOMEPAGE_TOP_BANNER",
  "HOMEPAGE_MID_BANNER",
  "HOMEPAGE_BOTTOM_BANNER",
  "HOMEPAGE_SIDEBAR_TOP",
  "HOMEPAGE_SIDEBAR_BOTTOM",
  "HOMEPAGE_BETWEEN_SECTIONS",
  "HOMEPAGE_HERO_OVERLAY",
  "CATEGORY_TOP_BANNER",
  "CATEGORY_IN_LIST",
  "ARTICLE_TOP_BANNER",
  "ARTICLE_SIDEBAR_TOP",
  "ARTICLE_SIDEBAR_BOTTOM",
  "ARTICLE_IN_CONTENT",
  "ARTICLE_BOTTOM_BANNER",
  "ARTICLE_BEFORE_COMMENTS",
  "ARTICLE_AFTER_COMMENTS",
  "BETWEEN_ARTICLES",
  "HEADER_STICKY",
  "FOOTER_STICKY",
  "FOOTER_BANNER",
  "MOBILE_STICKY_BOTTOM",
  "MOBILE_IN_FEED",
  "VIDEO_PRE_ROLL",
  "VIDEO_MID_ROLL",
  "VIDEO_SIDEBAR",
  "POPUP_1",
  "POPUP_2",
  "PREMIUM_POPUP_ENTRY",
  "PREMIUM_POPUP_EXIT",
  "SEARCH_RESULTS_TOP",
  "LATEST_NEWS_TOP",
  "LATEST_NEWS_SIDEBAR",
  "LATEST_NEWS_BOTTOM",
];
