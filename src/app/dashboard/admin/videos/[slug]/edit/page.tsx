"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchVideoForAdmin, updateVideo, type VideoInput, type Video } from "@/lib/videos";
import { VideoForm } from "@/app/dashboard/admin/videos/new/page";

const toLocalDateTime = (value?: string | null) => value ? new Date(value).toISOString().slice(0, 16) : "";

export default function EditVideoPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [form, setForm] = useState<VideoInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const slug = String(params?.slug || "");
    if (!slug) { setError("Video not found."); setLoading(false); return; }
    void fetchVideoForAdmin(slug).then((target) => {
      setVideo(target);
      setForm({ title: target.title, description: target.description || "", source: target.source, videoUrl: target.videoUrl, thumbnail: target.thumbnail || "", status: target.status });
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load video."))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  const updateField = <K extends keyof VideoInput>(key: K, value: VideoInput[K]) => setForm((current) => current ? { ...current, [key]: value } : current);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!video || !form) return;
    setError(""); setSuccess("");
    if (!form.title.trim() || !form.videoUrl.trim()) { setError("Title and video URL are required."); return; }
    try {
      setSaving(true);
      await updateVideo(video.id, { ...form, title: form.title.trim(), description: form.description?.trim() || undefined, videoUrl: form.videoUrl.trim(), thumbnail: form.thumbnail?.trim() || undefined, status: form.status === "DRAFT" ? "DRAFT" : "PUBLISHED" });
      setSuccess("Video updated successfully."); setTimeout(() => router.push("/dashboard/admin/videos"), 600);
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Unable to update video."); } finally { setSaving(false); }
  };

  if (loading) return <div className="text-sm text-neutral-500">Loading video details...</div>;
  if (!form || !video) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error || "Video not found."}</div>;
  return <VideoForm title="Edit Video" form={form} error={error} success={success} saving={saving} updateField={updateField} onSubmit={handleSubmit} onBack={() => router.push("/dashboard/admin/videos")} submitLabel="Save changes" />;
}
