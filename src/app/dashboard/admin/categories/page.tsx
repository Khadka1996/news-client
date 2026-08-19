"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { StatusMessage } from "@/components/ui/StatusMessage";
import {
  deleteCategory,
  fetchAdminCategories,
  updateCategory,
  type AdminCategory,
} from "@/lib/categories";

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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [categorySummary, setSummary] = useState<{ active: number; inactive: number; topCategory: AdminCategory | null; percentChange: { total: number; active: number; inactive: number } }>({ active: 0, inactive: 0, topCategory: null, percentChange: { total: 0, active: 0, inactive: 0 } });
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadCategories = async (nextPage = page) => {
    try {
      setLoading(true);
      const payload = await fetchAdminCategories(nextPage, 8, search, statusFilter);
      setCategories(payload.categories);
      setTotalCount(payload.total);
      setSummary({ active: payload.active, inactive: payload.inactive, topCategory: payload.topCategory, percentChange: payload.percentChange });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to load categories.",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadCategories(page);
  }, [page, search, statusFilter]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = categories;
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const summary = [
    {
      label: "Total Categories",
      value: totalCount,
      tone: "bg-blue-100 text-blue-700",
      percentChange: categorySummary.percentChange.total,
    },
    {
      label: "Active",
      value: categorySummary.active,
      tone: "bg-emerald-100 text-emerald-700",
      percentChange: categorySummary.percentChange.active,
    },
    {
      label: "Inactive",
      value: categorySummary.inactive,
      tone: "bg-amber-100 text-amber-700",
      percentChange: categorySummary.percentChange.inactive,
    },
    {
      label: "Top Category",
      value: categorySummary.topCategory?.name || "-",
      tone: "bg-violet-100 text-violet-700",
      percentChange: 0,
    },
  ];

  const toggle = async (category: AdminCategory) => {
    try {
      const updated = await updateCategory(category.id, {
        isActive: !category.isActive,
      });
      setCategories((current) =>
        current.map((item) => (item.id === category.id ? updated : item)),
      );
      setStatus({
        type: "success",
        message: `${updated.name} is now ${updated.isActive ? "active" : "inactive"}.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update category status.",
      });
    }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      setCategories((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setStatus({
        type: "success",
        message: `${deleteTarget.name} deleted successfully.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to delete category.",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Categories" },
        ]}
      />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">
            Categories
          </h1>
        </div>
        <Link
          href="/dashboard/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-light"
        >
          <Plus className="h-4 w-4" /> Add Category
        </Link>
      </div>
      {status && (
        <StatusMessage
          type={status.type}
          title={status.type === "success" ? "Saved" : "Error"}
          message={status.message}
        />
      )}
      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          Loading categories...
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-neutral-200 bg-white p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border border-current/10 ${item.tone}`}
                  >
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <MiniTrend percentChange={item.percentChange} />
                </div>
                <div className="truncate text-2xl font-extrabold text-neutral-900">
                  {item.value}
                </div>
                <div className="mt-2 text-lg font-semibold text-neutral-700">
                  {item.label}
                </div>
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
                  placeholder="Search categories"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:bg-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "all" | "active" | "inactive",
                  )
                }
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">S.NO</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Posts</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-neutral-500"
                      >
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    paginated.map((category) => (
                      <tr key={category.id} className="hover:bg-neutral-50/70">
                        <td className="px-4 py-4 font-semibold text-neutral-700">
                          {(safePage - 1) * pageSize + paginated.indexOf(category) + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 font-semibold text-neutral-800">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: category.color || "#358CBD",
                              }}
                            />
                            <span style={{ color: category.color || "#358CBD" }}>{category.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-neutral-600">
                          /{category.slug}
                        </td>
                        <td className="max-w-sm px-4 py-4 text-neutral-600">
                          {category.description || "-"}
                        </td>
                        <td className="px-4 py-4 font-semibold text-neutral-700">
                          {category.postCount}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            aria-label={
                              category.isActive
                                ? "Deactivate category"
                                : "Activate category"
                            }
                            onClick={() => void toggle(category)}
                            className={`relative h-6 w-12 rounded-full ${category.isActive ? "bg-brand-gold" : "bg-neutral-200"}`}
                          >
                            <span
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white ${category.isActive ? "left-7" : "left-1"}`}
                            />
                          </button>
                          <div className="mt-1 text-xs font-medium text-neutral-500">
                            {category.isActive ? "Active" : "Inactive"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label="View category"
                              onClick={() => setSelected(category)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <Link
                              href={`/dashboard/admin/categories/${category.id}/edit`}
                              aria-label="Edit category"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              aria-label="Delete category"
                              onClick={() => setDeleteTarget(category)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full" style={{ backgroundColor: selected.color || "#358CBD" }} /><h2 className="text-xl font-bold" style={{ color: selected.color || "#358CBD" }}>{selected.name}</h2></div>
            <p className="mt-2 text-sm text-neutral-600">/{selected.slug}</p>
            <p className="mt-4 text-sm text-neutral-700">
              {selected.description || "No description provided."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-neutral-200 p-3"><div className="text-xs uppercase tracking-wide text-neutral-400">Posts</div><div className="mt-1 font-semibold text-neutral-900">{selected.postCount}</div></div><div className="rounded-xl border border-neutral-200 p-3"><div className="text-xs uppercase tracking-wide text-neutral-400">Status</div><div className="mt-1 font-semibold text-neutral-900">{selected.isActive ? "Active" : "Inactive"}</div></div></div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setSelected(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm">Close</button><Link href={`/dashboard/admin/categories/${selected.id}/edit`} onClick={() => setSelected(null)} className="rounded-xl bg-brand-gold px-4 py-2 text-sm font-semibold text-white">Edit category</Link></div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          open
          title="Delete category"
          confirmLabel="Delete category"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
          message={
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-neutral-900">
                {deleteTarget.name}
              </span>
              ?
            </p>
          }
        />
      )}
    </div>
  );
}
