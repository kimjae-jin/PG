// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // App.css에 정의된 CSS 변수를 사용하도록 설정
        'background': 'var(--color-background)',
        'card-bg': 'var(--color-card-bg)',
        'sidebar-bg': 'var(--color-sidebar-bg)',
        'header-bg': 'var(--color-header-bg)',
        'text-color': 'var(--color-text-color)',
        'text-muted': 'var(--color-text-muted)',
        'separator': 'var(--color-separator)',
        'accent': 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        
        'tab-active': 'var(--color-tab-active)',
        'tab-inactive': 'var(--color-tab-inactive)',
        'tab-hover': 'var(--color-tab-hover)',
        'tab-active-text': 'var(--color-tab-active-text)',
        'tab-inactive-text': 'var(--color-tab-inactive-text)',
        
        'table-header': 'var(--color-table-header-bg)',
        'table-header-text': 'var(--color-table-header-text)',
        'table-row-odd': 'var(--color-table-row-odd)',
        'table-row-even': 'var(--color-table-row-even)',

        'input-bg': 'var(--color-input-bg)',
      }
    },
  },
  plugins: [],
}