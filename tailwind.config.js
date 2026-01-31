/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#34A853", // xanh kiểu Google/Sheets
          soft: "#EAF7EF",
          dark: "#1E7F47",
        },
      },
    },
  },
  plugins: [],
};
