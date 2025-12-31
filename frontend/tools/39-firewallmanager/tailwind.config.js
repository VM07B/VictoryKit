/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        firewall: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
      },
      animation: {
        "flame-flicker": "flameFlicker 0.5s ease-in-out infinite alternate",
        "shield-block": "shieldBlock 0.3s ease-out",
      },
      keyframes: {
        flameFlicker: {
          "0%": { transform: "scaleY(1)" },
          "100%": { transform: "scaleY(1.1)" },
        },
        shieldBlock: {
          "0%": { transform: "scale(1.2)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
