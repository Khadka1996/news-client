"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNews } from "@/lib/api";
import { Article } from "@/lib/types";

export default function ModeratorDashboardPage() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews({ category: undefined }).then((data) => {
      setNews(data);
      setLoading(false);
    });
  }, []);

  const pending = news.filter((a) => a.status === "pending");
  const published = news.filter((a) => a.status === "published").length;
  const rejected = news.filter((a) => a.status === "rejected").length;

  const stats = [
    { label: "समीक्षा बाँकी", value: pending.length, icon: "🕐" },
    { label: "प्रकाशित", value: published, icon: "✅" },
    { label: "अस्वीकृत", value: rejected, icon: "🚫" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-1">Dashboard</h1>
      <p className="text-sm text-neutral-500 mb-6">प्रकाशनको प्रतीक्षामा रहेका समाचारहरू।</p>

      {loading ? (
        <p className="text-neutral-500">लोड हुँदैछ...</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-extrabold text-brand-dark">{s.value}</div>
                <div className="text-sm text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>

          {pending.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center text-neutral-400 shadow-sm">
              🎉 अहिले समीक्षा गर्नुपर्ने कुनै समाचार छैन
            </div>
          ) : (
            <ul className="space-y-3">
              {pending.map((article) => (
                <li
                  key={article.id}
                  className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-4 shadow-sm"
                >
                  <img
                    src={article.image}
                    alt=""
                    className="w-20 h-16 object-cover rounded-lg shrink-0 bg-neutral-100"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-brand-gold">{article.category?.name}</span>
                    <h3 className="font-semibold text-brand-dark truncate">{article.title}</h3>
                    <span className="text-xs text-neutral-400">{article.author}</span>
                  </div>
                  <Link
                    href={`/dashboard/moderator/review/${article.id}`}
                    className="shrink-0 rounded-lg bg-brand-dark text-white text-sm font-semibold px-4 py-2 hover:bg-brand-dark/90"
                  >
                    समीक्षा गर्नुहोस्
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
