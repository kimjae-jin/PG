/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // React 파일들이 Tailwind를 사용하도록 설정
  ],
  darkMode: 'class', // 다크모드를 'class' 기반으로 동작시킴
  theme: {
    extend: {
        // hr.html에서 사용한 커스텀 스타일을 여기에 추가할 수 있습니다.
        colors: {
            'dark-bg': '#000000', // 제트블랙
            'dark-card': '#1c1c1e', // 애플 다크 그레이
            'dark-border': '#3a3a3c',
            'light-bg': '#f1f1f1', // 라이트 그레이
        }
    },
  },
  plugins: [],
}