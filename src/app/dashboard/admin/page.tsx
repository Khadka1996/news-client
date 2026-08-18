"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNews, getCategories } from "@/lib/api";
import { Article, Category } from "@/lib/types";

export default function AdminDashboardPage() {
  const [news, setNews] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getNews(), getCategories()])
      .then(([n, c]) => {
        setNews(n);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const published = news.filter((n) => n.status === "published").length;
  const pending = news.filter((n) => n.status === "pending").length;

  const stats = [
    { label: "कुल समाचार", value: news.length, icon: "📰" },
    { label: "प्रकाशित", value: published, icon: "✅" },
    { label: "समीक्षा बाँकी", value: pending, icon: "🕐" },
    { label: "श्रेणीहरू", value: categories.length, icon: "🗂️" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Dashboard</h1>

      {loading ? (
        <p className="text-gray-500">लोड हुँदैछ...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-extrabold text-brand-dark">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {pending > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center justify-between">
              <p className="text-sm text-amber-800">
                <strong>{pending}</strong> समाचार समीक्षाको प्रतीक्षामा छन्।
              </p>
              <Link href="/dashboard/admin/news" className="text-sm font-semibold text-amber-800 underline">
                हेर्नुहोस् →
              </Link>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-bold text-brand-dark mb-3">भर्खरका समाचार</h2>
            <ul className="divide-y divide-gray-100">
              {news.slice(0, 5).map((n) => (
                <li key={n.id} className="py-2 text-sm flex items-center justify-between gap-3">
                  <span className="truncate">{n.title}</span>
                  <span className="text-xs shrink-0 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {n.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
