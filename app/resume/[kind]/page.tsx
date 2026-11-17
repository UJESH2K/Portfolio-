import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResumeView from "@/components/studio/ResumeView";
import { RESUMES, resumeBySlug } from "@/lib/resume";
import { PROFILE } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return RESUMES.map((r) => ({ kind: r.slug }));
}

export function generateMetadata({ params }: { params: { kind: string } }): Metadata {
  const r = resumeBySlug(params.kind);
  if (!r) return {};
  const title = `${r.title} résumé — ${PROFILE.name}`;
  const description = r.about;
  const url = `/resume/${r.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "profile", images: [{ url: "/og.jpg", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
  };
}

/** /resume/<kind>: the same page, opened on one résumé — the link to send. */
export default function ResumeKindPage({ params }: { params: { kind: string } }) {
  const r = resumeBySlug(params.kind);
  if (!r) notFound();
  return <ResumeView initial={r.slug} />;
}
