import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: "#060813",
          card: "rgba(10, 15, 30, 0.75)",
          surface: "rgba(16, 24, 48, 0.8)",
          border: "rgba(56, 189, 248, 0.2)",
          borderGlow: "rgba(56, 189, 248, 0.4)",
          cyan: "#38bdf8",
          teal: "#14b8a6",
          blue: "#3b82f6",
          violet: "#8b5cf6",
          amber: "#f59e0b",
          rose: "#f43f5e",
          emerald: "#10b981",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Cascadia Code", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse": "spin-rev 25s linear infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "scan": "scanline 8s linear infinite",
      },
      keyframes: {
        "spin-rev": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
