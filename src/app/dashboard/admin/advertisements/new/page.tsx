"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { AD_POSITION_OPTIONS, createAdvertisement, formatAdvertisementPosition, type AdvertisementCreateInput } from "@/lib/advertisements";
import { StatusMessage } from "@/components/ui/StatusMessage";

const toIsoDateTime = (value?: string) => {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
};

const emptyForm: AdvertisementCreateInput = {
  title: "",
  imageUrl: "",
  targetUrl: "",
  position: "HOMEPAGE_TOP_BANNER",
  active: true,
  injectAfterParagraphs: undefined,
  startDate: "",
  endDate: "",
};

export default function NewAdvertisementPage() {
  const router = useRouter();
  const [form, setForm] = useState<AdvertisementCreateInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = <K extends keyof AdvertisementCreateInput>(key: K, value: AdvertisementCreateInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim() || !form.imageUrl.trim()) {
      setError("Title and image URL are required.");
      return;
    }

    try {
      setSaving(true);
      await createAdvertisement({
        ...form,
        title: form.title.trim(),
        imageUrl: form.imageUrl.trim(),
        targetUrl: form.targetUrl?.trim() || undefined,
        active: form.active ?? true,
        injectAfterParagraphs: form.position === "ARTICLE_IN_CONTENT" ? (form.injectAfterParagraphs ?? undefined) : undefined,
        startDate: toIsoDateTime(form.startDate),
        endDate: toIsoDateTime(form.endDate),
      });
      setSuccess("Advertisement created successfully.");
      setTimeout(() => router.push("/dashboard/admin/advertisements"), 600);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create advertisement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
        <Link href="/dashboard/admin" className="transition hover:text-brand-gold">Dashboard</Link>
        <span className="text-neutral-300">/</span>
        <Link href="/dashboard/admin/advertisements" className="transition hover:text-brand-gold">Advertisements</Link>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-600">New</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">New Advertisement</h1>
        </div>
        <button type="button" onClick={() => router.push("/dashboard/admin/advertisements")} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {error && <StatusMessage type="error" message={error} />}
      {success && <StatusMessage type="success" title="Saved" message={success} />}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Ad title</label>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
              placeholder="e.g. Homepage Top Banner"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Image URL</label>
            <input
              value={form.imageUrl}
              onChange={(event) => updateField("imageUrl", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Target URL</label>
            <input
              value={form.targetUrl ?? ""}
              onChange={(event) => updateField("targetUrl", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
              placeholder="https://example.com/offer"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Position</label>
            <select
              value={form.position}
              onChange={(event) => updateField("position", event.target.value as AdvertisementCreateInput["position"])}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
            >
              {AD_POSITION_OPTIONS.map((position) => (
                <option key={position} value={position}>{formatAdvertisementPosition(position)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Status</label>
            <select
              value={form.active ? "active" : "paused"}
              onChange={(event) => updateField("active", event.target.value === "active")}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {form.position === "ARTICLE_IN_CONTENT" && (
            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Repeat every N paragraphs</label>
              <input
                type="number"
                min={1}
                value={form.injectAfterParagraphs ?? ""}
                onChange={(event) => updateField("injectAfterParagraphs", Number(event.target.value) || undefined)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
                placeholder="e.g. 4"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Start date</label>
            <input
              type="datetime-local"
              value={form.startDate ?? ""}
              onChange={(event) => updateField("startDate", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">End date</label>
            <input
              type="datetime-local"
              value={form.endDate ?? ""}
              onChange={(event) => updateField("endDate", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Create Advertisement"}
          </button>
        </div>
      </form>
    </div>
  );
}
