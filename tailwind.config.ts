import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dce6ff",
          200: "#b9cdff",
          300: "#85a8ff",
          400: "#4d7eff",
          500: "#1a56ff",
          600: "#0038f5",
          700: "#002be0",
          800: "#0025b5",
          900: "#001a80",
        },
        surface: "#0a0f1e",
        panel:   "#111827",
        card:    "#1a2236",
        border:  "#1e2d45",
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      boxShadow: {
        glow:      "0 0 40px rgba(26,86,255,0.25)",
        "glow-sm": "0 0 20px rgba(26,86,255,0.15)",
        card:      "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;