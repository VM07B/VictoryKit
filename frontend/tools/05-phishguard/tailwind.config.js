/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "phish-hook": "phishHook 2s ease-in-out infinite",
        "email-scan": "emailScan 1.5s ease-in-out infinite",
        "warning-flash": "warningFlash 0.8s ease-in-out infinite",
        "link-trace": "linkTrace 2s linear infinite",
        "shield-pulse": "shieldPulse 2s ease-in-out infinite",
        "detection-slide": "detectionSlide 0.5s ease-out forwards",
      },
      keyframes: {
        phishHook: {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        emailScan: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        warningFlash: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        linkTrace: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        shieldPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(251, 146, 60, 0.4)" },
          "50%": { boxShadow: "0 0 0 15px rgba(251, 146, 60, 0)" },
        },
        detectionSlide: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
