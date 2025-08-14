import React from 'react';
import { Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';

// --- 페이지 컴포넌트 임포트 ---
import TechnicianList from './pages/TechnicianList';
import TechnicianDetail from './pages/TechnicianDetail';
// --- 이하 모든 페이지 컴포넌트들을 여기에 임포트해야 합니다 ---
const Dashboard = () => <h1 className="text-white text-2xl">대시보드</h1>;
const BidForm = () => <h1 className="text-white text-2xl">입찰/PQ 관리</h1>;
const ContractDetail = () => <h1 className="text-white text-2xl">계약 상세</h1>;
const CompanyInfo = () => <h1 className="text-white text-2xl">회사 정보</h1>;
const FormsPage = () => <h1 className="text-white text-2xl">문서 관리</h1>;


const Layout = () => (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111827', color: '#E5E7EB' }}>
        <aside style={{ width: '250px', borderRight: '1px solid #374151', padding: '1rem', backgroundColor: '#1F2937' }}>
            <h2 className="text-2xl font-bold mb-6 text-white">Project Genesis</h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/dashboard" className="p-2 rounded hover:bg-gray-700">대시보드</Link>
                <Link to="/technicians" className="p-2 rounded hover:bg-gray-700">기술인력 관리</Link>
                <Link to="/bids" className="p-2 rounded hover:bg-gray-700">입찰/PQ 관리</Link>
                <Link to="/contracts/1" className="p-2 rounded hover:bg-gray-700">계약 상세 (샘플)</Link>
                <Link to="/company" className="p-2 rounded hover:bg-gray-700">회사 정보</Link>
                <Link to="/forms" className="p-2 rounded hover:bg-gray-700">문서 자동화</Link>
            </nav>
        </aside>
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
            <Outlet />
        </main>
    </div>
);

function App() {
    return (
        <Routes>
            {/* 기본 경로(/)로 접속 시 /dashboard로 자동 이동시킵니다. */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/" element={<Layout />}>
                {/* /dashboard 경로를 명시적으로 정의합니다. */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="technicians" element={<TechnicianList />} />
                <Route path="technicians/:id" element={<TechnicianDetail />} />
                <Route path="bids" element={<BidForm />} />
                <Route path="contracts/:id" element={<ContractDetail />} />
                <Route path="company" element={<CompanyInfo />} />
                <Route path="forms" element={<FormsPage />} />
            </Route>
        </Routes>
    );
}

export default App;
