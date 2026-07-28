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
        // Surfaces (Xbox / Steam Deck dark palette)
        bg: "#0a0e14",
        surface: "#11161f",
        "surface-2": "#1a2230",
        border: "#1f2a3a",

        // Text
        "text-primary": "#e6edf3",
        "text-secondary": "#9aa7b8",
        "text-muted": "#5e6b80",

        // Accents
        "accent-green": "#9bf00b", // Xbox A-button / selected
        "accent-blue": "#3b82f6", // Steam Deck / PS blue
        "accent-purple": "#a855f7",
        "accent-orange": "#f5a623",

        // Status
        "status-online": "#22c55e",
        "status-away": "#eab308",
        "status-dnd": "#ef4444",
        "status-offline": "#6b7280",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 2px rgba(155, 240, 11, 0.35), 0 0 24px rgba(155, 240, 11, 0.15)",
        "glow-blue":
          "0 0 0 2px rgba(59, 130, 246, 0.35), 0 0 24px rgba(59, 130, 246, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
