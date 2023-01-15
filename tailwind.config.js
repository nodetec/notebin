/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "overlay": "0 0 0 100vmax rgba(0, 0, 0, 0.7)",
      }
    },
  },
  plugins: [ require("@tailwindcss/forms"), ],
};
