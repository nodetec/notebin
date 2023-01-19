/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter var, sans-serif"],
    },
    extend: {
      scale: {
        101: "1.01",
      },
      colors: {
        "primary": "#121A23",
        "secondary": "#212A37",
        "tertiary": "#272F37",
        "accent": "#9FA6B1",
      },
      boxShadow: {
        overlay: "0 0 0 100vmax rgba(0, 0, 0, 0.7)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
