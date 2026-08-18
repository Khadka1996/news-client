import Link from "next/link";
import { Article } from "@/lib/types";
import { timeAgoNe } from "@/lib/format";

export default function NewsCardSmall({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="flex gap-3 group py-3 first:pt-0 border-b border-gray-100 last:border-0"
    >
      <div className="relative w-20 h-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="min-w-0">
        {article.category && (
          <span className="text-[11px] font-semibold" style={{ color: article.category.color }}>
            {article.category.name}
          </span>
        )}
        <h4 className="text-sm font-semibold text-brand-dark leading-snug line-clamp-2 group-hover:text-brand-gold transition-colors">
          {article.title}
        </h4>
        <span className="text-[11px] text-gray-400">{timeAgoNe(article.publishedAt)}</span>
      </div>
    </Link>
  );
}
