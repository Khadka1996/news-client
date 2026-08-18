"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  AlignLeft,
  List,
  ListOrdered,
  Quote,
  Link2,
  ImageIcon,
  UploadCloud,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";

const toolbarButtons = [Bold, Italic, Underline, Strikethrough, Code, AlignLeft, List, ListOrdered, Quote, Link2, ImageIcon];

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    categoryId: "",
    image: "",
    author: "",
    status: "draft" as "draft" | "pending" | "published",
    breaking: false,
    featured: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      setForm((f) => ({ ...f, categoryId: cats[0]?.id || "" }));
    });
  }, []);

  function addTag() {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((tag) => tag !== t));
  }

  async function handleSubmit(status: "draft" | "pending" | "published") {
    setError("");
    if (!form.title || !form.categoryId) {
      setError("शीर्षक र श्रेणी आवश्यक छ");
      return;
    }
    setSaving(true);
    try {
      const created = {
        ...form,
        status,
        id: `${Date.now()}`,
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        tags,
      };
      console.log("new article", created);
      router.push("/dashboard/admin/news");
    } catch (err) {
      setError(err instanceof Error ? err.message : "समस्या भयो");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <p className="text-xs text-neutral-400 mb-1">
        <Link href="/dashboard/admin" className="hover:underline">
          Dashboard
        </Link>{" "}
        / <Link href="/dashboard/admin/news" className="hover:underline">All Blogs</Link> /{" "}
        <span className="text-neutral-600 font-medium">Add Blog</span>
      </p>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Add Blog</h1>
          <p className="text-sm text-neutral-500">Create and publish a new news story</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleSubmit("draft")}
            disabled={saving}
            className="rounded-lg border border-neutral-300 bg-white text-sm font-semibold px-4 py-2.5 hover:bg-neutral-50 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="rounded-lg border border-neutral-300 bg-white text-sm font-semibold px-4 py-2.5 hover:bg-neutral-50"
          >
            Preview
          </button>
          <button
            onClick={() => handleSubmit("pending")}
            disabled={saving}
            className="rounded-lg bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 hover:bg-brand-dark/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "+ Publish"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main column */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
              Blog Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter blog title..."
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">Sub title</label>
            <input
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Enter sub title..."
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-neutral-800">
                Content <span className="text-red-500">*</span>
              </label>
              <span className="text-xs font-medium text-brand-gold">✨ Copy-writing tips</span>
            </div>
            <div className="rounded-lg border border-neutral-300 overflow-hidden">
              <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
                {toolbarButtons.map((Icon, i) => (
                  <button
                    key={i}
                    type="button"
                    className="p-1.5 rounded hover:bg-neutral-200 text-neutral-600"
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                placeholder="Write something amazing..."
                className="w-full px-3 py-3 text-sm focus:outline-none resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">Author</label>
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="न्युजरूम"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.breaking}
                onChange={(e) => setForm({ ...form, breaking: e.target.checked })}
              />
              ब्रेकिङ न्यूज
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              फिचर्ड
            </label>
          </div>
        </div>

        {/* Publish Settings sidebar */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 space-y-5">
          <h2 className="font-bold text-brand-dark">Publish Settings</h2>

          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
              Select Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending review</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type a tag and press add..."
                className="flex-1 min-w-0 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-lg bg-brand-dark text-white text-sm font-semibold px-3 py-2 hover:bg-brand-dark/90"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-brand-gold text-xs font-medium px-2.5 py-1"
                  >
                    {t}
                    <button type="button" onClick={() => removeTag(t)}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
              Photos <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mb-3 text-sm">
              <label className="flex items-center gap-1.5">
                <input type="radio" name="photoSource" defaultChecked /> Upload from Local Drive
              </label>
              <label className="flex items-center gap-1.5">
                <input type="radio" name="photoSource" /> Add from Gallery
              </label>
            </div>
            <div className="rounded-lg border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                <UploadCloud size={18} className="text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-600">Drag & drop Image here</p>
              <p className="text-xs text-neutral-400 mb-3">Or</p>
              <label className="cursor-pointer rounded-lg bg-brand-dark text-white text-xs font-semibold px-4 py-2 hover:bg-brand-dark/90">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm((f) => ({ ...f, image: URL.createObjectURL(file) }));
                  }}
                />
              </label>
            </div>
            {form.image && (
              <img src={form.image} alt="" className="mt-3 w-full h-32 object-cover rounded-lg" />
            )}
          </div>

          <p className="text-xs text-neutral-400 pt-1 border-t border-neutral-100">
            एड्मिनद्वारा बनाइएको समाचार तुरुन्तै प्रकाशित हुन्छ। मोडरेटरद्वारा बनाइएको समाचार समीक्षाको लागि पेन्डिङमा जान्छ।
          </p>
        </div>
      </div>
    </div>
  );
}
