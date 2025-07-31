import React, { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

const themes = [
    { id: 'native', name: '네이티브 다크 (기본)' },
    { id: 'apple', name: '애플 다크' },
    { id: 'pascucci', name: '파스쿠찌' },
    { id: 'starbucks', name: '스타벅스' },
];

const ThemePage = () => {
    const { theme, setTheme } = useContext(ThemeContext);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-text-primary mb-6">테마 선택</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((t) => (
                    <div key={t.id} className="bg-secondary p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-text-primary mb-4">{t.name}</h2>
                        <button
                            onClick={() => setTheme(t.id)}
                            disabled={theme === t.id}
                            className={`w-full py-2 px-4 rounded font-bold transition-all
                                ${theme === t.id
                                    ? 'bg-tertiary text-text-secondary cursor-not-allowed'
                                    : 'bg-accent-primary text-white hover:opacity-80'
                                }`}
                        >
                            {theme === t.id ? '적용됨' : '이 테마 적용하기'}
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-8 p-6 bg-secondary rounded-lg">
                <h3 className="text-lg font-semibold text-text-primary mb-2">작동 원리</h3>
                <p className="text-sm text-text-secondary">
                    테마를 선택하면 해당 테마의 색상 변수(CSS Custom Properties)가 포함된 CSS 파일이 동적으로 로드됩니다.
                    애플리케이션의 모든 컴포넌트는 이 변수를 참조하므로, 앱 전체의 색상이 즉시 변경됩니다.
                    선택한 테마는 브라우저의 로컬 스토리지에 저장되어 다음에 방문할 때도 유지됩니다.
                </p>
            </div>
        </div>
    );
};

export default ThemePage;