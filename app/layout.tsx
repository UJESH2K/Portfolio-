import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./site.css";
import { PROFILE, SOCIALS } from "@/lib/content";

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

// Comic lettering for the landing page's balloons and captions (Bangers, OFL).
const comic = localFont({
  src: "./fonts/bangers-latin.woff2",
  weight: "400",
  variable: "--font-comic",
  display: "swap",
});

const description =
  "Ujesh Kumar Yadav — software engineer in Bengaluru building full-stack products, applied AI and distributed GPU systems. 7× hackathon winner, IMPACT-2027 paper.";

// Absolute base for Open Graph images: set NEXT_PUBLIC_SITE_URL to the real
// domain; on Vercel previews the deployment URL is used automatically.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${PROFILE.name} — Software Engineer`,
  description,
  openGraph: {
    title: `${PROFILE.name} — Software Engineer`,
    description,
    type: "website",
    images: ["/media/win-inception-1600.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PROFILE.name} — Software Engineer`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.name,
  jobTitle: PROFILE.title,
  email: `mailto:${PROFILE.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
  alumniOf: "Atria Institute of Technology",
  sameAs: SOCIALS.filter((s) => s.href.startsWith("http")).map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${mono.variable} ${comic.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
        {children}
      </body>
    </html>
  );
}
