import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

function App() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      // "이곳은 대한민국이야" - 대한민국 표준시(KST)로 시간 표시
      const options = {
        timeZone: 'Asia/Seoul',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      };
      setCurrentTime(new Date().toLocaleString('ko-KR', options));
    }, 1000);

    // 컴포넌트가 언마운트될 때 타이머 정리 (메모리 누수 방지)
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex h-screen bg-main-bg text-text-color">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-card-bg h-16 flex items-center justify-between px-6 border-b border-separator">
          <div>
            {/* 향후 Breadcrumb가 위치할 공간 */}
          </div>
          <div className="text-sm font-semibold text-text-muted">
            {currentTime}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;