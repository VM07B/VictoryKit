/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        siem: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      animation: {
        "event-stream": "eventStream 1s ease-out",
        "alert-blink": "alertBlink 1s ease-in-out infinite",
      },
      keyframes: {
        eventStream: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        alertBlink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.3" } },
      },
    },
  },
  plugins: [],
};
