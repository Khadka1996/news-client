"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { createCategory, type CategoryInput } from "@/lib/categories";

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const initial: CategoryInput = { name: "", slug: "", description: "", color: "#358CBD", order: 0, isActive: true };

export default function NewCategoryPage() {
  const router = useRouter();
  const [form, setForm] = useState<CategoryInput>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    if (!form.name.trim()) { setError("Category name is required."); return; }
    try { setSaving(true); await createCategory({ ...form, name: form.name.trim(), slug: form.slug?.trim() || slugify(form.name), description: form.description?.trim() || undefined }); router.push("/dashboard/admin/categories"); }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Unable to create category."); }
    finally { setSaving(false); }
  };
  return <CategoryForm title="Add New Category" form={form} error={error} saving={saving} update={update} onSubmit={submit} onBack={() => router.push("/dashboard/admin/categories")} submitLabel="Create Category" />;
}

export function CategoryForm({ title, form, error, saving, update, onSubmit, onBack, submitLabel }: { title: string; form: CategoryInput; error: string; saving: boolean; update: <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onBack: () => void; submitLabel: string }) {
  return <div className="space-y-6"><div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400"><Link href="/dashboard/admin" className="hover:text-brand-gold">Dashboard</Link><span>/</span><Link href="/dashboard/admin/categories" className="hover:text-brand-gold">Categories</Link><span>/</span><span className="text-neutral-600">{title}</span></div><div className="flex items-center justify-between gap-4"><div><h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">{title}</h1><p className="mt-2 text-sm text-neutral-500">Create a content group and define how it should appear across the site.</p></div><button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700"><ArrowLeft className="h-4 w-4" /> Back</button></div>{error && <StatusMessage type="error" message={error} />}<form onSubmit={onSubmit} className="rounded-2xl border border-neutral-200 bg-white p-6"><h2 className="mb-5 text-lg font-bold text-neutral-900">Category details</h2><div className="grid gap-5 lg:grid-cols-2"><Field label="Category name*" value={form.name} onChange={(value) => update("name", value)} placeholder="e.g. Business" /><Field label="Display order" type="number" value={String(form.order ?? 0)} onChange={(value) => update("order", Number(value) || 0)} /><Field label="Slug*" value={form.slug || ""} onChange={(value) => update("slug", value)} placeholder="business" /><div><label className="mb-1 block text-sm font-medium text-neutral-700">Color</label><div className="flex items-center gap-3"><input type="color" value={form.color || "#358CBD"} onChange={(event) => update("color", event.target.value)} className="h-11 w-16 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1" /><input value={form.color || "#358CBD"} onChange={(event) => update("color", event.target.value)} className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm uppercase outline-none" /></div></div><div className="lg:col-span-2"><label className="mb-1 block text-sm font-medium text-neutral-700">Description</label><textarea rows={4} value={form.description || ""} onChange={(event) => update("description", event.target.value)} className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none" /></div><div><label className="mb-1 block text-sm font-medium text-neutral-700">Status</label><select value={form.isActive ? "active" : "inactive"} onChange={(event) => update("isActive", event.target.value === "active")} className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div><div className="mt-6 flex justify-end"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" />{saving ? "Saving..." : submitLabel}</button></div></form></div>;
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) { return <div><label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none" /></div>; }
