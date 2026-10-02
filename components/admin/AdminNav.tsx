"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/timeline", label: "Career timeline" },
  { href: "/admin/achievements", label: "Achievements" },
  { href: "/admin/hackathons", label: "Hackathons" },
  { href: "/admin/posts", label: "Updates" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 px-5 py-4 md:px-8">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`mono text-[13px] ${
              pathname?.startsWith(l.href) ? "text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <button onClick={logout} className="mono text-[13px] text-white/50 hover:text-white">
        Log out
      </button>
    </nav>
  );
}
