import type { Metadata } from "next";

/** The admin console is private: keep it out of search results. */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return children;
}
