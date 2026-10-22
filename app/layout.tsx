import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./site.css";
import { FAQS, PROFILE, SOCIALS, WORK } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { Analytics } from '@vercel/analytics/next';

// Three faces, one job each:
//   Cabinet Grotesk — headings (Fontshare, ITF Free Font License)
//   Geist           — body copy and UI (OFL)
//   Geist Mono      — kickers, numbers, timestamps (OFL)
const heading = localFont({
  src: [
    { path: "./fonts/cabinet-grotesk-400.woff2", weight: "400" },
    { path: "./fonts/cabinet-grotesk-500.woff2", weight: "500" },
    { path: "./fonts/cabinet-grotesk-700.woff2", weight: "700" },
  ],
  variable: "--font-heading",
  display: "swap",
});

const body = localFont({
  src: "./fonts/geist-latin.woff2",
  weight: "300 700",
  variable: "--font-body",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  weight: "400 500",
  variable: "--font-mono",
  display: "swap",
});


const description =
  "Ujesh Kumar Yadav (Ujesh, UJESH2K) is a software engineer in Bengaluru building full-stack products, applied AI and distributed GPU systems. 7× hackathon winner, IMPACT-2027 paper, internships at EaseMed and Hitachi.";

const title = `${PROFILE.name} (Ujesh) — Software Engineer, Bengaluru`;
// Link previews and search: the 1200×630 card (public/og.jpg) with his photo
// at the podium; the photo on its own stands for him in structured data.
const shareImage = { url: "/og.jpg", width: 1200, height: 630, alt: "Ujesh Kumar Yadav, software engineer, speaking at a podium" };
const portrait = "/media/life-podium-1600.webp";

export const metadata: Metadata = {
  // Always the real domain, so search engines and link previews never point
  // at a temporary Vercel deployment URL.
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: PROFILE.name,
  authors: [{ name: PROFILE.name, url: SITE_URL }],
  creator: PROFILE.name,
  keywords: [
    "Ujesh",
    "Ujesh Kumar Yadav",
    "Ujesh Yadav",
    "UJESH2K",
    "software engineer Bengaluru",
    "full-stack developer",
    "applied AI",
    "GradMesh",
    "hackathon winner",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: PROFILE.name,
    type: "profile",
    firstName: "Ujesh",
    lastName: "Yadav",
    locale: "en_IN",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage.url],
  },
  // Paste the code from Google Search Console's "HTML tag" method here
  // (or set NEXT_PUBLIC_GOOGLE_VERIFICATION) to verify the site.
  verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

// Structured data: tells search engines this site is about one person, and
// links it to the same person's GitHub, LinkedIn and Instagram.
const personLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: PROFILE.name,
      alternateName: ["Ujesh", "Ujesh Yadav", "UJESH2K"],
      givenName: "Ujesh",
      familyName: "Yadav",
      url: SITE_URL,
      image: { "@type": "ImageObject", url: `${SITE_URL}${portrait}`, width: 1254, height: 1254, caption: "Ujesh Kumar Yadav speaking at a podium" },
      jobTitle: PROFILE.title,
      description,
      email: `mailto:${PROFILE.email}`,
      address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" },
      alumniOf: { "@type": "CollegeOrUniversity", name: "Atria Institute of Technology" },
      knowsAbout: ["Full-stack development", "Applied AI", "Retrieval-augmented generation", "Distributed GPU training", "Three.js"],
      sameAs: SOCIALS.filter((s) => s.href.startsWith("http")).map((s) => s.href),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: PROFILE.name,
      alternateName: ["Ujesh", "ujesh.in"],
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profile`,
      url: SITE_URL,
      name: title,
      mainEntity: { "@id": `${SITE_URL}/#person` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}${portrait}` },
      image: `${SITE_URL}${shareImage.url}`,
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#projects`,
      name: "Projects by Ujesh Kumar Yadav",
      itemListElement: WORK.filter((w) => w.featured).map((w, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: w.title,
          description: w.headline,
          creator: { "@id": `${SITE_URL}/#person` },
          ...(w.image ? { image: `${SITE_URL}${w.image}-1600.webp` } : {}),
          ...(w.live || w.code ? { url: w.live ?? w.code } : {}),
        },
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
