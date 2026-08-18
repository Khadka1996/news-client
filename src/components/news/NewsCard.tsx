import Link from "next/link";
import { Article } from "@/lib/types";
import { timeAgoNe } from "@/lib/format";

export default function NewsCard({ article }: { article: Article }) {
  return (
    <Link href={`/news/${article.slug}`} className="group flex flex-col">
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="font-bold text-brand-dark leading-snug line-clamp-2 group-hover:text-brand-gold transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
      <span className="text-xs text-gray-400 mt-2">{timeAgoNe(article.publishedAt)}</span>
    </Link>
  );
}
