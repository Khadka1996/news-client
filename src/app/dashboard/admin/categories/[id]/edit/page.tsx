"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchAdminCategories, updateCategory, type AdminCategory, type CategoryInput } from "@/lib/categories";
import { CategoryForm } from "@/app/dashboard/admin/categories/new/page";

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<CategoryInput | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchAdminCategories(1, 100).then((payload) => {
      const target = payload.categories.find((item) => item.id === String(params?.id || ""));
      if (!target) { setError("Category not found."); return; }
      setCategory(target);
      setForm({ name: target.name, slug: target.slug, description: target.description || "", color: target.color || "#358CBD", order: target.order, isActive: target.isActive });
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load category."));
  }, [params?.id]);

  const update = <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) => setForm((current) => current ? { ...current, [key]: value } : current);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category || !form) return;
    try { setSaving(true); await updateCategory(category.id, { ...form, name: form.name.trim(), slug: form.slug?.trim(), description: form.description?.trim() || undefined }); router.push("/dashboard/admin/categories"); }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Unable to update category."); }
    finally { setSaving(false); }
  };
  if (!form) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error || "Loading category..."}</div>;
  return <CategoryForm title="Edit Category" form={form} error={error} saving={saving} update={update} onSubmit={submit} onBack={() => router.push("/dashboard/admin/categories")} submitLabel="Save changes" />;
}
