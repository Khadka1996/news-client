"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Article } from "@/lib/types";

export default function ModeratorReviewPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) return;
    api.getNews().then((data) => {
      const match = data.find((item) => item.id === articleId);
      setArticle(match || null);
      setLoading(false);
    });
  }, [articleId]);

  async function decide(status: "published" | "rejected") {
    if (!article) return;
    setLoading(true);
    setArticle((prev) => (prev ? { ...prev, status } : prev));
    router.push("/dashboard/moderator");
  }

  if (loading) {
    return <p className="text-gray-500">लोड हुँदैछ...</p>;
  }

  if (!article) {
    return <p className="text-gray-500">समाचार भेटिएन</p>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold mb-2">
          {article.category?.name}
        </p>
        <h1 className="text-3xl font-extrabold text-brand-dark mb-2">{article.title}</h1>
        <p className="text-sm text-gray-500">लेखक: {article.author}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
        <img src={article.image} alt={article.title} className="w-full h-72 object-cover rounded-lg mb-5" />
        <p className="text-gray-700 whitespace-pre-line">{article.content}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => decide("published")}
          className="rounded-lg bg-brand-dark text-white font-semibold px-5 py-2.5 hover:bg-brand-dark/90"
        >
          प्रकाशित गर्नुहोस्
        </button>
        <button
          onClick={() => decide("rejected")}
          className="rounded-lg border border-red-200 bg-red-50 text-red-700 font-semibold px-5 py-2.5 hover:bg-red-100"
        >
          अस्वीकार गर्नुहोस्
        </button>
      </div>
    </div>
  );
}
