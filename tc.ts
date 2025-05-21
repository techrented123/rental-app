// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false, // or 'class' if you ever want dark mode
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // only three colors
        primary: "#2563EB",
        black: "#000000",
        white: "#FFFFFF",
      },
      ringColor: {
        primary: "#2563EB",
      },
      backgroundColor: {
        primary: "#2563EB",
        black: "#000000",
        white: "#FFFFFF",
      },
      textColor: {
        primary: "#2563EB",
        black: "#000000",
        white: "#FFFFFF",
      },
      borderColor: {
        primary: "#2563EB",
        black: "#000000",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
