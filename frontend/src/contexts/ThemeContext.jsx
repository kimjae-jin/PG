import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

// [핵심] 일부 테마는 라이트/다크 전환을 지원하지 않음
const ALWAYS_DARK_THEMES = ['native', 'apple'];

export const ThemeProvider = ({ children }) => {
    // 1. 테마 상태 관리
    const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'native');

    // 2. 모드 상태 관리 (light/dark)
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('app-mode');
        // 저장된 모드가 있으면 사용, 없으면 OS 설정을 따르거나 light를 기본값으로
        return savedMode || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    useEffect(() => {
        // 테마 변경 시 처리
        localStorage.setItem('app-theme', theme);
        import(`../themes/${theme}-theme.css`);

        // 네이티브/애플 테마는 항상 다크모드로 강제
        if (ALWAYS_DARK_THEMES.includes(theme)) {
            setMode('dark');
        }
    }, [theme]);

    useEffect(() => {
        // 모드 변경 시 처리
        const root = document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('app-mode', mode);
    }, [mode]);

    // 모드 전환 함수
    const toggleMode = useCallback(() => {
        // 항상 다크모드인 테마에서는 모드 전환 방지
        if (ALWAYS_DARK_THEMES.includes(theme)) return;
        setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        setTheme,
        mode,
        toggleMode,
        isModeSwitchable: !ALWAYS_DARK_THEMES.includes(theme) // 모드 전환 가능 여부 전달
    }), [theme, mode, toggleMode]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;