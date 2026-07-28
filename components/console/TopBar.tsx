// components/console/TopBar.tsx
// Sticky top status bar: search · settings · wifi · battery · time · avatar.
// Visual-only for v1 — no interactivity (per "no animations" spec).

import { Battery, Search, Settings, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopBar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg/85 px-4 backdrop-blur",
        className,
      )}
    >
      {/* Left — brand */}
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent-green text-bg">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2 4 6v12l8 4 8-4V6l-8-4Zm0 2.4 5.5 2.75v9.7L12 19.6 6.5 16.85v-9.7L12 4.4Z"
            />
          </svg>
        </span>
        <span className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-text-primary">
          Console
        </span>
      </div>

      {/* Right — status icons */}
      <div className="flex items-center gap-3 text-text-secondary">
        <button className="rounded-md p-2 hover:bg-surface-2 hover:text-text-primary focus-ring">
          <Search className="h-4 w-4" aria-label="Search" />
        </button>
        <button className="rounded-md p-2 hover:bg-surface-2 hover:text-text-primary focus-ring">
          <Settings className="h-4 w-4" aria-label="Settings" />
        </button>
        <Wifi className="h-4 w-4" aria-label="Network status" />
        <Battery className="h-4 w-4" aria-label="Battery" />
        <span className="font-mono text-xs text-text-primary">20:46</span>
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-blue font-mono text-[10px] font-bold text-white"
          aria-label="Profile avatar"
        >
          CA
        </span>
      </div>
    </header>
  );
}