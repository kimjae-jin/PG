import React from 'react';
import { Routes, Route, NavLink, Outlet } from 'react-router-dom';
import { Users, FileText, Briefcase, Building, Gavel, FileSignature } from 'lucide-react';
import TechnicianList from './pages/TechnicianList';
import TechnicianDetail from './pages/TechnicianDetail';
import BidForm from './pages/BidForm';
import ContractDetail from './pages/ContractDetail';
import QuotationDetail from './pages/QuotationDetail';
import FormsPage from './pages/FormsPage';
import CompanyInfo from './pages/CompanyInfo';
const TechnicianNew = () => <div className="p-8"><h1 className="text-2xl font-bold">신규 기술인력 등록</h1></div>;
const Layout = () => (
    <div className="flex h-screen bg-gray-100 font-sans">
        <aside className="w-64 bg-gray-800 text-white flex flex-col print:hidden">
            <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700">Project Genesis</div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                <NavItem to="/technicians" icon={<Users size={20} />} label="기술인력 관리" />
                <NavItem to="/bids/new" icon={<Gavel size={20} />} label="PQ 시뮬레이션" />
                <NavItem to="/forms" icon={<FileSignature size={20} />} label="문서 생성" />
                <NavItem to="/company" icon={<Building size={20} />} label="회사/면허 정보" />
                <p className="px-4 pt-4 text-xs font-semibold text-gray-400 uppercase">예시 링크</p>
                <NavItem to="/contracts/1" icon={<Briefcase size={20} />} label="계약 상세 (ID:1)" />
                <NavItem to="/quotations/1" icon={<FileText size={20} />} label="견적 상세 (ID:1)" />
            </nav>
        </aside>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
    </div>
);
const NavItem = ({ to, icon, label }) => ( <NavLink to={to} end className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${ isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white' }`} > {icon} <span className="ml-3">{label}</span> </NavLink> );
function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<TechnicianList />} />
                <Route path="technicians" element={<TechnicianList />} />
                <Route path="technicians/new" element={<TechnicianNew />} />
                <Route path="technicians/:id" element={<TechnicianDetail />} />
                <Route path="bids/new" element={<BidForm />} />
                <Route path="contracts/:id" element={<ContractDetail />} />
                <Route path="quotations/:id" element={<QuotationDetail />} />
                <Route path="forms" element={<FormsPage />} />
                <Route path="company" element={<CompanyInfo />} />
                <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">404 - 페이지를 찾을 수 없습니다.</h1></div>} />
            </Route>
        </Routes>
    );
}
export default App;
