// components/console/FriendsSection.tsx
// Xbox-style friends / activity feed — vertical list of friend rows with
// status dot, gamertag, and current activity.

import { FRIENDS } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { OnlineStatus } from "@/lib/types";

const STATUS_COLOR: Record<OnlineStatus, string> = {
  online: "bg-status-online",
  away: "bg-status-away",
  dnd: "bg-status-dnd",
  offline: "bg-status-offline",
};

const STATUS_LABEL: Record<OnlineStatus, string> = {
  online: "Online",
  away: "Away",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

export function FriendsSection({ className }: { className?: string }) {
  const onlineCount = FRIENDS.filter((f) => f.status === "online").length;

  return (
    <section className={cn("px-4 sm:px-6", className)}>
      <div className="mx-auto mt-8 max-w-6xl">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-text-secondary">
            Friends · Activity
          </h2>
          <span className="font-mono text-xs text-text-muted">
            {onlineCount} of {FRIENDS.length} online
          </span>
        </div>

        <ul className="overflow-hidden rounded-xl border border-border bg-surface">
          {FRIENDS.map((f, idx) => (
            <li
              key={f.gamertag}
              className={cn(
                "flex items-center gap-4 px-4 py-3",
                idx !== FRIENDS.length - 1 && "border-b border-border",
              )}
            >
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-white"
                style={{ background: f.avatarGradient }}
                aria-hidden="true"
              >
                {f.gamertag.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      STATUS_COLOR[f.status],
                    )}
                    aria-label={STATUS_LABEL[f.status]}
                  />
                  <p className="truncate font-mono text-sm font-bold text-text-primary">
                    {f.gamertag}
                  </p>
                </div>
                <p className="truncate text-xs text-text-muted">
                  {f.activity ?? STATUS_LABEL[f.status]}
                </p>
              </div>
              <span
                className={cn(
                  "hidden shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider sm:inline-block",
                  f.status === "online" &&
                    "border-status-online/40 bg-status-online/10 text-status-online",
                  f.status === "away" &&
                    "border-status-away/40 bg-status-away/10 text-status-away",
                  f.status === "dnd" &&
                    "border-status-dnd/40 bg-status-dnd/10 text-status-dnd",
                  f.status === "offline" &&
                    "border-status-offline/40 bg-status-offline/10 text-status-offline",
                )}
              >
                {STATUS_LABEL[f.status]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}