/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        api: {
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
          950: "#4a044e",
        },
      },
      animation: {
        "api-pulse": "apiPulse 1.5s ease-in-out infinite",
        "endpoint-scan": "endpointScan 2s linear infinite",
      },
      keyframes: {
        apiPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(217, 70, 239, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(217, 70, 239, 0)" },
        },
        endpointScan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
