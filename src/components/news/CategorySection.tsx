import Link from "next/link";
import { Category, Article } from "@/lib/types";
import NewsCard from "./NewsCard";

export default function CategorySection({
  category,
  articles,
}: {
  category: Category;
  articles: Article[];
}) {
  if (articles.length === 0) return null;

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-brand-dark flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
          {category.name}
        </h2>
        <Link
          href={`/${category.slug}`}
          className="text-sm font-semibold text-brand-gold hover:underline"
        >
          थप हेर्नुहोस् →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
