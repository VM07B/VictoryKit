/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: { colors: { cyber: { dark: "#0a0e17", accent: "#ef4444" } } },
  },
  plugins: [],
};
