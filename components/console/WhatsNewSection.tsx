// components/console/WhatsNewSection.tsx
// Horizontal scroll row of news / "what's new" cards.

import { NEWS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function WhatsNewSection({ className }: { className?: string }) {
  return (
    <section className={cn("px-4 sm:px-6", className)}>
      <div className="mx-auto mt-8 max-w-6xl">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-text-secondary">
            What&apos;s New
          </h2>
          <span className="text-xs text-text-muted">{NEWS.length} updates</span>
        </div>

        <div
          className={cn(
            "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4",
            "sm:-mx-6 sm:px-6",
          )}
        >
          {NEWS.map((n) => (
            <article
              key={n.id}
              className={cn(
                "group relative w-72 shrink-0 snap-start overflow-hidden rounded-xl border border-border",
                "transition-colors hover:border-accent-green",
              )}
            >
              <div
                className="relative h-40 w-full"
                style={{ background: n.coverGradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full border border-accent-green/40 bg-bg/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-green">
                  {n.category}
                </span>
              </div>
              <div className="bg-surface p-4">
                <h3 className="line-clamp-2 text-sm font-bold text-text-primary">
                  {n.title}
                </h3>
                <p className="mt-2 font-mono text-[11px] text-text-muted">
                  {new Date(n.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}