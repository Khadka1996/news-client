"use client";

import { getAccessToken, refreshAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type AnalyticsOverview = {
  totalArticles: number;
  totalPublishedArticles: number;
  totalVideos: number;
  totalPublishedVideos: number;
  totalViews: number;
  totalComments: number;
  totalLikes: number;
  totalUsers: number;
  totalCategories: number;
};

export type AnalyticsArticle = {
  id: string;
  title: string;
  slug: string;
  views: number;
  shareCount: number;
  publishedAt?: string | null;
  category?: { id: string; name: string; slug: string } | null;
};

export type TopArticle = {
  title: string;
  slug: string;
};

export type PublishingTrendPoint = {
  date: string;
  articleCount: number;
  totalViews: number;
};
export type PublishingTrendPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type CategoryBreakdown = {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  articleCount: number;
  totalViews: number;
};

export type VisitorLocationBreakdown = { name: string; country?: string; views: number };
export type DashboardTrendPoint = { date: string; value: number };
export type DashboardTrends = Record<"news" | "categories" | "videos" | "authors" | "advertisements" | "views", DashboardTrendPoint[]>;

export type CommentedArticle = AnalyticsArticle & { commentCount: number };
export type LikedArticle = AnalyticsArticle & { likeCount: number };

async function request<T>(url: string): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response = await fetch(url, { credentials: "include", headers });
  if (response.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      response = await fetch(url, { credentials: "include", headers });
    }
  }

  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.error || "Unable to load analytics.");
  return payload as T;
}

export function fetchTopArticles(period: "week" | "all", limit = 6) {
  return request<TopArticle[]>(`${API_URL}/analytics/top-articles?period=${period}&limit=${limit}`);
}

export function fetchPublishingTrend(period: PublishingTrendPeriod = "daily") {
  return request<PublishingTrendPoint[]>(`${API_URL}/analytics/publishing-trend?period=${period}`);
}

export function fetchVisitorLocations() {
  return request<{ countries: VisitorLocationBreakdown[]; nepalRegions: VisitorLocationBreakdown[] }>(`${API_URL}/analytics/visitor-locations`);
}

export function fetchDashboardTrends() {
  return request<DashboardTrends>(`${API_URL}/analytics/dashboard-trends`);
}

export async function fetchAnalytics(period: "week" | "all" = "all", trendPeriod: PublishingTrendPeriod = "daily") {
  const [overview, topArticles, categories, commented, liked, trend] = await Promise.all([
    request<AnalyticsOverview>(`${API_URL}/analytics/overview`),
    request<TopArticle[]>(`${API_URL}/analytics/top-articles?period=${period}&limit=6`),
    request<CategoryBreakdown[]>(`${API_URL}/analytics/by-category`),
    request<CommentedArticle[]>(`${API_URL}/analytics/most-commented?limit=5`),
    request<LikedArticle[]>(`${API_URL}/analytics/most-liked?limit=5`),
    fetchPublishingTrend(trendPeriod),
  ]);

  return { overview, topArticles, categories, commented, liked, trend };
}
