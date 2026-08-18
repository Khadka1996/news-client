import Link from "next/link";
import { getCategories } from "@/lib/api";

export default async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="bg-brand-dark text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="text-xl font-extrabold text-white mb-2">
            Shikka <span className="text-brand-gold">Nepal</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            नेपालको आर्थिक, वित्तीय र व्यापारिक जगतका भरपर्दो समाचार, एक ठाउँमा।
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">श्रेणीहरू</h3>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/${c.slug}`} className="hover:text-brand-gold transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">सम्पर्क</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>काठमाडौं, नेपाल</li>
            <li>info@shikkanepal.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Shikka Nepal. सर्वाधिकार सुरक्षित।
      </div>
    </footer>
  );
}
