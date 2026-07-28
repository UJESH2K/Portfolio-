import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ─── Fonts ──────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

// ─── Metadata / Viewport ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Console — Aadit",
  description:
    "A gaming-console-aesthetic portfolio. Press A to continue.",
};

export const viewport: Viewport = {
  themeColor: "#0a0e14",
};

// ─── Layout ─────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-bg font-sans text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
