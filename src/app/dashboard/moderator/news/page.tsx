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

// Moderators get a read-only view of all news posts — they can only act on
// the ones still pending, via the review flow. No create/edit/delete here,
// that's admin-only.
export default function ModeratorNewsPage() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.getNews().then((data) => {
      setNews(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "all" ? news : news.filter((n) => n.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-1">News</h1>
      <p className="text-sm text-neutral-500 mb-6">सबै समाचारहरूको सूची (हेर्ने मात्र — प्रकाशन Review बाट गर्नुहोस्)</p>

      <div className="flex gap-2 mb-4">
        {["all", "published", "pending", "draft", "rejected"].map((s) => (
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
        <p className="text-neutral-500">लोड हुँदैछ...</p>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">शीर्षक</th>
                <th className="px-4 py-3 font-medium">श्रेणी</th>
                <th className="px-4 py-3 font-medium">स्थिति</th>
                <th className="px-4 py-3 font-medium text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((n) => (
                <tr key={n.id}>
                  <td className="px-4 py-3 max-w-xs truncate">{n.title}</td>
                  <td className="px-4 py-3 text-neutral-500">{n.category?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[n.status]}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {n.status === "pending" ? (
                      <Link
                        href={`/dashboard/moderator/review/${n.id}`}
                        className="text-brand-gold hover:underline text-xs font-semibold"
                      >
                        Review →
                      </Link>
                    ) : (
                      <span className="text-xs text-neutral-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
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
