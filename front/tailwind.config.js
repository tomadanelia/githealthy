/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    "text-green-600", "bg-green-50",
    "text-yellow-600", "bg-yellow-50",
    "text-orange-600", "bg-orange-50",
    "text-red-600", "bg-red-50"
  ],
};