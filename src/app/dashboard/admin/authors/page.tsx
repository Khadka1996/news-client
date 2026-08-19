"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, UsersRound } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { deleteAuthor, fetchAuthorsForAdmin, updateAuthor, type AdminAuthor } from "@/lib/authors";

  const toneClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
  };

  export default function AdminAuthorsPage() {
    const [authors, setAuthors] = useState<AdminAuthor[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [selected, setSelected] = useState<AdminAuthor | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminAuthor | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
      let active = true;
      fetchAuthorsForAdmin().then((items) => {
        if (active) setAuthors(items);
      }).catch((error) => {
        if (active) setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to load authors." });
      }).finally(() => {
        if (active) setLoading(false);
      });
      return () => { active = false; };
    }, []);

    const filtered = useMemo(() => {
      const query = search.trim().toLowerCase();
      return authors.filter((author) => {
        const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? author.isActive : !author.isActive);
        const matchesSearch = !query || [author.name, author.bio || "", author.slug].some((value) => value.toLowerCase().includes(query));
        return matchesStatus && matchesSearch;
      });
    }, [authors, search, statusFilter]);

    const pageSize = 8;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    const toggle = async (author: AdminAuthor) => {
      try {
        const updated = await updateAuthor(author.id, { isActive: !author.isActive });
        setAuthors((current) => current.map((item) => item.id === author.id ? { ...updated, newsCount: author.newsCount } : item));
        setStatus({ type: "success", message: `${updated.name} is now ${updated.isActive ? "active" : "inactive"}.` });
      } catch (error) {
        setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to update author." });
      }
    };

    const confirmDelete = async () => {
      if (!deleteTarget) return;
      try {
        await deleteAuthor(deleteTarget.id);
        setAuthors((current) => current.filter((author) => author.id !== deleteTarget.id));
        setStatus({ type: "success", message: `${deleteTarget.name} deleted successfully.` });
      } catch (error) {
        setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to delete author." });
      } finally {
        setDeleteTarget(null);
      }
    };

    const cards = [
      { label: "Total Authors", value: authors.length, tone: "blue" as const },
      { label: "Active Authors", value: authors.filter((author) => author.isActive).length, tone: "green" as const },
      { label: "Inactive Authors", value: authors.filter((author) => !author.isActive).length, tone: "amber" as const },
    ];

    return <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Authors" }]} />
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">Authors</h1><p className="mt-2 text-sm text-neutral-500">Manage authors and their newsroom profiles.</p></div>
        <Link href="/dashboard/admin/authors/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-light"><Plus className="h-4 w-4" /> Add Author</Link>
      </div>
      {status && <StatusMessage type={status.type} title={status.type === "success" ? "Saved" : "Error"} message={status.message} />}
      {loading ? <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">Loading authors...</div> : <>
        <div className="grid gap-5 md:grid-cols-3">{cards.map((card) => <div key={card.label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]"><div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${toneClasses[card.tone]}`}><UsersRound className="h-5 w-5" /></div><div className="text-3xl font-extrabold text-neutral-900">{card.value}</div><div className="mt-2 text-lg font-semibold text-neutral-700">{card.label}</div></div>)}</div>
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]">
          <div className="flex flex-col gap-4 border-b border-neutral-200 p-4 md:flex-row md:items-center md:justify-between"><div className="relative w-full max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search authors" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-neutral-700 outline-none focus:border-neutral-300 focus:bg-white" /></div><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as "all" | "active" | "inactive"); setPage(1); }} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"><option value="all">All status</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500"><tr><th className="px-4 py-3">S.NO</th><th className="px-4 py-3">Photo</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">News</th><th className="px-4 py-3">Bio</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-neutral-200">{paginated.map((author, index) => <tr key={author.id} className="hover:bg-neutral-50/70"><td className="px-4 py-4 font-semibold text-neutral-700">{(safePage - 1) * pageSize + index + 1}</td><td className="px-4 py-4"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-neutral-100">{author.avatar ? <Image src={author.avatar} alt={author.name} width={48} height={48} unoptimized className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="text-sm font-bold text-neutral-400">{author.name.charAt(0).toUpperCase()}</span>}</div></td><td className="px-4 py-4 font-semibold text-neutral-800">{author.name}</td><td className="px-4 py-4 font-semibold text-neutral-700">{author.newsCount}</td><td className="max-w-md px-4 py-4 text-neutral-600">{author.bio || "-"}</td><td className="px-4 py-4"><button type="button" aria-label={author.isActive ? "Deactivate author" : "Activate author"} onClick={() => void toggle(author)} className={`relative h-6 w-12 rounded-full ${author.isActive ? "bg-brand-gold" : "bg-neutral-200"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white ${author.isActive ? "left-7" : "left-1"}`} /></button><div className="mt-1 text-xs font-medium text-neutral-500">{author.isActive ? "Active" : "Inactive"}</div></td><td className="px-4 py-4"><div className="flex items-center gap-2"><button type="button" aria-label="View author" onClick={() => setSelected(author)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye className="h-4 w-4" /></button><Link href={`/dashboard/admin/authors/${author.id}/edit`} aria-label="Edit author" className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"><Pencil className="h-4 w-4" /></Link><button type="button" aria-label="Delete author" onClick={() => setDeleteTarget(author)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}{paginated.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-500">No authors found</td></tr>}</tbody></table></div>
        </div><Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      </>}
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-neutral-100">{selected.avatar ? <Image src={selected.avatar} alt={selected.name} width={48} height={48} unoptimized className="h-full w-full object-cover" /> : <span className="font-bold text-neutral-400">{selected.name.charAt(0)}</span>}</div><h2 className="text-xl font-bold text-neutral-900">{selected.name}</h2></div><p className="mt-4 text-sm text-neutral-600">{selected.bio || "No bio provided."}</p><div className="mt-6 flex justify-end"><button type="button" onClick={() => setSelected(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm">Close</button></div></div></div>}
      {deleteTarget && <ConfirmDialog open title="Delete author" confirmLabel="Delete author" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} danger message={<p>Are you sure you want to delete <span className="font-semibold text-neutral-900">{deleteTarget.name}</span>?</p>} />}
    </div>;
  }