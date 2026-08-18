"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Eye, Newspaper, Users2 } from "lucide-react";
import { api } from "@/lib/api";
import { Article, Category } from "@/lib/types";

export default function AnalyticsPage() {
  const [news, setNews] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getNews(), api.getCategories()]).then(([n, c]) => {
      setNews(n);
      setCategories(c);
      setLoading(false);
    });
  }, []);

  const totalViews = news.reduce((sum, n) => sum + n.views, 0);
  const topArticles = [...news].sort((a, b) => b.views - a.views).slice(0, 6);
  const byCategory = categories
    .map((c) => ({
      category: c,
      views: news.filter((n) => n.categoryId === c.id).reduce((sum, n) => sum + n.views, 0),
    }))
    .sort((a, b) => b.views - a.views);
  const maxCategoryViews = Math.max(1, ...byCategory.map((b) => b.views));

  const stats = [
    { label: "कुल भ्यूज", value: totalViews.toLocaleString(), icon: Eye },
    { label: "कुल समाचार", value: news.length, icon: Newspaper },
    { label: "औसत भ्यूज / समाचार", value: news.length ? Math.round(totalViews / news.length).toLocaleString() : 0, icon: TrendingUp },
    { label: "सक्रिय लेखकहरू", value: new Set(news.map((n) => n.author)).size, icon: Users2 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-1">Analytics</h1>
      <p className="text-sm text-neutral-500 mb-6">साइटको ट्राफिक र engagement अवलोकन</p>

      {loading ? (
        <p className="text-neutral-500">लोड हुँदैछ...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-brand-gold flex items-center justify-center mb-2">
                  <s.icon size={17} />
                </div>
                <div className="text-2xl font-extrabold text-brand-dark">{s.value}</div>
                <div className="text-sm text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
              <h2 className="font-bold text-brand-dark mb-4 text-sm">श्रेणी अनुसार भ्यूज</h2>
              <div className="space-y-3">
                {byCategory.map((b) => (
                  <div key={b.category.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-neutral-700">{b.category.name}</span>
                      <span className="text-neutral-400">{b.views.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(b.views / maxCategoryViews) * 100}%`, backgroundColor: b.category.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
              <h2 className="font-bold text-brand-dark mb-4 text-sm">टप समाचार</h2>
              <ul className="divide-y divide-neutral-100">
                {topArticles.map((a, i) => (
                  <li key={a.id} className="py-2.5 flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-300 w-4">{i + 1}</span>
                    <span className="flex-1 text-sm truncate text-neutral-700">{a.title}</span>
                    <span className="text-xs font-semibold text-neutral-400 shrink-0">{a.views.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
