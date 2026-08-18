"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Article } from "@/lib/types";

const statusColors: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    api.getNews().then((data) => {
      setNews(data);
      setLoading(false);
    });
  }, []);

  async function setStatus(id: string, status: Article["status"]) {
    await Promise.resolve();
    setNews((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  async function remove(id: string) {
    if (!confirm("यो समाचार मेटाउने पक्का हो?")) return;
    setNews((items) => items.filter((item) => item.id !== id));
  }

  const filtered = filter === "all" ? news : news.filter((n) => n.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand-dark">समाचारहरू</h1>
        <Link
          href="/dashboard/admin/news/new"
          className="rounded-lg bg-brand-gold text-white text-sm font-semibold px-4 py-2 hover:bg-brand-gold-light"
        >
          + नयाँ समाचार
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'published', 'pending', 'draft', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              filter === s ? "bg-brand-dark text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">लोड हुँदैछ...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">शीर्षक</th>
                <th className="px-4 py-3 font-medium">श्रेणी</th>
                <th className="px-4 py-3 font-medium">स्थिति</th>
                <th className="px-4 py-3 font-medium text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((n) => (
                <tr key={n.id}>
                  <td className="px-4 py-3 max-w-xs truncate">{n.title}</td>
                  <td className="px-4 py-3 text-gray-500">{n.category?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[n.status]}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    {n.status !== "published" && (
                      <button
                        onClick={() => setStatus(n.id, "published")}
                        className="text-emerald-600 hover:underline text-xs font-semibold"
                      >
                        प्रकाशित गर्नुहोस्
                      </button>
                    )}
                    <button
                      onClick={() => remove(n.id)}
                      className="text-red-600 hover:underline text-xs font-semibold"
                    >
                      मेटाउनुहोस्
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    कुनै समाचार भेटिएन
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
