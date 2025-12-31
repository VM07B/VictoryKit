/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        devsec: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
      },
      animation: {
        pipelineFlow: "pipelineFlow 2s linear infinite",
        buildPulse: "buildPulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        pipelineFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        buildPulse: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
      },
    },
  },
  plugins: [],
};
