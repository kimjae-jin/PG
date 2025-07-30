import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import ProjectList from './pages/ProjectList.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> }, // 기본 페이지를 홈으로 설정
      { path: "projects", element: <ProjectList /> },
      { path: "projects/:projectId", element: <ProjectDetail /> },
      { path: "technicians", element: <PlaceholderPage title="기술인" /> },
      { path: "companies", element: <PlaceholderPage title="관계사" /> },
      { path: "billing", element: <PlaceholderPage title="청구/입금" /> },
      { path: "licenses", element: <PlaceholderPage title="업면허" /> },
      { path: "meetings", element: <PlaceholderPage title="주간회의" /> },
      { path: "theme", element: <PlaceholderPage title="테마" /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);