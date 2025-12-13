/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",     
    "./src/components/**/*.{js,jsx,ts,tsx}", // everything inside /components
    "./*.{js,jsx,ts,tsx,html}"        // root of your front folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    "text-green-600","bg-green-50",
    "text-yellow-600","bg-yellow-50",
    "text-orange-600","bg-orange-50",
    "text-red-600","bg-red-50"
  ],
};
