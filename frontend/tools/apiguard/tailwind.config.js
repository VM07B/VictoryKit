/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: "#0a0e17",
          darker: "#060912",
          accent: "#00ff88",
          warning: "#ff6b35",
          danger: "#ff3366",
          info: "#00d4ff",
        },
      },
    },
  },
  plugins: [],
};
