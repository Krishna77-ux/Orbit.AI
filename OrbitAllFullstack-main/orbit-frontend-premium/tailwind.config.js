export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        headline: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#7c3aed",
        secondary: "#22d3ee",
        tertiary: "#f43f5e",
        background: "#050814",
        surface: "#050814",
        "surface-container": "#0f172a",
        "surface-variant": "#1e293b",
        "surface-bright": "#1e293b",
        "on-surface": "#f8fafc",
        "on-surface-variant": "rgba(255,255,255,0.7)",
        "primary-container": "#1e1b4b",
        "on-primary-container": "#a5b4fc",
        "secondary-container": "#68fadd",
        "outline": "rgba(255,255,255,0.1)",
        "outline-variant": "rgba(255,255,255,0.05)",
        error: "#ef4444",
        "error-container": "#450a0a",
        brand: {
          50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd",
          400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9",
          800: "#5b21b6", 900: "#4c1d95",
        },
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        xl2: "1.5rem",
        "2xl": "1.5rem",
        "3xl": "2.5rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 18px 40px rgba(0,0,0,0.35)",
        glow: "0 0 45px rgba(99,102,241,0.35)",
        "glow-sm": "0 0 20px rgba(99,102,241,0.25)",
        "glow-green": "0 0 20px rgba(16,185,129,0.35)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px,0px) scale(1)" },
          "33%": { transform: "translate(30px,-20px) scale(1.1)" },
          "66%": { transform: "translate(-20px,20px) scale(0.9)" },
        },
        wave: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        starPulse: {
          "0%, 100%": { transform: "scale(0.7)", opacity: "0.7" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
        },
        beat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        float: "float 5s ease-in-out infinite",
        blob: "blob 10s infinite",
        wave: "wave 4s infinite",
        "star-pulse": "starPulse 4s infinite ease-in-out",
        beat: "beat 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
