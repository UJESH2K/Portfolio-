import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { RESUMES } from "@/lib/resume";

/** /sitemap.xml: the portfolio page and the résumé pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/resume`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...RESUMES.map((r) => ({ url: `${SITE_URL}/resume/${r.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
