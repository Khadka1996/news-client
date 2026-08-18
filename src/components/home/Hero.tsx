import Link from "next/link";
import { getNews } from "@/lib/api";
import { timeAgoNe } from "@/lib/format";
import NewsCardSmall from "@/components/news/NewsCardSmall";

export default async function Hero() {
  const [breakingList, latest] = await Promise.all([
    getNews({ breaking: true, limit: 1 }),
    getNews({ limit: 6 }),
  ]);

  const breaking = breakingList[0] ?? latest[0];
  // Latest rail excludes whatever is already shown as the breaking story
  const latestRail = latest.filter((a) => a.id !== breaking?.id).slice(0, 5);

  if (!breaking) return null;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Breaking news — left, spans 2 columns */}
      <Link
        href={`/news/${breaking.slug}`}
        className="lg:col-span-2 group relative rounded-2xl overflow-hidden bg-brand-dark min-h-[420px] flex flex-col justify-end"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={breaking.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
        <div className="relative p-6 sm:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white mb-4 animate-pulse">
            🔴 ब्रेकिङ
          </span>
          {breaking.category && (
            <span
              className="inline-block ml-2 rounded-full px-3 py-1 text-xs font-bold text-white mb-4"
              style={{ backgroundColor: breaking.category.color }}
            >
              {breaking.category.name}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug mb-3 group-hover:text-brand-gold-light transition-colors">
            {breaking.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span>🕐 {timeAgoNe(breaking.publishedAt)}</span>
            <span>✍️ {breaking.author}</span>
          </div>
        </div>
      </Link>

      {/* Latest news — right rail */}
      <aside className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-extrabold text-brand-dark flex items-center gap-1.5">
            ⚡ ताजा समाचार
          </h2>
        </div>
        <div className="flex-1">
          {latestRail.map((article) => (
            <NewsCardSmall key={article.id} article={article} />
          ))}
        </div>
        <Link
          href="/latest"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold font-semibold text-sm py-2.5 hover:bg-brand-gold hover:text-white transition-colors"
        >
          थप समाचार हेर्नुहोस्
        </Link>
      </aside>
    </section>
  );
}
