import { ticker } from "@/data/mock";

export default function Ticker() {
  const items = [...ticker, ...ticker]; // duplicate for seamless marquee loop

  return (
    <div className="bg-brand-dark text-white text-sm overflow-hidden whitespace-nowrap">
      <div className="max-w-7xl mx-auto flex items-center px-4 lg:px-8">
        <div className="animate-marquee py-2 gap-8 flex">
          {items.map((t, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <strong className="font-semibold">{t.label}:</strong>
              <span>{t.value}</span>
              {t.change && (
                <span className={t.positive ? "text-emerald-400" : "text-red-400"}>
                  ({t.change})
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
