/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // 다크모드는 계속 지원
  theme: {
    extend: {
      colors: {
        // 이제 Tailwind는 하드코딩된 색상이 아닌 CSS 변수를 사용합니다.
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
        'tertiary': 'var(--bg-tertiary)',
        'header': 'var(--bg-header)',
        
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-placeholder': 'var(--text-placeholder)',
        
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-danger': 'var(--accent-danger)',
        
        'border-primary': 'var(--border-primary)',
      },
      spacing: {
        '18': '4.5rem',
      },
      fontSize: {
        'xxs': '0.65rem',
      }
    },
  },
  plugins: [],
}