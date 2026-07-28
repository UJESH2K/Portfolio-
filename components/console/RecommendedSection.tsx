// components/console/RecommendedSection.tsx
// Steam Deck-style store section — two horizontal scrollable rows:
//   1. Recommended new releases (with ₹ prices and tags)
//   2. Top sellers (compact row)

import { STORE_RECOMMENDED, STORE_TOP_SELLERS } from "@/lib/data";
import { cn, formatINR } from "@/lib/utils";
import type { StoreTag } from "@/lib/types";

const TAG_STYLES: Record<StoreTag, string> = {
  NEW: "bg-accent-blue text-white",
  SALE: "bg-status-dnd text-white",
  TOP: "bg-accent-orange text-bg",
  UPCOMING: "bg-accent-purple text-white",
};

export function RecommendedSection({ className }: { className?: string }) {
  return (
    <section className={cn("px-4 sm:px-6", className)}>
      <div className="mx-auto mt-8 max-w-6xl">
        <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-text-secondary">
          Recommended · Store
        </h2>

        {/* Recommended row */}
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-text-primary">
            New releases — based on what you&apos;ve been playing
          </h3>
          <div
            className={cn(
              "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4",
              "sm:-mx-6 sm:px-6",
            )}
          >
            {STORE_RECOMMENDED.map((item) => (
              <StoreTile key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Top sellers row */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-text-primary">
            Top sellers
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {STORE_TOP_SELLERS.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border bg-surface p-3",
                  "transition-colors hover:border-accent-green",
                )}
              >
                <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold text-white"
                  style={{ background: item.coverGradient }}
                  aria-hidden="true"
                >
                  {item.title.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text-primary">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {item.publisher}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {item.tag && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                        TAG_STYLES[item.tag],
                      )}
                    >
                      {item.tag}
                    </span>
                  )}
                  <span className="font-mono text-xs text-text-primary">
                    {item.priceINR === 0 ? "Free to play" : formatINR(item.priceINR)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────

function StoreTile({
  item,
}: {
  item: (typeof STORE_RECOMMENDED)[number];
}) {
  return (
    <article
      className={cn(
        "group relative w-56 shrink-0 snap-start overflow-hidden rounded-xl border border-border",
        "transition-colors hover:border-accent-green",
      )}
    >
      <div
        className="relative flex h-44 w-full items-center justify-center"
        style={{ background: item.coverGradient }}
      >
        <span className="font-mono text-3xl font-bold text-white/90">
          {item.title.slice(0, 2).toUpperCase()}
        </span>
        {item.tag && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
              TAG_STYLES[item.tag],
            )}
          >
            {item.tag}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
      </div>
      <div className="bg-surface p-3">
        <p className="truncate text-sm font-bold text-text-primary">{item.title}</p>
        <p className="truncate text-xs text-text-muted">{item.publisher}</p>
        <p className="mt-1 font-mono text-xs text-accent-green">
          {item.priceINR === 0 ? "Free to play" : formatINR(item.priceINR)}
        </p>
      </div>
    </article>
  );
}