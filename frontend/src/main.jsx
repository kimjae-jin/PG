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
import BillingPage from './pages/BillingPage.jsx';
import CompaniesPage from './pages/CompaniesPage.jsx'; // [오타 수정 완료]

import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />

            {/* 프로젝트 관련 경로는 'projects'로 통일 */}
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/new" element={<ProjectDetail />} />
            <Route path="projects/:id" element={<ProjectDetail />} />

            <Route path="technicians" element={<PlaceholderPage title="기술인" />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="evaluation" element={<PlaceholderPage title="사업수행능력평가" />} />
            <Route path="analysis" element={<PlaceholderPage title="입찰분석" />} />
            <Route path="docs" element={<PlaceholderPage title="문서/서식" />} />
            <Route path="licenses" element={<PlaceholderPage title="업면허" />} />
            <Route path="meetings" element={<PlaceholderPage title="주간회의" />} />
            <Route path="theme" element={<ThemePage />} />
            <Route path="*" element={<PlaceholderPage title="페이지를 찾을 수 없습니다." />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);