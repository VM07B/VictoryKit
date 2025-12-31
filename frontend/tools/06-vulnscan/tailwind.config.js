/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        vulnPulse: "vulnPulse 2s ease-in-out infinite",
        scanLine: "scanLine 1.5s ease-in-out infinite",
        targetLock: "targetLock 0.5s ease-out forwards",
        severityPop: "severityPop 0.3s ease-out forwards",
        portScan: "portScan 0.8s ease-out",
      },
      keyframes: {
        vulnPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        targetLock: {
          "0%": { transform: "scale(1.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        severityPop: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        portScan: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
