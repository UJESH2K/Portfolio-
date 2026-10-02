import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono, Instrument_Serif, Jost } from "next/font/google";
import "./globals.css";
import { PROFILE } from "@/lib/content";
import SmoothScroll from "@/components/site/SmoothScroll";

// A small, deliberate type system — each face has exactly one job:
//   Jost        — .display — big geometric headlines (a free face in the
//                 Futura/Kabel tradition; see the "font approach" note below)
//   Inter Tight — body copy, UI text
//   JetBrains Mono — .mono — labels, eyebrows, captions
//   Instrument Serif (italic) — .serif — single-word accents
//
// fontsinuse.com (where this direction came from) is a documentation
// archive, not a font source — it doesn't distribute the commercial faces
// it catalogues (Futura, Helvetica, Univers, etc. are paid). Jost is a free,
// license-clear Google Font that echoes that geometric-sans character
// without the licensing problem.
const display = Jost({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

const tight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-tight",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: `${PROFILE.name} — Portfolio`,
  description:
    "A cinematic 3D portfolio: AI/ML engineer, competitive programmer, hackathon finalist.",
  openGraph: {
    title: `${PROFILE.name} — Portfolio`,
    description: "A cinematic 3D portfolio.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${tight.variable} ${mono.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink text-paper">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
