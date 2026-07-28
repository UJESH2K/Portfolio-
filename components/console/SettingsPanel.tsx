// components/console/SettingsPanel.tsx
// Xbox-style settings tile: profile, online status, DND toggle (visual),
// friend code, account. Pure visual — no state mutations in v1.

import { BellOff, Hash, Shield, User } from "lucide-react";
import { PROFILE, SETTINGS } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { OnlineStatus } from "@/lib/types";

const STATUS_LABELS: Record<OnlineStatus, string> = {
  online: "Online",
  away: "Away",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

const STATUS_COLOR: Record<OnlineStatus, string> = {
  online: "bg-status-online",
  away: "bg-status-away",
  dnd: "bg-status-dnd",
  offline: "bg-status-offline",
};

export function SettingsPanel({ className }: { className?: string }) {
  return (
    <section className={cn("px-4 sm:px-6", className)}>
      <div className="mx-auto mt-8 max-w-6xl">
        <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-text-secondary">
          Settings
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Profile card */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start gap-4">
              <span
                className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-blue font-mono text-lg font-bold text-white"
                aria-hidden="true"
              >
                {PROFILE.realName.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-mono text-lg font-bold text-text-primary">
                    {PROFILE.gamertag}
                  </h3>
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      STATUS_COLOR[PROFILE.status],
                    )}
                    aria-label={STATUS_LABELS[PROFILE.status]}
                  />
                </div>
                <p className="truncate text-sm text-text-secondary">
                  {PROFILE.realName}
                </p>
                <p className="mt-1 text-xs text-text-muted">{PROFILE.bio}</p>
              </div>
              <button className="rounded-md border border-border bg-bg/60 px-3 py-1.5 text-xs uppercase tracking-wider text-text-primary hover:bg-bg/80 focus-ring">
                View
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <SettingRow
              icon={<User className="h-4 w-4" />}
              title="Your Status"
              subtext="How you appear to other people"
              value={STATUS_LABELS[SETTINGS.status]}
            />
            <SettingRow
              icon={<BellOff className="h-4 w-4" />}
              title="Do Not Disturb"
              subtext="Disables all chat notifications"
              value={SETTINGS.dnd ? "On" : "Off"}
              toggle={!SETTINGS.dnd}
            />
            <SettingRow
              icon={<Hash className="h-4 w-4" />}
              title="Friend Code"
              subtext="Share to receive invites"
              value={SETTINGS.friendCode}
            />
            <SettingRow
              icon={<Shield className="h-4 w-4" />}
              title="Account"
              subtext="Privacy, security, devices"
              value={SETTINGS.account}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────

function SettingRow({
  icon,
  title,
  subtext,
  value,
  toggle,
}: {
  icon: React.ReactNode;
  title: string;
  subtext: string;
  value: string;
  toggle?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 text-accent-green">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">{title}</p>
          <p className="text-xs text-text-muted">{subtext}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-xs text-text-secondary">{value}</span>
        {toggle !== undefined && (
          <span
            className={cn(
              "relative inline-flex h-5 w-9 items-center rounded-full",
              toggle ? "bg-accent-green" : "bg-surface-2",
            )}
            aria-hidden="true"
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-bg transition-transform",
                toggle ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </span>
        )}
      </div>
    </div>
  );
}