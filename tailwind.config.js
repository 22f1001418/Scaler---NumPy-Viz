/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: { 0: "var(--s0)", 1: "var(--s1)", 2: "var(--s2)", 3: "var(--s3)", 4: "var(--s4)" },
        txt: { primary: "var(--t1)", secondary: "var(--t2)", muted: "var(--t3)", inv: "var(--t-inv)" },
        edge: { DEFAULT: "var(--border)", strong: "var(--border-strong)" },
        // Scaler-branded dark-mode accents
        d: { blue: "#4B83FF", pink: "#E8468A", amber: "#fbbf24", emerald: "#34d399", indigo: "#818CF8" },
        // Scaler-branded light-mode accents
        l: { blue: "#0041CA", pink: "#B30158", amber: "#d97706", emerald: "#059669", indigo: "#4F46E5" },
      },
      boxShadow: {
        glow: "0 0 20px 4px var(--glow)",
        "glow-sm": "0 0 10px 2px var(--glow)",
        panel: "0 4px 32px -4px rgba(0,0,0,0.3), 0 0 1px 0 rgba(0,0,0,0.1)",
        "panel-light": "0 4px 24px -4px rgba(0,0,0,0.08), 0 0 1px 0 rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "grid-dark": "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        "grid-light": "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
      },
      backgroundSize: { grid: "32px 32px" },
      animation: {
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "slide-up": "slide-up 0.35s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px 0px var(--glow)" },
          "50%": { boxShadow: "0 0 24px 6px var(--glow)" },
        },
        "slide-up": { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" }},
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 }},
      },
    },
  },
  plugins: [],
}
