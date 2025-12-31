/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      animation: {
        checkScan: "checkScan 2s ease-in-out infinite",
        compliancePulse: "compliancePulse 1.5s ease-in-out infinite",
        frameworkRotate: "frameworkRotate 20s linear infinite",
        controlCheck: "controlCheck 0.5s ease-out forwards",
        progressFill: "progressFill 1s ease-out forwards",
        statusBlink: "statusBlink 1s ease-in-out infinite",
        fadeIn: "fadeIn 0.3s ease-out forwards",
        slideUp: "slideUp 0.4s ease-out forwards",
      },
      keyframes: {
        checkScan: {
          "0%, 100%": { transform: "translateY(0)", opacity: "1" },
          "50%": { transform: "translateY(-5px)", opacity: "0.7" },
        },
        compliancePulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(99, 102, 241, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(99, 102, 241, 0)" },
        },
        frameworkRotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        controlCheck: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress)" },
        },
        statusBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
