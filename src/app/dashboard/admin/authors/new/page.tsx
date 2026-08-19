"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { createAuthor, uploadAuthorPhoto, type AuthorInput } from "@/lib/authors";

export default function NewAuthorPage() {
  const router = useRouter();
  const [form, setForm] = useState<AuthorInput>({ name: "", bio: "", avatar: "", isActive: true });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const update = (key: keyof AuthorInput, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const handlePhoto = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setError(""); setPhotoFile(file); update("avatar", URL.createObjectURL(file));
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    if (!form.name.trim()) { setError("Author name is required."); return; }
    try { setSaving(true); const avatar = form.avatar ? (photoFile ? await uploadAuthorPhoto(photoFile) : form.avatar) : undefined; await createAuthor({ ...form, name: form.name.trim(), bio: form.bio?.trim() || undefined, avatar }); router.push("/dashboard/admin/authors"); }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Unable to create author."); }
    finally { setSaving(false); }
  };
  return <div className="space-y-6"><div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400"><Link href="/dashboard/admin" className="hover:text-brand-gold">Dashboard</Link><span>/</span><Link href="/dashboard/admin/authors" className="hover:text-brand-gold">Authors</Link><span>/</span><span className="text-neutral-600">Add Author</span></div><div className="flex items-center justify-between gap-4"><div><h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">Add Author</h1><p className="mt-2 text-sm text-neutral-500">Create an author profile for your newsroom.</p></div><button type="button" onClick={() => router.push("/dashboard/admin/authors")} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700"><ArrowLeft className="h-4 w-4" /> Back</button></div>{error && <StatusMessage type="error" message={error} />}<form onSubmit={submit} className="rounded-2xl border border-neutral-200 bg-white p-6"><h2 className="mb-5 text-lg font-bold text-neutral-900">Author details</h2><div className="grid gap-5 lg:grid-cols-2"><Field label="Name*" value={form.name} onChange={(value) => update("name", value)} placeholder="e.g. Aarav Shrestha" /><ImageUpload value={form.avatar} uploading={uploading} onUpload={handlePhoto} onRemove={() => update("avatar", "")} /><div className="lg:col-span-2"><label className="mb-1 block text-sm font-medium text-neutral-700">Bio</label><textarea value={form.bio || ""} onChange={(event) => update("bio", event.target.value)} rows={5} placeholder="Short author biography" className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" /></div></div><div className="mt-6 flex justify-end"><button type="submit" disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-light disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving..." : "Create Author"}</button></div></form></div>;
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) { return <div><label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" /></div>; }
