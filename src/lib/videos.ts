"use client";

import { getAccessToken, refreshAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type VideoStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type VideoSource = "YOUTUBE" | "UPLOAD";

export type Video = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  source: VideoSource;
  videoUrl: string;
  thumbnail?: string | null;
  durationSeconds?: number | null;
  status: VideoStatus;
  tags?: Array<{ tag: { id: string; name: string; slug?: string } }>;
  scheduledFor?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type VideoInput = {
  title: string;
  description?: string;
  source: VideoSource;
  videoUrl: string;
  thumbnail?: string;
  durationSeconds?: number;
  tagNames?: string[];
  status?: VideoStatus;
  scheduledFor?: string;
};

export type YoutubeMetadata = {
  videoId: string;
  title?: string;
  authorName?: string;
  thumbnail: string;
};

export function getYoutubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    if (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      if (["shorts", "embed", "live"].includes(parts[0])) return parts[1] || null;
    }
  } catch {
    return null;
  }
  return null;
}

export async function fetchYoutubeMetadata(value: string): Promise<YoutubeMetadata | null> {
  const videoId = getYoutubeVideoId(value);
  if (!videoId) return null;

  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(value)}&format=json`);
    if (!response.ok) return { videoId, thumbnail };
    const payload = await response.json() as { title?: string; author_name?: string; thumbnail_url?: string };
    return { videoId, title: payload.title, authorName: payload.author_name, thumbnail: payload.thumbnail_url || thumbnail };
  } catch {
    return { videoId, thumbnail };
  }
}

type VideoListResponse = { videos: Video[]; total: number };

export type VideoSummary = {
  totalVideos: number;
  publishedVideos: number;
  unpublishedVideos: number;
  scheduledVideos: number;
  percentChange: {
    totalVideos: number;
    publishedVideos: number;
    unpublishedVideos: number;
    scheduledVideos: number;
  };
};

async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  let response = await fetch(url, { credentials: "include", ...init, headers });
  if (response.status === 401 && token) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      headers.set("Authorization", `Bearer ${refreshedToken}`);
      response = await fetch(url, { credentials: "include", ...init, headers });
    }
  }
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchVideosForAdmin(page = 1, pageSize = 20, status?: VideoStatus, search?: string): Promise<VideoListResponse> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) params.set("status", status);
  if (search?.trim()) params.set("search", search.trim());
  return fetchJson<VideoListResponse>(`${API_URL}/videos/admin/list?${params.toString()}`);
}

export async function fetchVideoSummary(): Promise<VideoSummary> {
  return fetchJson<VideoSummary>(`${API_URL}/videos/admin/summary`);
}

export async function fetchVideoForAdmin(slug: string): Promise<Video> {
  return fetchJson<Video>(`${API_URL}/videos/admin/${slug}`);
}

export async function createVideo(input: VideoInput): Promise<Video> {
  return fetchJson<Video>(`${API_URL}/videos`, { method: "POST", body: JSON.stringify(input) });
}

export async function uploadVideoFile(file: File): Promise<string> {
  const { uploadUrl, publicUrl } = await fetchJson<{ uploadUrl: string; publicUrl: string }>(`${API_URL}/uploads/presigned`, {
    method: "POST",
    body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size }),
  });

  const response = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!response.ok) throw new Error("Unable to upload video file.");
  return publicUrl;
}

export async function updateVideo(id: string, input: Partial<VideoInput>): Promise<Video> {
  return fetchJson<Video>(`${API_URL}/videos/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteVideo(id: string): Promise<void> {
  await fetchJson<unknown>(`${API_URL}/videos/${id}`, { method: "DELETE" });
}

export function formatVideoStatus(status: VideoStatus): string {
  if (status === "DRAFT") return "Unpublished";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatVideoDuration(seconds?: number | null): string {
  if (!seconds) return "-";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}
