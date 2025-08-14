// frontend/src/pages/ThemePage.jsx

import React, { useContext } from 'react';
// [최종 수정] default export가 없으므로, 중괄호를 사용하여 명시적으로 ThemeContext를 import합니다.
import { ThemeContext } from '../contexts/ThemeContext.jsx';

const ThemePage = () => {
  const { theme, changeTheme, mode, toggleMode, isModeSwitchable } = useContext(ThemeContext);

  const themes = [
    { id: 'native', name: '네이티브' },
    { id: 'apple', name: '애플' },
    { id: 'pascucci', name: '파스쿠찌' },
    { id: 'starbucks', name: '스타벅스' },
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-text-color mb-6">테마 설정</h1>

      <div className="bg-card-bg p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-text-color mb-4">테마 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              className={`p-4 rounded-lg text-center font-semibold transition-all duration-200 border-2 ${
                theme === t.id
                  ? 'border-accent bg-accent text-white scale-105'
                  : 'border-separator bg-tab-inactive hover:border-accent hover:text-accent'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card-bg p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold text-text-color mb-4">모드 설정</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMode}
            disabled={!isModeSwitchable}
            className="px-4 py-2 rounded font-semibold bg-accent text-white disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
          >
            {mode === 'light' ? '다크 모드로 변경' : '라이트 모드로 변경'}
          </button>
          <span className="text-text-muted">
            {isModeSwitchable
              ? `현재 모드: ${mode === 'light' ? '라이트' : '다크'}`
              : '현재 테마는 모드 변경을 지원하지 않습니다.'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThemePage;