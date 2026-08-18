import Link from "next/link";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-brand-gold">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-neutral-600" : "text-neutral-500"}>{item.label}</span>
            )}
            {!isLast && <span className="text-neutral-300">/</span>}
          </div>
        );
      })}
    </div>
  );
}
