/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 함장님 스크린샷 기반 정밀 컬러 스킴
        'navy': {
          'DEFAULT': '#1A202C', // 메인 배경
          'light': '#2D3748',   // 사이드바, 카드 배경
          'lighter': '#4A5568',  // 호버, 테이블 헤더
          'dark': '#151A23',
        },
        'accent': {
          'blue': '#4299E1',    // 활성 메뉴, 버튼
          'green': '#48BB78',   // '진행중' 상태
          'red': '#F56565',     // 잔액
        },
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