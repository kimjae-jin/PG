import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext'; // [신규] import

import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import ProjectList from './pages/ProjectList.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import ThemePage from './pages/ThemePage.jsx'; // [신규] import

import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "projects", element: <ProjectList /> },
      { path: "projects/:projectId", element: <ProjectDetail /> },
      { path: "technicians", element: <PlaceholderPage title="기술인" /> },
      { path: "companies", element: <PlaceholderPage title="관계사" /> },
      { path: "billing", element: <PlaceholderPage title="청구/입금" /> },
      { path: "licenses", element: <PlaceholderPage title="업면허" /> },
      { path: "meetings", element: <PlaceholderPage title="주간회의" /> },
      // [수정] PlaceholderPage를 실제 ThemePage로 교체
      { path: "theme", element: <ThemePage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider> {/* [신규] 앱 전체를 ThemeProvider로 감싸기 */}
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);