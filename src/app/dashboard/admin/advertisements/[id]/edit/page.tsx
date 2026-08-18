"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AD_POSITION_OPTIONS, fetchAdvertisementsForAdmin, formatAdvertisementPosition, updateAdvertisement, type Advertisement, type AdvertisementCreateInput } from "@/lib/advertisements";

const toIsoDateTime = (value?: string) => {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
};

export default function EditAdvertisementPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [form, setForm] = useState<AdvertisementCreateInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const id = String(params?.id ?? "");
    if (!id) {
      setError("Advertisement not found.");
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        const payload = await fetchAdvertisementsForAdmin(1, 100);
        const target = payload.advertisements.find((item) => item.id === id);

        if (!target) {
          setError("Advertisement not found.");
          setAdvertisement(null);
          setForm(null);
          setLoading(false);
          return;
        }

        setAdvertisement(target);
        setForm({
          title: target.title,
          imageUrl: target.imageUrl,
          targetUrl: target.targetUrl || "",
          position: target.position,
          active: target.active,
          injectAfterParagraphs: target.injectAfterParagraphs ?? undefined,
          startDate: target.startDate ? new Date(target.startDate).toISOString().slice(0, 16) : "",
          endDate: target.endDate ? new Date(target.endDate).toISOString().slice(0, 16) : "",
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load advertisement.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [params?.id]);

  const updateField = <K extends keyof AdvertisementCreateInput>(key: K, value: AdvertisementCreateInput[K]) => {
    if (!form) return;
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!advertisement || !form) return;

    setError("");
    setSuccess("");

    try {
      setSaving(true);
      await updateAdvertisement(advertisement.id, {
        ...form,
        title: form.title.trim(),
        imageUrl: form.imageUrl.trim(),
        targetUrl: form.targetUrl?.trim() || undefined,
        injectAfterParagraphs: form.position === "ARTICLE_IN_CONTENT" ? (form.injectAfterParagraphs ?? undefined) : undefined,
        startDate: toIsoDateTime(form.startDate),
        endDate: toIsoDateTime(form.endDate),
      });
      setSuccess("Advertisement updated successfully.");
      setTimeout(() => router.push("/dashboard/admin/advertisements"), 600);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update advertisement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-neutral-500">Loading advertisement details...</div>;
  }

  if (!form || !advertisement) {
    return (
      <div className="space-y-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          <Link href="/dashboard/admin" className="transition hover:text-brand-gold">Dashboard</Link>
          <span className="text-neutral-300">/</span>
          <Link href="/dashboard/admin/advertisements" className="transition hover:text-brand-gold">Advertisements</Link>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-600">Edit</span>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error || "Advertisement not found."}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
        <Link href="/dashboard/admin" className="transition hover:text-brand-gold">Dashboard</Link>
        <span className="text-neutral-300">/</span>
        <Link href="/dashboard/admin/advertisements" className="transition hover:text-brand-gold">Advertisements</Link>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-600">Edit</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">Edit Advertisement</h1>
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
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Image URL</label>
            <input
              value={form.imageUrl}
              onChange={(event) => updateField("imageUrl", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Target URL</label>
            <input
              value={form.targetUrl ?? ""}
              onChange={(event) => updateField("targetUrl", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
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
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
