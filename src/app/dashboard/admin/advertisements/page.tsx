"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, Pencil, Plus, Search, ShieldCheck, Trash2, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { deleteAdvertisement, fetchAdvertisementSummary, fetchAdvertisementsForAdmin, formatAdvertisementPosition, updateAdvertisement, type Advertisement } from "@/lib/advertisements";

const iconClass = "h-5 w-5";

type SummaryCard = {
  key: "totalAds" | "activeAds" | "pausedAds" | "avgCtr";
  label: string;
  value: string;
  percentChange: number;
  tone: "blue" | "green" | "amber" | "red";
  icon: React.ReactNode;
};

function MiniTrend({ percentChange }: { percentChange: number }) {
  const isPositive = percentChange >= 0;
  const color = isPositive ? "#16a34a" : "#ef4444";
  const pathY = isPositive ? 18 - Math.min(Math.abs(percentChange) / 100, 0.7) * 16 : 18 + Math.min(Math.abs(percentChange) / 100, 0.7) * 16;

  return (
    <div className="flex items-center gap-2 text-xs font-semibold">
      <span style={{ color }}>{isPositive ? "+" : ""}{percentChange}%</span>
      <svg viewBox="0 0 60 30" className="h-6 w-16 overflow-visible">
        <path
          d={`M 0 18 Q 15 18 30 ${pathY} T 60 14`}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function ManageAdvertisementPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Advertisement | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadAds = async () => {
    try {
      setLoading(true);
      const [payload, adSummary] = await Promise.all([
        fetchAdvertisementsForAdmin(1, 500),
        fetchAdvertisementSummary(),
      ]);

      setAds(payload.advertisements);
      setTotalCount(payload.total);
      setSummary(adSummary);
      setPage(1);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load advertisements.",
      });
      setAds([]);
      setTotalCount(0);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAds();
  }, []);

  const filteredAds = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ads.filter((ad) => {
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? ad.active : !ad.active);
      if (!matchesStatus) return false;

      if (!query) return true;

      return [ad.title, ad.position, ad.targetUrl || ""].some((value) => value.toLowerCase().includes(query));
    });
  }, [ads, search, statusFilter]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredAds.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedAds = filteredAds.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const summaryCards: SummaryCard[] = useMemo(() => {
    const active = summary?.activeAds ?? ads.filter((ad) => ad.active).length;
    const paused = summary?.pausedAds ?? Math.max(0, ads.length - active);
    const avgCtr = summary?.avgCtr ?? (ads.length === 0 ? 0 : Number(((ads.reduce((sum, ad) => sum + (ad.impressions ? (ad.clicks / ad.impressions) * 100 : 0), 0) / ads.length)).toFixed(1)));

    const totalValue = summary?.totalAds ?? (totalCount || ads.length);

    return [
      { key: "totalAds", label: "Total Ads", value: `${totalValue}`, percentChange: summary?.percentChange.totalAds ?? 0, tone: "blue", icon: <BarChart3 className={iconClass} /> },
      { key: "activeAds", label: "Active Ads", value: `${active}`, percentChange: summary?.percentChange.activeAds ?? 0, tone: "green", icon: <ShieldCheck className={iconClass} /> },
      { key: "pausedAds", label: "Paused Ads", value: `${paused}`, percentChange: summary?.percentChange.pausedAds ?? 0, tone: "amber", icon: <Zap className={iconClass} /> },
      { key: "avgCtr", label: "Avg CTR", value: `${avgCtr.toFixed(1)}%`, percentChange: summary?.percentChange.avgCtr ?? 0, tone: "red", icon: <BarChart3 className={iconClass} /> },
    ];
  }, [ads, summary, totalCount]);

  const toneClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200",
  };

  const toggle = async (id: string) => {
    const target = ads.find((ad) => ad.id === id);
    if (!target) return;

    try {
      const updated = await updateAdvertisement(id, { active: !target.active });
      setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, active: updated.active } : ad)));
      setStatus({ type: "success", message: `${updated.title} is now ${updated.active ? "active" : "paused"}.` });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to update ad status." });
    }
  };

  const remove = (id: string) => {
    const target = ads.find((ad) => ad.id === id);
    if (!target) return;
    setDeleteTarget(target);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAdvertisement(deleteTarget.id);
      setAds((prev) => prev.filter((ad) => ad.id !== deleteTarget.id));
      setStatus({ type: "success", message: `${deleteTarget.title} deleted successfully.` });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to delete advertisement." });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Advertisements" }]} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">Advertisements</h1>
        </div>
        <Link href="/dashboard/admin/advertisements/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-light">
          <Plus className="h-4 w-4" /> New Advertisement
        </Link>
      </div>

      {status && <StatusMessage type={status.type} title={status.type === "success" ? "Saved" : "Error"} message={status.message} />}

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">Loading advertisements...</div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => (
              <div key={item.key} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                <div className="mb-5 flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${toneClasses[item.tone]}`}>
                    {item.icon}
                  </div>
                  <MiniTrend percentChange={item.percentChange} />
                </div>
                <div className="text-3xl font-extrabold text-neutral-900">{item.value}</div>
                <div className="mt-2 text-lg font-semibold text-neutral-700">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]">
            <div className="flex flex-col gap-4 border-b border-neutral-200 p-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search advertisements"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-neutral-700 outline-none transition focus:border-neutral-300 focus:bg-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "paused")}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-300"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">S.NO</th>
                    <th className="px-4 py-3">Ad Title</th>
                    <th className="px-4 py-3">Placement</th>
                    <th className="px-4 py-3">Impressions</th>
                    <th className="px-4 py-3">Clicks</th>
                    <th className="px-4 py-3">CTR</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paginatedAds.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-neutral-500">
                        No advertisements found
                      </td>
                    </tr>
                  ) : (
                    paginatedAds.map((ad, index) => {
                      const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) + "%" : "0.00%";

                      return (
                        <tr key={ad.id} className="bg-white hover:bg-neutral-50/70">
                          <td className="px-4 py-4 font-semibold text-neutral-700">{(safePage - 1) * pageSize + index + 1}</td>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-neutral-800">{ad.title}</div>
                          </td>
                          <td className="px-4 py-4 text-neutral-600">{formatAdvertisementPosition(ad.position)}</td>
                          <td className="px-4 py-4 text-neutral-600">{ad.impressions.toLocaleString()}</td>
                          <td className="px-4 py-4 text-neutral-600">{ad.clicks.toLocaleString()}</td>
                          <td className="px-4 py-4 text-neutral-600">{ctr}</td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              aria-label={ad.active ? "Pause ad" : "Activate ad"}
                              onClick={() => void toggle(ad.id)}
                              className={`relative h-6 w-12 rounded-full transition-colors ${ad.active ? "bg-brand-gold" : "bg-neutral-200"}`}
                            >
                              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${ad.active ? "left-7" : "left-1"}`} />
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="View advertisement"
                                onClick={() => setSelectedAd(ad)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                aria-label="Edit advertisement"
                                onClick={() => router.push(`/dashboard/admin/advertisements/${ad.id}/edit`)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                aria-label="Delete advertisement"
                                onClick={() => remove(ad.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!filteredAds.length ? null : (
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          )}

          {selectedAd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
              <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Advertisement preview</p>
                    <h2 className="mt-1 text-2xl font-bold text-neutral-900">{selectedAd.title}</h2>
                  </div>
                  <button type="button" onClick={() => setSelectedAd(null)} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100">
                    <span className="text-xl">×</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedAd.imageUrl ? (
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                      <img src={selectedAd.imageUrl} alt={selectedAd.title} className="h-52 w-full object-cover" />
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-neutral-400">Placement</div>
                    <div className="mt-2 font-semibold text-neutral-900">{formatAdvertisementPosition(selectedAd.position)}</div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200 p-3">
                      <div className="text-xs uppercase tracking-wide text-neutral-400">Status</div>
                      <div className="mt-2 font-semibold text-neutral-900">{selectedAd.active ? "Active" : "Paused"}</div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 p-3">
                      <div className="text-xs uppercase tracking-wide text-neutral-400">CTR</div>
                      <div className="mt-2 font-semibold text-neutral-900">{selectedAd.impressions > 0 ? ((selectedAd.clicks / selectedAd.impressions) * 100).toFixed(2) + "%" : "0.00%"}</div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 p-3">
                      <div className="text-xs uppercase tracking-wide text-neutral-400">Impressions</div>
                      <div className="mt-2 font-semibold text-neutral-900">{selectedAd.impressions.toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 p-3">
                      <div className="text-xs uppercase tracking-wide text-neutral-400">Clicks</div>
                      <div className="mt-2 font-semibold text-neutral-900">{selectedAd.clicks.toLocaleString()}</div>
                    </div>
                  </div>

                  {selectedAd.targetUrl && (
                    <div className="rounded-xl border border-neutral-200 p-3 text-sm text-neutral-700">
                      <div className="text-xs uppercase tracking-wide text-neutral-400">Target URL</div>
                      <div className="mt-2 break-all text-blue-600 underline">{selectedAd.targetUrl}</div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button type="button" onClick={() => setSelectedAd(null)} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                    Close
                  </button>
                  <button type="button" onClick={() => { setSelectedAd(null); router.push(`/dashboard/admin/advertisements/${selectedAd.id}/edit`); }} className="rounded-xl bg-brand-gold px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold-light">
                    Edit details
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteTarget && (
            <ConfirmDialog
              open={Boolean(deleteTarget)}
              title="Delete advertisement"
              confirmLabel="Delete ad"
              onConfirm={confirmDelete}
              onCancel={() => setDeleteTarget(null)}
              danger
              message={
                <>
                  <p className="text-sm text-neutral-600">
                    Are you sure you want to remove <span className="font-semibold text-neutral-900">{deleteTarget.title}</span> permanently? This action cannot be undone.
                  </p>
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <div className="font-semibold">Placement: {formatAdvertisementPosition(deleteTarget.position)}</div>
                    <div className="mt-1">Status: {deleteTarget.active ? "Active" : "Paused"}</div>
                  </div>
                </>
              }
            />
          )}
        </>
      )}
    </div>
  );
}
