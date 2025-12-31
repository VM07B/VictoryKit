/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        securecode: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      animation: {
        codeScan: "codeScan 2s ease-in-out infinite",
        syntaxHighlight: "syntaxHighlight 1.5s ease-in-out infinite",
        securityPulse: "securityPulse 2s ease-in-out infinite",
        lineCheck: "lineCheck 0.5s ease-out",
        vulnAlert: "vulnAlert 0.6s ease-out",
        codeFlow: "codeFlow 3s linear infinite",
      },
      keyframes: {
        codeScan: {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
        syntaxHighlight: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        securityPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(34, 197, 94, 0.6)" },
        },
        lineCheck: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        vulnAlert: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        codeFlow: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};
