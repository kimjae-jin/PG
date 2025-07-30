/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#202124',
        'dark-card': '#303134',
        'dark-border': '#3c4043',
        'dark-text': '#e8eaed',
        'dark-text-secondary': '#9aa0a6',
        'dark-accent': '#8ab4f8',
      },
    },
  },
  plugins: [],
}