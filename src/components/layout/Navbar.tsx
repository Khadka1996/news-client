import Link from "next/link";
import { getCategories } from "@/lib/api";

export default async function Navbar() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0 text-2xl font-extrabold tracking-tight">
          <span className="text-brand-dark">Shikka</span>{" "}
          <span className="text-brand-gold">Nepal</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
          <Link
            href="/"
            className="px-3 py-2 text-sm font-semibold text-brand-dark border-b-2 border-brand-gold"
          >
            गृहपृष्ठ
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-dark border-b-2 border-transparent hover:border-brand-gold transition-colors whitespace-nowrap"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <Link
          href="/arthatantra"
          className="hidden sm:inline-flex shrink-0 items-center rounded-full bg-brand-gold px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold-light transition-colors"
        >
          अर्थ-विशेष
        </Link>
      </div>
    </header>
  );
}
