// components/console/ConsoleLegend.tsx
// Bottom-of-page button-prompt legend in the Xbox/PS5 style:
// Xbox button = MENU, A button = SELECT, B button = BACK.

import { cn } from "@/lib/utils";

export function ConsoleLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border bg-surface/80 px-6 py-3 text-sm text-text-secondary backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-accent-green text-bg">
          {/* Xbox-style menu glyph */}
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
            <circle cx="8" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
        <span className="font-medium uppercase tracking-wider text-text-primary">Menu</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-green text-bg">
            <span className="font-mono text-xs font-bold">A</span>
          </span>
          <span className="uppercase tracking-wider">Select</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-status-dnd text-bg">
            <span className="font-mono text-xs font-bold">B</span>
          </span>
          <span className="uppercase tracking-wider">Back</span>
        </div>
      </div>
    </div>
  );
}