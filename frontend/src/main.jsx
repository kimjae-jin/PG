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

import BillingList from './pages/BillingList.jsx';
import CompanyList from './pages/CompanyList.jsx';
import TechnicianList from './pages/TechnicianList.jsx';

// [신규 추가] 상세 페이지 컴포넌트를 import 합니다.
import TechnicianDetail from './pages/TechnicianDetail.jsx';
import CompanyDetail from './pages/CompanyDetail.jsx';

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
            <Route path="projects/new" element={<ProjectDetail />} />
            <Route path="projects/:id" element={<ProjectDetail />} />

            <Route path="technicians" element={<TechnicianList />} />
            <Route path="technicians/:id" element={<TechnicianDetail />} />

            <Route path="companies" element={<CompanyList />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            
            <Route path="billing" element={<BillingList />} />
            
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