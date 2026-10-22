import type { Metadata } from "next";

/** The site editor is private: keep it out of search results. */
export const metadata: Metadata = {
  title: "Edit the site",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function EditRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f2f0ea] text-[#0d0d0d]">{children}</div>;
}
