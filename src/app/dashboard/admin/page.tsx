"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, ChevronRight, Megaphone, Newspaper, PlaySquare, Plus, RefreshCw, Tags, UsersRound } from "lucide-react";
import { fetchAnalytics, fetchDashboardTrends, type AnalyticsOverview, type CategoryBreakdown, type DashboardTrends, type PublishingTrendPoint } from "@/lib/analytics";
import { fetchAdvertisementSummary } from "@/lib/advertisements";
import { fetchAdminCategories } from "@/lib/categories";
import { fetchAuthorsForAdmin } from "@/lib/authors";
import { fetchVideoSummary } from "@/lib/videos";
import { fetchCurrentUserFromApi } from "@/lib/auth";
import { getDisplayName, MockUser } from "@/data/users";

const emptyOverview: AnalyticsOverview = { totalArticles: 0, totalPublishedArticles: 0, totalVideos: 0, totalPublishedVideos: 0, totalViews: 0, totalComments: 0, totalLikes: 0, totalUsers: 0, totalCategories: 0 };
const number = (value: number) => value.toLocaleString("en-US");

function StatCard({ label, value, detail, icon: Icon, tone, trend }: { label: string; value: number; detail: string; icon: typeof BarChart3; tone: string; trend: Array<{ date: string; value: number }> }) {
  const max = Math.max(1, ...trend.map((point) => point.value));
  const min = Math.min(...trend.map((point) => point.value));
  const range = Math.max(1, max - min);
  const line = trend.map((point, index) => `${(index / Math.max(1, trend.length - 1)) * 100},${range === 1 ? 50 : 100 - ((point.value - min) / range) * 100}`).join(" ");
  const rising = trend.length > 1 && trend[trend.length - 1].value >= trend[trend.length - 2].value;
  return <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.03)]"><div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tone}`}><Icon className="h-5 w-5" /></div><div className="mt-4 text-3xl font-extrabold text-neutral-900">{number(value)}</div><div className="mt-1 text-sm font-semibold text-neutral-700">{label}</div><svg viewBox="0 0 100 32" preserveAspectRatio="none" className={`mt-4 h-10 w-full ${rising ? "text-emerald-500" : "text-rose-500"}`} aria-label={`${label} trend`}><line x1="0" y1="31" x2="100" y2="31" stroke="currentColor" strokeOpacity="0.12" /><polyline points={line} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg></div>;
}

function WeeklyTrend({ points }: { points: PublishingTrendPoint[] }) {
  const width = 720;
  const height = 230;
  const padding = { top: 18, right: 18, bottom: 36, left: 34 };
  const max = Math.max(1, ...points.map((point) => point.articleCount));
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const coordinates = points.map((point, index) => ({ point, x: padding.left + (points.length > 1 ? index / (points.length - 1) : 0.5) * chartWidth, y: padding.top + chartHeight - (point.articleCount / max) * chartHeight }));
  const line = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  return <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.03)]"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-neutral-900">Publishing trend</h2><p className="mt-1 text-xs text-neutral-400">News published over the last 7 days.</p></div><BarChart3 className="h-5 w-5 text-neutral-400" /></div>{points.length === 0 ? <p className="py-8 text-sm text-neutral-500">No publishing data available yet.</p> : <><div className="mb-3 flex items-center gap-4 text-xs text-neutral-500"><span className="h-3 w-3 rounded-full bg-brand-gold" /> Articles published <span className="ml-3">Views are shown below each day</span></div><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Weekly publishing trend" className="h-56 w-full">{[0, 0.5, 1].map((step) => { const y = padding.top + chartHeight - step * chartHeight; return <g key={step}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 5" /><text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-neutral-400 text-[11px]">{Math.round(step * max)}</text></g>; })}<polyline points={line} fill="none" stroke="#d97706" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />{coordinates.map(({ point, x, y }) => <g key={point.date}><circle cx={x} cy={y} r="5" fill="white" stroke="#d97706" strokeWidth="3" /><text x={x} y={height - 14} textAnchor="middle" className="fill-neutral-500 text-[11px]">{new Date(`${point.date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short" })}</text><title>{`${point.articleCount} news, ${number(point.totalViews)} views`}</title></g>)}</svg><div className="grid grid-cols-7 gap-2 text-center text-xs text-neutral-500">{points.map((point) => <span key={point.date}>{point.articleCount} news<br /><span className="font-semibold text-neutral-700">{number(point.totalViews)} views</span></span>)}</div></>}</section>;
}

function CategoryPerformance({ categories }: { categories: CategoryBreakdown[] }) {
  const items = categories.slice().sort((a, b) => b.totalViews - a.totalViews);
  const maxViews = Math.max(1, ...items.map((item) => item.totalViews));
  const maxArticles = Math.max(1, ...items.map((item) => item.articleCount));
  return <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.03)]"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-neutral-900">Category performance</h2><p className="mt-1 text-xs text-neutral-400">Published news and views by category.</p></div><Tags className="h-5 w-5 text-neutral-400" /></div>{items.length === 0 ? <p className="py-8 text-sm text-neutral-500">No category data available yet.</p> : <div className="space-y-4"><div className="flex items-center gap-4 text-xs text-neutral-500"><span className="h-3 w-3 rounded-sm bg-brand-gold" /> Articles <span className="ml-3 h-3 w-3 rounded-sm bg-sky-400" /> Views</div>{items.map((item) => <div key={item.categoryId}><div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className="truncate font-semibold text-neutral-700">{item.categoryName}</span><span className="shrink-0 text-xs text-neutral-400">{item.articleCount} news / {number(item.totalViews)} views</span></div><div className="space-y-1.5"><div className="h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-brand-gold" style={{ width: `${(item.articleCount / maxArticles) * 100}%` }} /></div><div className="h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-sky-400" style={{ width: `${(item.totalViews / maxViews) * 100}%` }} /></div></div></div>)}</div>}</section>;
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(emptyOverview);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [authorTotal, setAuthorTotal] = useState(0);
  const [videoTotal, setVideoTotal] = useState(0);
  const [advertisementTotal, setAdvertisementTotal] = useState(0);
  const [topNews, setTopNews] = useState<Array<{ title: string; slug: string }>>([]);
  const [trend, setTrend] = useState<PublishingTrendPoint[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [dashboardTrends, setDashboardTrends] = useState<DashboardTrends>({ news: [], categories: [], videos: [], authors: [], advertisements: [], views: [] });
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [analytics, dashboardTrendData, categories, authors, videos, advertisements, currentUser] = await Promise.all([
        fetchAnalytics("all", "daily"),
        fetchDashboardTrends(),
        fetchAdminCategories(1, 1),
        fetchAuthorsForAdmin(),
        fetchVideoSummary(),
        fetchAdvertisementSummary(),
        fetchCurrentUserFromApi(),
      ]);
      setOverview(analytics.overview);
      setTopNews(analytics.topArticles);
      setTrend(analytics.trend);
      setCategories(analytics.categories);
      setDashboardTrends(dashboardTrendData);
      setCategoryTotal(categories.total);
      setAuthorTotal(authors.length);
      setVideoTotal(videos.totalVideos);
      setAdvertisementTotal(advertisements.totalAds);
      setUser(currentUser);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDashboard(); }, []);

  const displayName = user ? getDisplayName(user) : "there";
  const stats = [
    { label: "Total news", value: overview.totalArticles, detail: "All statuses", icon: Newspaper, tone: "border-amber-200 bg-amber-50 text-amber-700", trend: dashboardTrends.news },
    { label: "Categories", value: categoryTotal, detail: "All categories", icon: Tags, tone: "border-blue-200 bg-blue-50 text-blue-700", trend: dashboardTrends.categories },
    { label: "Videos", value: videoTotal, detail: `${number(overview.totalPublishedVideos)} published`, icon: PlaySquare, tone: "border-violet-200 bg-violet-50 text-violet-700", trend: dashboardTrends.videos },
    { label: "Authors", value: authorTotal, detail: "Newsroom authors", icon: UsersRound, tone: "border-emerald-200 bg-emerald-50 text-emerald-700", trend: dashboardTrends.authors },
    { label: "Advertisements", value: advertisementTotal, detail: "All advertisements", icon: Megaphone, tone: "border-rose-200 bg-rose-50 text-rose-700", trend: dashboardTrends.advertisements },
    { label: "Total views", value: overview.totalViews, detail: "Across all news", icon: BarChart3, tone: "border-sky-200 bg-sky-50 text-sky-700", trend: dashboardTrends.views },
  ];

  if (loading) return <div className="flex min-h-64 items-center justify-center text-sm text-neutral-500"><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Loading your dashboard...</div>;

  return <div className="space-y-6"><section className="relative overflow-hidden rounded-3xl bg-brand-dark p-6 text-white shadow-lg sm:p-8"><div className="relative z-10 max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold-light">Newsroom overview</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome, {displayName}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Here is the latest picture of your newsroom, content library, and audience reach.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/dashboard/admin/news/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-gold-light"><Plus className="h-4 w-4" /> Create news</Link><Link href="/dashboard/admin/analytics" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"><BarChart3 className="h-4 w-4" /> View analytics</Link></div></div></section>{error && <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void loadDashboard()} className="font-semibold underline">Retry</button></div>}<section><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-bold text-neutral-900">Content at a glance</h2><p className="mt-1 text-sm text-neutral-500">Live totals from your newsroom database.</p></div><button type="button" onClick={() => void loadDashboard()} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</div></section><section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><WeeklyTrend points={trend} /><CategoryPerformance categories={categories} /></section><section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.03)]"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-neutral-900">Top news</h2><p className="mt-1 text-xs text-neutral-400">Highest-viewed published news.</p></div><Link href="/dashboard/admin/news" className="text-xs font-semibold text-brand-gold hover:underline">Manage news</Link></div>{topNews.length === 0 ? <p className="py-8 text-sm text-neutral-500">No published news yet.</p> : <ol className="divide-y divide-neutral-100">{topNews.map((article, index) => <li key={article.slug} className="flex items-center gap-3 py-3"><span className="w-5 text-xs font-bold text-neutral-400">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-800">{article.title}</span><ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" /></li>)}</ol>}</div><div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.03)]"><h2 className="font-bold text-neutral-900">Publishing snapshot</h2><p className="mt-1 text-xs text-neutral-400">Current activity across the newsroom.</p><div className="mt-6 space-y-5"><div><div className="mb-1 flex justify-between text-sm"><span className="text-neutral-600">Published news</span><strong className="text-neutral-900">{number(overview.totalPublishedArticles)}</strong></div><div className="h-2 rounded-full bg-neutral-100"><div className="h-full rounded-full bg-brand-gold" style={{ width: `${overview.totalArticles ? (overview.totalPublishedArticles / overview.totalArticles) * 100 : 0}%` }} /></div></div><div><div className="mb-1 flex justify-between text-sm"><span className="text-neutral-600">Published videos</span><strong className="text-neutral-900">{number(overview.totalPublishedVideos)}</strong></div><div className="h-2 rounded-full bg-neutral-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${overview.totalVideos ? (overview.totalPublishedVideos / overview.totalVideos) * 100 : 0}%` }} /></div></div></div><Link href="/dashboard/admin/analytics" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-gold hover:underline">Open full analytics <ChevronRight className="h-4 w-4" /></Link></div></section></div>;
}
