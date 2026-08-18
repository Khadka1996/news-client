import { notFound } from "next/navigation";
import { getCategories, getNews } from "@/lib/api";
import NewsCard from "@/components/news/NewsCard";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) notFound();

  const articles = await getNews({ category: slug, limit: 30 });

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-8">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
        <h1 className="text-2xl font-extrabold text-brand-dark">{category.name}</h1>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-500">यस श्रेणीमा हाल कुनै समाचार छैन।</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </main>
  );
}
