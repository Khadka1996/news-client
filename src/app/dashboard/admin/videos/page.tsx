"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, CircleOff, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { deleteVideo, fetchVideoSummary, fetchVideosForAdmin, formatVideoStatus, updateVideo, type Video, type VideoStatus, type VideoSummary } from "@/lib/videos";

function MiniTrend({ percentChange }: { percentChange: number }) {
  const isPositive = percentChange >= 0;
  const color = isPositive ? "#16a34a" : "#ef4444";
  const pathY = isPositive ? 18 - Math.min(Math.abs(percentChange) / 100, 0.7) * 16 : 18 + Math.min(Math.abs(percentChange) / 100, 0.7) * 16;

  return (
    <div className="flex items-center gap-2 text-xs font-semibold">
      <span style={{ color }}>{isPositive ? "+" : ""}{percentChange}%</span>
      <svg viewBox="0 0 60 30" className="h-6 w-16 overflow-visible" aria-hidden="true">
        <path d={`M 0 18 Q 15 18 30 ${pathY} T 60 14`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function ManageVideoPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | VideoStatus>("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadVideos = async (nextPage = page) => {
    try {
      setLoading(true);
      const [payload, analyticsPayload, videoSummary] = await Promise.all([
        fetchVideosForAdmin(nextPage, 8, statusFilter === "all" ? undefined : statusFilter, search),
        fetchVideosForAdmin(1, 500),
        fetchVideoSummary(),
      ]);
      setVideos(payload.videos);
      setAllVideos(analyticsPayload.videos);
      setSummary(videoSummary);
      setTotalCount(payload.total);
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to load videos." });
      setVideos([]);
      setAllVideos([]);
      setSummary(null);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedVideos = videos;

  const publishedVideos = summary?.publishedVideos ?? allVideos.filter((video) => video.status === "PUBLISHED").length;
  const unpublishedVideos = summary?.unpublishedVideos ?? allVideos.filter((video) => video.status === "DRAFT").length;
  const scheduledVideos = summary?.scheduledVideos ?? allVideos.filter((video) => video.status === "SCHEDULED").length;
  const summaryCards = [
    { label: "Total Videos", value: summary?.totalVideos ?? allVideos.length, tone: "blue", icon: BarChart3, percentChange: summary?.percentChange.totalVideos ?? 0 },
    { label: "Published Videos", value: publishedVideos, tone: "green", icon: CheckCircle2, percentChange: summary?.percentChange.publishedVideos ?? 0 },
    { label: "Unpublished Videos", value: unpublishedVideos, tone: "amber", icon: CircleOff, percentChange: summary?.percentChange.unpublishedVideos ?? 0 },
    { label: "Scheduled Videos", value: scheduledVideos, tone: "blue", icon: BarChart3, percentChange: summary?.percentChange.scheduledVideos ?? 0 },
  ];

  const toneClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    void loadVideos(page);
  }, [page, search, statusFilter]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVideo(deleteTarget.id);
      setVideos((current) => current.filter((video) => video.id !== deleteTarget.id));
      setAllVideos((current) => current.filter((video) => video.id !== deleteTarget.id));
      setTotalCount((count) => Math.max(0, count - 1));
      setStatus({ type: "success", message: `${deleteTarget.title} deleted successfully.` });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to delete video." });
    } finally {
      setDeleteTarget(null);
    }
  }

  const toggleStatus = async (video: Video) => {
    const nextStatus = video.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const updated = await updateVideo(video.id, { status: nextStatus });
      setVideos((current) => current.map((item) => item.id === video.id ? { ...item, status: updated.status } : item));
      setAllVideos((current) => current.map((item) => item.id === video.id ? { ...item, status: updated.status } : item));
      setSelectedVideo((current) => current?.id === video.id ? { ...current, status: updated.status } : current);
      setStatus({ type: "success", message: `${video.title} is now ${formatVideoStatus(updated.status).toLowerCase()}.` });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to update video status." });
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Videos" }]} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">Videos</h1>
        </div>
        <Link href="/dashboard/admin/videos/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-light"><Plus className="h-4 w-4" /> New Video</Link>
      </div>

      {status && <StatusMessage type={status.type} title={status.type === "success" ? "Saved" : "Error"} message={status.message} />}

      {loading ? <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">Loading videos...</div> : <>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return <div key={card.label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
              <div className="mb-5 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${toneClasses[card.tone]}`}><Icon className="h-5 w-5" /></div>
                <MiniTrend percentChange={card.percentChange} />
              </div>
              <div className="text-3xl font-extrabold text-neutral-900">{card.value}</div>
              <div className="mt-2 text-lg font-semibold text-neutral-700">{card.label}</div>
            </div>;
          })}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="flex flex-col gap-4 border-b border-neutral-200 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search videos" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-neutral-700 outline-none focus:border-neutral-300 focus:bg-white" /></div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | VideoStatus)} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-300">
            <option value="all">All status</option><option value="DRAFT">Unpublished</option><option value="SCHEDULED">Scheduled</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500"><tr><th className="px-4 py-3">S.NO</th><th className="px-4 py-3">Thumbnail</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-neutral-200">
          {paginatedVideos.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-500">No videos found</td></tr> : paginatedVideos.map((video, index) => <tr key={video.id} className="bg-white hover:bg-neutral-50/70">
            <td className="px-4 py-3 font-semibold text-neutral-700">{(safePage - 1) * pageSize + index + 1}</td>
            <td className="px-4 py-3"><div className="h-14 w-24 overflow-hidden rounded-lg bg-neutral-100">{video.thumbnail ? <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-neutral-400">No image</div>}</div></td>
            <td className="max-w-sm px-4 py-3"><div className="font-semibold text-neutral-800">{video.title}</div></td>
            <td className="px-4 py-3 font-semibold text-neutral-700">{(safePage - 1) * pageSize + index + 1}</td>
            <td className="px-4 py-3"><button type="button" aria-label={video.status === "PUBLISHED" ? "Unpublish video" : "Publish video"} onClick={() => void toggleStatus(video)} className={`relative h-6 w-12 rounded-full transition-colors ${video.status === "PUBLISHED" ? "bg-brand-gold" : "bg-neutral-200"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${video.status === "PUBLISHED" ? "left-7" : "left-1"}`} /></button><div className="mt-1 text-xs font-medium text-neutral-500">{formatVideoStatus(video.status)}</div></td>
            <td className="px-4 py-3"><div className="flex items-center gap-2"><button type="button" aria-label="View video" onClick={() => setSelectedVideo(video)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye className="h-4 w-4" /></button><button type="button" aria-label="Edit video" onClick={() => router.push(`/dashboard/admin/videos/${video.slug}/edit`)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"><Pencil className="h-4 w-4" /></button><button type="button" aria-label="Delete video" onClick={() => setDeleteTarget(video)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button></div></td>
          </tr>)}
        </tbody></table></div>
      </div></>}

      {!loading && totalCount > 0 && <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />}

      {selectedVideo && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"><div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Video preview</p><h2 className="mt-1 text-2xl font-bold text-neutral-900">{selectedVideo.title}</h2></div><button type="button" onClick={() => setSelectedVideo(null)} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Close preview">×</button></div>{selectedVideo.thumbnail && <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="mt-5 h-56 w-full rounded-xl object-cover" />}<div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-neutral-200 p-3"><div className="text-xs uppercase tracking-wide text-neutral-400">Status</div><div className="mt-2 font-semibold text-neutral-900">{formatVideoStatus(selectedVideo.status)}</div></div><div className="rounded-xl border border-neutral-200 p-3"><div className="text-xs uppercase tracking-wide text-neutral-400">Source</div><div className="mt-2 font-semibold text-neutral-900">{selectedVideo.source}</div></div></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setSelectedVideo(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Close</button><button type="button" onClick={() => router.push(`/dashboard/admin/videos/${selectedVideo.slug}/edit`)} className="rounded-xl bg-brand-gold px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold-light">Edit details</button></div></div></div>}

      {deleteTarget && <ConfirmDialog open={Boolean(deleteTarget)} title="Delete video" confirmLabel="Delete video" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} danger message={<p>Are you sure you want to delete this <span className="font-semibold text-neutral-900">{deleteTarget.title}</span>?</p>} />}
    </div>
  );
}
