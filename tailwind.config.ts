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
          50:  "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b6a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        accent: {
          cyan: "#06b6d4",
          blue: "#3b82f6",
          dark: "#1e40af",
        },
        surface: "#0a0f1e",
        panel:   "#0f1729",
        card:    "#141f35",
        border:  "#1a2d45",
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body:    ["'Sora'", "sans-serif"],
      },
      boxShadow: {
        glow:      "0 0 40px rgba(20,182,166,0.25)",
        "glow-sm": "0 0 20px rgba(20,182,166,0.15)",
        card:      "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;