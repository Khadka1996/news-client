"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, Eye, Heart, MessageCircle, Newspaper, RefreshCw, ThumbsUp, TrendingUp, Video } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { fetchAnalytics, fetchPublishingTrend, fetchTopArticles, fetchVisitorLocations, type AnalyticsArticle, type AnalyticsOverview, type CategoryBreakdown, type CommentedArticle, type LikedArticle, type PublishingTrendPeriod, type PublishingTrendPoint, type TopArticle, type VisitorLocationBreakdown } from "@/lib/analytics";

const emptyOverview: AnalyticsOverview = { totalArticles: 0, totalPublishedArticles: 0, totalVideos: 0, totalPublishedVideos: 0, totalViews: 0, totalComments: 0, totalLikes: 0, totalUsers: 0, totalCategories: 0 };
const formatNumber = (value: number) => value.toLocaleString("en-US");
type IconType = typeof Eye;

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: number; detail: string; icon: IconType; tone: string }) {
  return <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]"><div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${tone}`}><Icon className="h-5 w-5" /></div><div className="text-3xl font-extrabold text-neutral-900">{formatNumber(value)}</div><div className="mt-1 text-sm font-semibold text-neutral-700">{label}</div><div className="mt-1 text-xs text-neutral-400">{detail}</div></div>;
}

function PublishingTrendChart({ points, period, onPeriodChange, loading }: { points: PublishingTrendPoint[]; period: PublishingTrendPeriod; onPeriodChange: (period: PublishingTrendPeriod) => void; loading: boolean }) {
  const width = 720;
  const height = 260;
  const padding = { top: 22, right: 22, bottom: 42, left: 44 };
  const maxArticles = Math.max(1, ...points.map((point) => point.articleCount));
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const coordinates = points.map((point, index) => ({
    point,
    x: padding.left + (points.length > 1 ? (index / (points.length - 1)) * chartWidth : chartWidth / 2),
    y: padding.top + chartHeight - (point.articleCount / maxArticles) * chartHeight,
  }));
  const line = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = coordinates.length > 0 ? `${padding.left},${padding.top + chartHeight} ${line} ${coordinates[coordinates.length - 1].x},${padding.top + chartHeight}` : "";

  const periodLabels: Record<PublishingTrendPeriod, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" };
  const rangeLabels: Record<PublishingTrendPeriod, string> = { daily: "last 7 days", weekly: "last 8 weeks", monthly: "last 12 months", yearly: "last 5 years" };
  const formatPointLabel = (date: string) => period === "yearly" ? date : period === "monthly" ? new Date(`${date}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-neutral-900">Publishing trend</h2><p className="mt-1 text-xs text-neutral-400">Published news over the {rangeLabels[period]}.</p></div><div className="flex rounded-lg border border-neutral-200 p-1">{(Object.keys(periodLabels) as PublishingTrendPeriod[]).map((option) => <button key={option} type="button" onClick={() => onPeriodChange(option)} disabled={loading} className={`px-2.5 py-1 text-xs font-semibold ${period === option ? "rounded-md bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}>{periodLabels[option]}</button>)}</div></div>{loading ? <div className="flex min-h-40 items-center justify-center text-sm text-neutral-400"><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Loading trend...</div> : points.length === 0 ? <p className="py-8 text-sm text-neutral-500">No publishing data available yet.</p> : <div aria-label={`${periodLabels[period]} publishing trend`}><div className="mb-3 flex items-center gap-4 text-xs text-neutral-500"><span className="h-3 w-3 rounded-full bg-brand-gold" /> Articles published <span className="ml-3">Views are shown below each point</span></div><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${periodLabels[period]} articles published line chart`} className="h-64 w-full overflow-visible"><defs><linearGradient id="publishing-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d97706" stopOpacity="0.25" /><stop offset="100%" stopColor="#d97706" stopOpacity="0.02" /></linearGradient></defs>{[0, 0.25, 0.5, 0.75, 1].map((step) => { const y = padding.top + chartHeight - step * chartHeight; return <g key={step}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 5" /><text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-neutral-400 text-[11px]">{Math.round(step * maxArticles)}</text></g>; })}<polygon points={area} fill="url(#publishing-area)" /><polyline points={line} fill="none" stroke="#d97706" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />{coordinates.map(({ point, x, y }) => <g key={point.date}><circle cx={x} cy={y} r="6" fill="white" stroke="#d97706" strokeWidth="3" /><text x={x} y={height - 18} textAnchor="middle" className="fill-neutral-500 text-[11px]">{formatPointLabel(point.date)}</text><title>{`${point.articleCount} articles, ${formatNumber(point.totalViews)} views`}</title></g>)}</svg><div className="grid gap-2 text-center text-xs text-neutral-500" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>{points.map((point) => <span key={point.date}>{point.articleCount} articles<br /><span className="font-semibold text-neutral-700">{formatNumber(point.totalViews)} views</span></span>)}</div></div>}</section>;
}

function CategoryPerformance({ categories }: { categories: CategoryBreakdown[] }) {
  const sortedCategories = categories.slice().sort((a, b) => b.totalViews - a.totalViews || b.articleCount - a.articleCount);
  const maxViews = Math.max(1, ...sortedCategories.map((category) => category.totalViews));
  const maxArticles = Math.max(1, ...sortedCategories.map((category) => category.articleCount));

  return <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-neutral-900">Category performance</h2><p className="mt-1 text-xs text-neutral-400">Published news and views by category.</p></div><BarChart3 className="h-5 w-5 text-neutral-400" /></div>{sortedCategories.length === 0 ? <p className="py-8 text-sm text-neutral-500">No category data available yet.</p> : <div className="space-y-4"><div className="flex items-center gap-4 text-xs text-neutral-500"><span className="h-3 w-3 rounded-sm bg-brand-gold" /> Articles <span className="ml-3 h-3 w-3 rounded-sm bg-sky-400" /> Views</div>{sortedCategories.map((category) => <div key={category.categoryId}><div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className="truncate font-semibold text-neutral-700">{category.categoryName}</span><span className="shrink-0 text-xs text-neutral-400">{formatNumber(category.totalViews)} views / {category.articleCount} articles</span></div><div className="space-y-1.5"><div className="h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-brand-gold" style={{ width: `${(category.articleCount / maxArticles) * 100}%` }} /></div><div className="h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-sky-400" style={{ width: `${(category.totalViews / maxViews) * 100}%` }} /></div></div></div>)}</div>}</section>;
}

function VisitorLocationList({ title, subtitle, items, emptyLabel }: { title: string; subtitle: string; items: VisitorLocationBreakdown[]; emptyLabel: string }) {
  const maxViews = Math.max(1, ...items.map((item) => item.views));
  return <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]"><div className="mb-5"><h2 className="font-bold text-neutral-900">{title}</h2><p className="mt-1 text-xs text-neutral-400">{subtitle}</p></div>{items.length === 0 ? <p className="py-6 text-sm text-neutral-500">{emptyLabel}</p> : <ol className="space-y-3">{items.slice(0, 7).map((item, index) => <li key={item.name}><div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className="truncate font-semibold text-neutral-700"><span className="mr-2 text-xs text-neutral-400">{index + 1}.</span>{item.name}</span><span className="shrink-0 text-xs font-semibold text-neutral-500">{formatNumber(item.views)} views</span></div><div className="h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-brand-gold" style={{ width: `${(item.views / maxViews) * 100}%` }} /></div></li>)}</ol>}</section>;
}

function RankedList({ title, items, metric, icon: Icon }: { title: string; items: Array<AnalyticsArticle | CommentedArticle | LikedArticle>; metric: (item: AnalyticsArticle | CommentedArticle | LikedArticle) => number; icon: IconType }) {
  return <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-neutral-900">{title}</h2><Icon className="h-4 w-4 text-neutral-400" /></div>{items.length === 0 ? <p className="py-6 text-sm text-neutral-500">No data available yet.</p> : <ol className="divide-y divide-neutral-100">{items.map((item, index) => <li key={item.id} className="flex items-center gap-3 py-3"><span className="w-5 text-xs font-bold text-neutral-400">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-neutral-800">{item.title}</p><p className="mt-1 text-xs text-neutral-400">{item.category?.name || "Uncategorized"}</p></div><span className="shrink-0 text-xs font-semibold text-neutral-500">{formatNumber(metric(item))}</span></li>)}</ol>}</section>;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(emptyOverview);
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [commented, setCommented] = useState<CommentedArticle[]>([]);
  const [liked, setLiked] = useState<LikedArticle[]>([]);
  const [trend, setTrend] = useState<PublishingTrendPoint[]>([]);
  const [trendPeriod, setTrendPeriod] = useState<PublishingTrendPeriod>("daily");
  const [trendLoading, setTrendLoading] = useState(false);
  const [visitorCountries, setVisitorCountries] = useState<VisitorLocationBreakdown[]>([]);
  const [nepalRegions, setNepalRegions] = useState<VisitorLocationBreakdown[]>([]);
  const [period, setPeriod] = useState<"week" | "all">("all");
  const [loading, setLoading] = useState(true);
  const [topArticlesLoading, setTopArticlesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, locations] = await Promise.all([fetchAnalytics("all", trendPeriod), fetchVisitorLocations()]);
      setOverview(result.overview);
      setTopArticles(result.topArticles);
      setCategories(result.categories);
      setCommented(result.commented);
      setLiked(result.liked);
      setTrend(result.trend);
      setVisitorCountries(locations.countries);
      setNepalRegions(locations.nepalRegions);
      setPeriod("all");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  const changeTrendPeriod = async (nextPeriod: PublishingTrendPeriod) => {
    if (nextPeriod === trendPeriod) return;
    setTrendPeriod(nextPeriod);
    setTrendLoading(true);
    try {
      setTrend(await fetchPublishingTrend(nextPeriod));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load publishing trend.");
    } finally {
      setTrendLoading(false);
    }
  };

  const changeTopArticlesPeriod = async (nextPeriod: "week" | "all") => {
    if (nextPeriod === period) return;
    setPeriod(nextPeriod);
    setTopArticlesLoading(true);
    try {
      setTopArticles(await fetchTopArticles(nextPeriod));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load top articles.");
    } finally {
      setTopArticlesLoading(false);
    }
  };

  useEffect(() => { void loadAnalytics(); }, []);
  return <div className="space-y-6"><Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Analytics" }]} /><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">Analytics</h1><p className="mt-2 text-sm text-neutral-500">Monitor content performance and audience engagement.</p></div><button type="button" onClick={() => void loadAnalytics()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button></div>{error && <StatusMessage type="error" title="Analytics unavailable" message={error} />}{loading && !topArticles.length ? <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-sm text-neutral-500">Loading analytics...</div> : <><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total views" value={overview.totalViews} detail="Across published news" icon={Eye} tone="border-sky-200 bg-sky-50 text-sky-700" /><MetricCard label="Published news" value={overview.totalPublishedArticles} detail={`${formatNumber(overview.totalArticles)} total articles`} icon={Newspaper} tone="border-amber-200 bg-amber-50 text-amber-700" /><MetricCard label="Comments" value={overview.totalComments} detail="Reader conversations" icon={MessageCircle} tone="border-emerald-200 bg-emerald-50 text-emerald-700" /><MetricCard label="Likes" value={overview.totalLikes} detail={`${formatNumber(overview.totalUsers)} registered users`} icon={Heart} tone="border-rose-200 bg-rose-50 text-rose-700" /></div><PublishingTrendChart points={trend} period={trendPeriod} onPeriodChange={(nextPeriod) => void changeTrendPeriod(nextPeriod)} loading={trendLoading} /><div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><CategoryPerformance categories={categories} /><section className="rounded-2xl border border-neutral-200 bg-white p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-neutral-900">Top articles</h2><p className="mt-1 text-xs text-neutral-400">Sorted by views on the server.</p></div><div className="flex rounded-lg border border-neutral-200 p-1"><button type="button" onClick={() => void changeTopArticlesPeriod("week")} disabled={topArticlesLoading} className={`px-2.5 py-1 text-xs font-semibold ${period === "week" ? "rounded-md bg-neutral-900 text-white" : "text-neutral-500"}`}>This week</button><button type="button" onClick={() => void changeTopArticlesPeriod("all")} disabled={topArticlesLoading} className={`px-2.5 py-1 text-xs font-semibold ${period === "all" ? "rounded-md bg-neutral-900 text-white" : "text-neutral-500"}`}>All time</button></div></div>{topArticlesLoading ? <div className="flex min-h-40 items-center justify-center text-sm text-neutral-400"><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Loading top articles...</div> : <ol className="divide-y divide-neutral-100">{topArticles.map((article, index) => <li key={article.slug} className="flex items-center gap-3 py-3"><span className="w-5 text-xs font-bold text-neutral-400">{index + 1}</span><Link href={`/news/${article.slug}`} className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-800 hover:text-brand-gold">{article.title}</Link></li>)}</ol>}</section></div><div className="grid gap-6 xl:grid-cols-2"><VisitorLocationList title="Top 7 visitor countries" subtitle="Visitor views grouped by country." items={visitorCountries} emptyLabel="No country visitor data available yet." /><VisitorLocationList title="Top Nepal provinces" subtitle="Visitor views from Nepal by province or region." items={nepalRegions} emptyLabel="No Nepal province data available yet." /></div><div className="grid gap-6 xl:grid-cols-2"><RankedList title="Most commented" items={commented} metric={(item) => "commentCount" in item ? item.commentCount : 0} icon={MessageCircle} /><RankedList title="Most liked" items={liked} metric={(item) => "likeCount" in item ? item.likeCount : 0} icon={ThumbsUp} /></div><div className="grid gap-5 sm:grid-cols-2"><MetricCard label="Published videos" value={overview.totalPublishedVideos} detail={`${formatNumber(overview.totalVideos)} total videos`} icon={Video} tone="border-violet-200 bg-violet-50 text-violet-700" /><MetricCard label="Average views per article" value={overview.totalPublishedArticles ? Math.round(overview.totalViews / overview.totalPublishedArticles) : 0} detail="Based on published news" icon={TrendingUp} tone="border-indigo-200 bg-indigo-50 text-indigo-700" /></div></>}</div>;
}

