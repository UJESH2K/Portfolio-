import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#ffffff",
        ink: "#08080a",
        ash: "#9a9aa2",
        hair: "rgba(255,255,255,0.12)",
        /** The one accent colour in an otherwise monochrome palette. */
        accent: "#8ab4ff",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        tight: ["var(--font-tight)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      fontSize: {
        // Fluid display sizes, used by the big type.
        d1: ["clamp(3rem, 13vw, 12rem)", { lineHeight: "0.84" }],
        d2: ["clamp(2.25rem, 7.5vw, 6.5rem)", { lineHeight: "0.88" }],
        d3: ["clamp(1.6rem, 4vw, 3.25rem)", { lineHeight: "0.95" }],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
