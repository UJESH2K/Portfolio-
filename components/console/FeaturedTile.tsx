// components/console/FeaturedTile.tsx
// Large hero card with the featured "Now Playing" game — gradient cover,
// title, playtime, and a CTA button. Visually dominant on the dashboard.

import { Play } from "lucide-react";
import { NOW_PLAYING } from "@/lib/data";
import { cn } from "@/lib/utils";

export function FeaturedTile({ className }: { className?: string }) {
  const featured = NOW_PLAYING[0];

  return (
    <section className={cn("px-4 sm:px-6", className)}>
      <div className="mx-auto mt-6 max-w-6xl">
        <div
          className="relative aspect-[16/6] w-full overflow-hidden rounded-2xl border border-border"
          style={{ background: featured.coverGradient }}
        >
          {/* Vignette + scanlines for "console" feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/40 to-transparent" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px)",
            }}
          />

          <div className="relative flex h-full flex-col justify-end p-6 sm:p-10">
            <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-accent-green/40 bg-bg/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-accent-green">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
              Now Playing
            </span>

            <h1 className="text-3xl font-bold text-text-primary sm:text-5xl">
              {featured.title}
            </h1>

            <div className="mt-2 flex items-center gap-3 font-mono text-xs text-text-secondary">
              <span>Playtime · {featured.hoursPlayed}h</span>
              <span>·</span>
              <span>Last played {featured.lastPlayed}</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-md bg-accent-green px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider text-bg",
                  "hover:bg-accent-green/90 focus-ring",
                )}
              >
                <Play className="h-4 w-4" fill="currentColor" />
                Resume
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-md border border-border bg-bg/60 px-4 py-2 font-mono text-sm uppercase tracking-wider text-text-primary",
                  "hover:bg-bg/80 focus-ring",
                )}
              >
                Game details
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}