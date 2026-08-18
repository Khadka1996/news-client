import Hero from "@/components/home/Hero";
import QuickSummary from "@/components/home/QuickSummary";
import CategorySection from "@/components/news/CategorySection";
import { getCategories, getNews } from "@/lib/api";

export default async function Home() {
  const categories = await getCategories();

  // Categories are created dynamically on the backend — the homepage doesn't
  // hardcode which ones exist, it just renders a section for each one that
  // currently has published news.
  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      articles: await getNews({ category: category.slug, limit: 3 }),
    }))
  );

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <Hero />

      <div className="mt-8 mb-14">
        <QuickSummary />
      </div>

      {sections.map(({ category, articles }) => (
        <CategorySection key={category.id} category={category} articles={articles} />
      ))}
    </main>
  );
}
