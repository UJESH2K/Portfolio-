import type { Metadata } from "next";
import ResumeView from "@/components/studio/ResumeView";
import { RESUMES } from "@/lib/resume";
import { PROFILE } from "@/lib/content";

const title = `Résumé — ${PROFILE.name}`;
const description = `${PROFILE.name}'s résumés: software engineering, AI / ML and research. View in the browser or download the PDF.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/resume" },
  openGraph: { title, description, url: "/resume", type: "profile", images: [{ url: "/og.jpg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
};

/** /resume: every résumé on one page, opening on the general one. */
export default function ResumePage() {
  return <ResumeView initial={RESUMES[0].slug} />;
}
