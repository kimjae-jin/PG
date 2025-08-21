// frontend/src/contexts/ThemeContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// ThemeContext를 명시적으로 export합니다. 다른 파일에서 import { ThemeContext }로 사용할 수 있습니다.
export const ThemeContext = createContext();

// ThemeProvider 컴포넌트를 명시적으로 export합니다. main.jsx에서 import { ThemeProvider }로 사용할 수 있습니다.
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'native');
  const [mode, setMode] = useState(localStorage.getItem('app-mode') || 'dark');
  const [isModeSwitchable, setIsModeSwitchable] = useState(true);

  useEffect(() => {
    // 테마와 모드를 body 클래스에 적용하기 전에 기존 클래스를 초기화합니다.
    document.body.className = ''; 
    document.body.classList.add(theme, mode);
    
    // 변경된 테마와 모드를 로컬 스토리지에 저장합니다.
    localStorage.setItem('app-theme', theme);
    localStorage.setItem('app-mode', mode);

    // 각 테마가 라이트/다크 모드 전환을 지원하는지 여부를 설정합니다.
    const themeConfig = {
      native: true,
      apple: true,
      pascucci: true,
      starbucks: false, // 스타벅스 테마는 다크 모드만 지원
    };
    setIsModeSwitchable(themeConfig[theme] === true);

  }, [theme, mode]);

  // 모드를 전환하는 함수
  const toggleMode = () => {
    if (isModeSwitchable) {
      setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
    }
  };

  // 테마를 변경하는 함수
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    // 스타벅스 테마로 변경 시, 강제로 다크 모드로 설정합니다.
    if (newTheme === 'starbucks') {
      setMode('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, changeTheme, toggleMode, isModeSwitchable }}>
      {children}
    </ThemeContext.Provider>
  );
};