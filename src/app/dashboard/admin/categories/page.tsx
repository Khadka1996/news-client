"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";

const swatches = ["#0ea5e9", "#2563eb", "#16a34a", "#9333ea", "#d97706", "#dc2626", "#0891b2", "#65a30d"];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState(swatches[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    try {
      const created = { id: `${Date.now()}`, slug: name.toLowerCase().replace(/\s+/g, "-"), name, color, order: categories.length + 1 };
      setCategories((items) => [created, ...items]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "समस्या भयो");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("यो श्रेणी मेटाउने पक्का हो?")) return;
    setCategories((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-brand-dark mb-1">श्रेणीहरू</h1>
      <p className="text-sm text-gray-500 mb-6">
        समाचार पोर्टलका श्रेणीहरू (जस्तै सेयर बजार, बैंक/बीमा) यहाँबाट थप्न वा हटाउन सकिन्छ। नयाँ श्रेणी थपेपछि यो
        फ्रन्टेन्डको मेनुमा र होमपेजमा स्वतः देखा पर्नेछ।
      </p>

      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <h2 className="font-bold text-brand-dark mb-3 text-sm">नयाँ श्रेणी थप्नुहोस्</h2>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="श्रेणीको नाम (जस्तै: कृषि)"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-gold text-white font-semibold px-4 py-2 text-sm hover:bg-brand-gold-light"
          >
            थप्नुहोस्
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          {swatches.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setColor(s)}
              className="w-6 h-6 rounded-full border-2"
              style={{ backgroundColor: s, borderColor: color === s ? "#111" : "transparent" }}
            />
          ))}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500">लोड हुँदैछ...</p>
      ) : (
        <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-5 py-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
                <span className="text-xs text-gray-400">/{c.slug}</span>
              </span>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                मेटाउनुहोस्
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
