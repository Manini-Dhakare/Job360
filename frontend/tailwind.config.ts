import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors (Architecture Handbook Section 5.1)
        brand: {
          slate: "#0F172A",    // Deep Slate: Primary typography & navigation
          indigo: "#4F46E5",   // Indigo: Primary actions & CTA buttons
          emerald: "#10B981",  // Emerald: High Match Scores (>= 80%)
          amber: "#F59E0B",    // Amber: Credit indicator & medium match
          muted: "#64748B",    // Slate Muted: Secondary text & borders
          surface: "#F8FAFC",  // Off-white / light slate card background
        },
        match: {
          high: "#10B981",     // Green >= 80%
          medium: "#F59E0B",   // Yellow 60-79%
          low: "#94A3B8",      // Gray < 60%
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
