import { Article, Category } from "./types";
import { mockCategories, mockNews } from "@/data/mock";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Every function below tries the real backend first and quietly falls back
// to local mock data if it's unreachable — so the frontend keeps working
// on its own (e.g. `npm run dev` with no backend running) while you build
// the API out.

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getCategories(): Promise<Category[]> {
  return safeFetch(`${API_URL}/categories`, mockCategories);
}

export async function getNews(params: {
  category?: string;
  breaking?: boolean;
  featured?: boolean;
  limit?: number;
} = {}): Promise<Article[]> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.breaking) qs.set("breaking", "true");
  if (params.featured) qs.set("featured", "true");
  if (params.limit) qs.set("limit", String(params.limit));

  let items = await safeFetch(`${API_URL}/news?${qs.toString()}`, mockNews);

  // Fallback filtering in case we're serving mock data (which ignores query params)
  if (items === mockNews) {
    items = items.filter((n) => n.status === "published");
    if (params.category) items = items.filter((n) => n.category?.slug === params.category);
    if (params.breaking) items = items.filter((n) => n.breaking);
    if (params.featured) items = items.filter((n) => n.featured);
    items = [...items].sort(
      (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    );
    if (params.limit) items = items.slice(0, params.limit);
  }
  return items;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return safeFetch(`${API_URL}/news/${slug}`, mockNews.find((n) => n.slug === slug) || null);
}

// Several dashboard pages call these as `api.getX()` rather than importing
// each function individually — keep both styles working.
export const api = { getCategories, getNews, getArticleBySlug };
