import { quickSummaries } from "@/data/mock";

const toneClasses: Record<string, string> = {
  positive: "border-l-emerald-500",
  neutral: "border-l-amber-500",
  negative: "border-l-red-500",
};

export default function QuickSummary() {
  return (
    <section className="rounded-2xl bg-amber-50/60 border border-amber-100 p-6">
      <h2 className="text-lg font-extrabold text-brand-dark mb-4 flex items-center gap-1.5">
        ⚡ १-मिनेट आर्थिक सार
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickSummaries.map((s, i) => (
          <div
            key={i}
            className={`bg-white rounded-lg p-4 border-l-4 shadow-sm ${toneClasses[s.tone]}`}
          >
            <span className="text-xs font-bold text-brand-gold">#{s.tag}</span>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
