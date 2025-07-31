// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import ProjectList from './pages/ProjectList.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import ThemePage from './pages/ThemePage.jsx';

import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="technicians" element={<PlaceholderPage title="기술인" />} />
            <Route path="companies" element={<PlaceholderPage title="관계사" />} />
            <Route path="billing" element={<PlaceholderPage title="청구/입금" />} />
            <Route path="evaluation" element={<PlaceholderPage title="사업수행능력평가" />} />
            <Route path="analysis" element={<PlaceholderPage title="입찰분석" />} />
            <Route path="docs" element={<PlaceholderPage title="문서/서식" />} />
            <Route path="licenses" element={<PlaceholderPage title="업/면허" />} />
            <Route path="meetings" element={<PlaceholderPage title="주간회의" />} />
            {/* [수정] "theme" 경로에 ThemePage 컴포넌트를 정확히 연결합니다. */}
            <Route path="theme" element={<ThemePage />} />
            <Route path="*" element={<PlaceholderPage title="페이지를 찾을 수 없습니다." />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);