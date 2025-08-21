import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindcssPostcss from '@tailwindcss/postcss';

export default {
  plugins: [
    tailwindcssPostcss, // 'tailwindcss' 문자열 대신 실제 패키지를 사용
    autoprefixer,
  ],
}
