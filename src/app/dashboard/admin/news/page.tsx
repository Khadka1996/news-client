"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Eye, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { deleteAdminArticle, fetchAdminNews } from "@/lib/admin-news";
import { Article, Category } from "@/lib/types";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type NewsStatus = Article["status"];

const statusLabels: Record<NewsStatus, string> = { published: "Published", pending: "Pending", draft: "Draft", rejected: "Archived" };
const statusClasses: Record<NewsStatus, string> = { published: "bg-emerald-50 text-emerald-600", pending: "bg-amber-50 text-amber-700", draft: "bg-neutral-100 text-neutral-600", rejected: "bg-red-50 text-red-600" };

function MiniTrend() {
  return <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600"><span>+0%</span><svg viewBox="0 0 48 24" className="h-5 w-10" aria-hidden="true"><path d="M 1 18 Q 12 18 23 12 T 47 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M 42 5 H 47 V 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></div>;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | NewsStatus>("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [totalCount, setTotalCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAdminNews(page, pageSize, { status: statusFilter === "all" ? undefined : statusFilter === "rejected" ? "ARCHIVED" : statusFilter === "pending" ? "SCHEDULED" : statusFilter.toUpperCase(), categoryId: categoryFilter, search }), api.getCategories()]).then(([payload, categoryItems]) => {
      const categoryById = new Map(categoryItems.map((category) => [category.id, category]));
      setNews(payload.articles.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt || "",
        content: "",
        categoryId: item.category?.id || "",
        category: item.category ? { ...item.category, color: categoryById.get(item.category.id)?.color || "#4f46e5", order: 0 } : null,
        image: item.featuredImage || "",
        author: item.authors?.[0]?.author?.name || "-",
        status: item.status === "PUBLISHED" ? "published" : item.status === "DRAFT" ? "draft" : item.status === "ARCHIVED" ? "rejected" : "pending",
        breaking: false,
        featured: false,
        publishedAt: item.publishedAt || null,
        views: item.views || 0,
      })));
      setCategories(categoryItems);
      setTotalCount(payload.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [categoryFilter, page, search, statusFilter]);

  const counts = useMemo(() => ({
    total: totalCount,
    published: news.filter((item) => item.status === "published").length,
    draft: news.filter((item) => item.status === "draft").length,
    views: news.reduce((sum, item) => sum + (item.views || 0), 0),
  }), [news]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = news;

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, search, statusFilter]);

  const remove = (id: string) => {
    const target = news.find((item) => item.id === id);
    if (!target) return;
    setDeleteError("");
    setDeleteTarget(target);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminArticle(deleteTarget.id);
      setNews((items) => items.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete news.");
    }
  };

  const tabs: Array<{ key: "all" | NewsStatus; label: string; count: number }> = [
    { key: "all", label: "All", count: counts.total },
    { key: "published", label: "Published", count: counts.published },
    { key: "draft", label: "Draft", count: counts.draft },
    { key: "rejected", label: "Archived", count: news.filter((item) => item.status === "rejected").length },
  ];
  const cards = [
    { label: "Total News", value: totalCount, icon: FileText, tone: "blue" },
    { label: "Published", value: counts.published, icon: CheckCircle2, tone: "green" },
    { label: "Draft", value: counts.draft, icon: BarChart3, tone: "amber" },
    { label: "Total Views", value: counts.views, icon: Eye, tone: "sky" },
  ];
  const toneClasses: Record<string, string> = { blue: "bg-blue-50 text-blue-900 border-blue-100", green: "bg-emerald-50 text-emerald-900 border-emerald-100", amber: "bg-yellow-50 text-yellow-900 border-yellow-100", sky: "bg-sky-50 text-sky-900 border-sky-100" };

  return <div className="space-y-5 text-brand-dark">
    <div className="flex items-start justify-between gap-4"><div><h1 className="text-3xl font-extrabold tracking-tight">All News</h1><p className="mt-1 text-sm text-slate-600">Manage and organize all your news.</p></div><Link href="/dashboard/admin/news/new" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-gold px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-gold-light"><Plus className="h-4 w-4" /> Add new News</Link></div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className={`rounded-2xl border p-4 shadow-sm ${toneClasses[card.tone]}`}><div className="mb-3 flex items-start justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold text-white"><Icon className="h-4 w-4" /></div><MiniTrend /></div><div className="text-2xl font-extrabold">{card.value.toLocaleString()}</div><div className="mt-1 text-sm font-semibold">{card.label}</div><div className="mt-3 text-xs text-slate-500"><span className="font-bold text-emerald-600">+0%</span> from last month</div></div>; })}</div>

    <div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search news" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm outline-none focus:border-indigo-500" /></div><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"><option value="all">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | NewsStatus)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"><option value="all">All status</option><option value="published">Published</option><option value="draft">Draft</option><option value="pending">Pending</option><option value="rejected">Archived</option></select></div>

    <div className="flex gap-7 border-b border-slate-200">{tabs.map((tab) => <button key={tab.key} type="button" onClick={() => setStatusFilter(tab.key)} className={`border-b-2 px-1 pb-3 text-sm font-bold transition ${statusFilter === tab.key ? "border-brand-gold text-brand-gold" : "border-transparent text-slate-600 hover:text-brand-gold"}`}>{tab.label}<span className="ml-3 text-xs font-semibold text-slate-500">{tab.count}</span></button>)}</div>

    {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading news...</div> : <><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-225 w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"><tr><th className="px-4 py-4">S.NO</th><th className="px-4 py-4">News</th><th className="px-4 py-4">Category</th><th className="px-4 py-4">Author</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Views</th><th className="px-4 py-4">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{paginated.map((item, index) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-4 py-4 font-semibold text-slate-800">{(safePage - 1) * pageSize + index + 1}</td><td className="max-w-70 px-4 py-4"><div className="flex items-center gap-3"><div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">{item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : null}</div><span className="font-bold leading-5 text-slate-800">{item.title}</span></div></td><td className="px-4 py-4"><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold" style={{ color: item.category?.color || "#4f46e5" }}>{item.category?.name || "-"}</span></td><td className="px-4 py-4 text-slate-700">{item.author || "-"}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[item.status]}`}>{statusLabels[item.status]}</span></td><td className="px-4 py-4 font-semibold text-slate-700">{item.views >= 1000 ? `${(item.views / 1000).toFixed(1)}K` : item.views.toLocaleString()}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><button type="button" aria-label="View news" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye className="h-4 w-4" /></button><Link href={`/dashboard/admin/news/${item.slug}/edit`} aria-label="Edit news" className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100"><Pencil className="h-4 w-4" /></Link><button type="button" aria-label="Delete news" onClick={() => remove(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}{paginated.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No blogs found</td></tr>}</tbody></table></div></div><Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} /></>}
    {deleteTarget && <ConfirmDialog open title="Delete news" confirmLabel="Delete news" onConfirm={() => void confirmDelete()} onCancel={() => { setDeleteError(""); setDeleteTarget(null); }} danger message={<><p>Are you sure you want to delete <span className="font-semibold text-neutral-900">{deleteTarget.title}</span>? This action cannot be undone.</p>{deleteError && <p className="mt-3 text-sm font-medium text-red-600">{deleteError}</p>}</>} />}
  </div>;
}
