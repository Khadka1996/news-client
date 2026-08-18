import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug } from "@/lib/api";
import { timeAgoNe } from "@/lib/format";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
      {article.category && (
        <Link
          href={`/${article.category.slug}`}
          className="text-sm font-bold"
          style={{ color: article.category.color }}
        >
          {article.category.name}
        </Link>
      )}
      <h1 className="text-3xl font-extrabold text-brand-dark leading-snug mt-2 mb-4">
        {article.title}
      </h1>
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
        <span>✍️ {article.author}</span>
        <span>🕐 {timeAgoNe(article.publishedAt)}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={article.image}
        alt=""
        className="w-full aspect-video object-cover rounded-2xl mb-8"
      />
      <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
        {article.content}
      </p>
    </main>
  );
}
