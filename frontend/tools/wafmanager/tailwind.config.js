/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        cyber: {
          dark: "#0a0e17",
          darker: "#060912",
          accent: "#00ff88",
          warning: "#ff6b35",
          danger: "#ff3366",
          info: "#00d4ff",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": {
            boxShadow: "0 0 5px #00ff88, 0 0 10px #00ff88, 0 0 15px #00ff88",
          },
          "100%": {
            boxShadow: "0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88",
          },
        },
      },
    },
  },
  plugins: [],
};
