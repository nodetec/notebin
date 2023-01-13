/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-color-mode="dark"]'],
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
