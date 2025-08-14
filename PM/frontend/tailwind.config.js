/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#111827', // gray-900
        surface: '#1F2937',    // gray-800
        primary: '#3B82F6',    // blue-500
        "primary-hover": '#2563EB', // blue-600
        secondary: '#4B5563',  // gray-600
        "text-primary": '#F9FAFB', // gray-50
        "text-secondary": '#9CA3AF', // gray-400
        border: '#374151',     // gray-700
      }
    },
  },
  plugins: [],
}
