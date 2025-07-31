import React, { createContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'native');

    useEffect(() => {
        // 1. 선택된 테마를 localStorage에 저장
        localStorage.setItem('app-theme', theme);
        
        // 2. 동적으로 해당 테마의 CSS 파일을 import
        // Vite는 이를 자동으로 처리하여 필요한 CSS만 로드합니다.
        import(`../themes/${theme}-theme.css`);

    }, [theme]);

    const value = useMemo(() => ({ theme, setTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;