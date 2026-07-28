// components/console/SocialFooter.tsx
// Grid of social / contact icon tiles (LinkedIn, GitHub, CF, CC, LC,
// Steam, email, phone, resume). Each tile is a hover-able icon with label.

import {
  Code2,
  FileText,
  Github,
  Linkedin,
  Mail,
  Phone,
  Twitter,
} from "lucide-react";
import { SOCIALS } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { SocialPlatform } from "@/lib/types";

const ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  codeforces: Code2,
  codechef: Code2,
  leetcode: Code2,
  steam: Code2,
  email: Mail,
  phone: Phone,
  resume: FileText,
};

interface SocialFooterProps {
  className?: string;
}

export function SocialFooter({ className }: SocialFooterProps) {
  return (
    <section
      className={cn(
        "border-t border-border bg-surface px-4 py-8 sm:px-6",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.3em] text-text-secondary">
          Connect
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          Every platform I&apos;m on. Drop a mail, fork a repo, or grab my resume.
        </p>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {SOCIALS.map((s) => {
            const Icon = ICONS[s.platform];
            const isResume = s.platform === "resume";
            return (
              <li key={s.id}>
                <a
                  href={s.href}
                  target={isResume ? "_blank" : undefined}
                  rel={isResume ? "noopener noreferrer" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3",
                    "transition-colors hover:border-accent-green hover:bg-surface-2/80",
                    "focus-ring",
                  )}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-bg text-accent-green group-hover:bg-accent-green group-hover:text-bg">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-text-primary">{s.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 font-mono text-[11px] text-text-muted">
          © {new Date().getFullYear()} — Built like a console. Press A to continue.
        </p>
      </div>
    </section>
  );
}