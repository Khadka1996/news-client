"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { StatusMessage } from "@/components/ui/StatusMessage";
import {
  createVideo,
  fetchYoutubeMetadata,
  uploadVideoFile,
  type VideoInput,
  type VideoSource,
} from "@/lib/videos";

const emptyForm: VideoInput = {
  title: "",
  description: "",
  source: "YOUTUBE",
  videoUrl: "",
  thumbnail: "",
  durationSeconds: undefined,
  tagNames: [],
  status: "PUBLISHED",
  scheduledFor: "",
};
const toIsoDateTime = (value?: string) =>
  value ? new Date(value).toISOString() : undefined;

export default function NewVideoPage() {
  const router = useRouter();
  const [form, setForm] = useState<VideoInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = <K extends keyof VideoInput>(
    key: K,
    value: VideoInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!form.title.trim() || !form.videoUrl.trim()) {
      setError("Title and video URL are required.");
      return;
    }
    try {
      setSaving(true);
      await createVideo({
        title: form.title.trim(),
        source: form.source,
        status: form.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        description: form.description?.trim() || undefined,
        videoUrl: form.videoUrl.trim(),
        thumbnail: form.thumbnail?.trim() || undefined,
      });
      setSuccess("Video created successfully.");
      setTimeout(() => router.push("/dashboard/admin/videos"), 600);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create video.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <VideoForm
      title="New Video"
      form={form}
      error={error}
      success={success}
      saving={saving}
      updateField={updateField}
      onSubmit={handleSubmit}
      onBack={() => router.push("/dashboard/admin/videos")}
      submitLabel="Create Video"
    />
  );
}

export function VideoForm({
  title,
  form,
  error,
  success,
  saving,
  updateField,
  onSubmit,
  onBack,
  submitLabel,
}: {
  title: string;
  form: VideoInput;
  error: string;
  success: string;
  saving: boolean;
  updateField: <K extends keyof VideoInput>(
    key: K,
    value: VideoInput[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  submitLabel: string;
}) {
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataMessage, setMetadataMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleVideoFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploading(true);
      const publicUrl = await uploadVideoFile(file);
      updateField("videoUrl", publicUrl);
      setMetadataMessage("Video uploaded successfully.");
    } catch (uploadError) {
      setMetadataMessage(uploadError instanceof Error ? uploadError.message : "Unable to upload video.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (form.source !== "YOUTUBE" || !form.videoUrl.trim()) {
      setMetadataMessage("");
      return;
    }

    let cancelled = false;
    setMetadataLoading(true);
    void fetchYoutubeMetadata(form.videoUrl)
      .then((metadata) => {
        if (cancelled || !metadata) return;
        if (!form.thumbnail) updateField("thumbnail", metadata.thumbnail);
        if (!form.title && metadata.title) updateField("title", metadata.title);
        setMetadataMessage(
          metadata.authorName
            ? `Detected from YouTube: ${metadata.authorName}`
            : "YouTube thumbnail detected automatically.",
        );
      })
      .finally(() => {
        if (!cancelled) setMetadataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.source, form.videoUrl]);

  return (
    <div className="space-y-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
        <Link href="/dashboard/admin" className="hover:text-brand-gold">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/dashboard/admin/videos" className="hover:text-brand-gold">
          Videos
        </Link>
        <span>/</span>
        <span className="text-neutral-600">{title}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">
          {title}
        </h1>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>
      {error && <StatusMessage type="error" message={error} />}
      {success && (
        <StatusMessage type="success" title="Saved" message={success} />
      )}
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.02)]"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <Field
            label="Title"
            value={form.title}
            onChange={(value) => updateField("title", value)}
            className="lg:col-span-2"
            placeholder="Video title"
          />
          {form.source === "UPLOAD" ? (
            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Video file</label>
              <input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={uploading} onChange={(event) => void handleVideoFile(event.target.files?.[0])} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium" />
              <p className="mt-1 text-xs text-neutral-500">Maximum 500 MB. The file uploads directly to storage.</p>
            </div>
          ) : (
            <Field label="Video URL" value={form.videoUrl} onChange={(value) => updateField("videoUrl", value)} className="lg:col-span-2" placeholder="https://youtube.com/watch?v=..." />
          )}
          {metadataLoading && (
            <p className="-mt-3 text-xs text-neutral-500 lg:col-span-2">
              Detecting YouTube details...
            </p>
          )}
          {metadataMessage && (
            <p className="-mt-3 text-xs text-emerald-600 lg:col-span-2">
              {metadataMessage}
            </p>
          )}
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={4}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-300"
            />
          </div>
          <SelectField
            label="Source"
            value={form.source || "YOUTUBE"}
            options={["YOUTUBE", "UPLOAD"]}
            onChange={(value) => updateField("source", value as VideoSource)}
          />
          <SelectField
            label="Status"
            value={form.status === "DRAFT" ? "DRAFT" : "PUBLISHED"}
            options={["PUBLISHED", "DRAFT"]}
            optionLabels={{ PUBLISHED: "Published", DRAFT: "Unpublished" }}
            onChange={(value) => updateField("status", value as "PUBLISHED" | "DRAFT")}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-light disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  if (label === "Thumbnail URL") return null;
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-300"
      />
    </div>
  );
}
function SelectField({
  label,
  value,
  options,
  optionLabels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-300"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] || option.charAt(0) + option.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
