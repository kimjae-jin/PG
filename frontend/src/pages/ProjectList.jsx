// frontend/src/pages/ProjectList.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5001/api/projects')
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
      .then(data => { setProjects(data); setLoading(false); })
      .catch(err => { setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.'); setLoading(false); });
  }, []);

  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => statusFilter === '전체' || p.status === statusFilter)
      .filter(p => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (p.project_no.toLowerCase().includes(term) || p.project_name.toLowerCase().includes(term) || (p.client && p.client.toLowerCase().includes(term)));
      });
  }, [projects, statusFilter, searchTerm]);

  const formatCurrency = (amount) => amount != null ? `${amount.toLocaleString('ko-KR')}\u00A0원` : '-';
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear().toString().slice(-2)}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}.`;
  };
  const handleRowClick = (id) => navigate(`/projects/${id}`);

  if (loading) return <div className="p-6 text-center text-text-muted">프로젝트 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-text-muted">{error}</div>;

  return (
    // [최종 수정] flex-col과 h-full로 전체 레이아웃 구조 정의
    <div className="flex flex-col h-full">
      {/* --- 페이지 헤더 (Page Header) 시작 --- */}
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm focus:ring-accent focus:border-accent">
              <option value="전체">상태 (전체)</option>
              <option value="진행중">진행중</option>
              <option value="완료">완료</option>
            </select>
            <input type="text" placeholder="프로젝트 넘버/계약명/발주처 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm focus:ring-accent focus:border-accent" />
          </div>
          <button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover transition-opacity">+ 신규 등록</button>
        </div>
        
        {/* 필드 헤더 (Table Head) */}
        <div className="bg-card-bg rounded-t-lg shadow table-container overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-table-header text-table-header-text uppercase">
              <tr className="divide-x divide-separator">
                <th className="p-2 w-[5%] text-center align-middle">상태</th>
                <th className="p-2 w-[8%] text-center align-middle">프로젝트 넘버</th>
                <th className="p-2 w-[15%] align-middle">계약명</th>
                <th className="p-2 w-[15%] align-middle">발주처</th>
                <th className="p-2 w-[9%] text-right align-middle"><div>총 계약</div><div>금액</div></th>
                <th className="p-2 w-[9%] text-right align-middle"><div>총 지분</div><div>금액</div></th>
                <th className="p-2 w-[5%] text-center align-middle">지분율</th>
                <th className="p-2 w-[5%] text-center align-middle">기성율</th>
                <th className="p-2 w-[7%] text-center align-middle">계약일</th>
                <th className="p-2 w-[7%] text-center align-middle">착수일</th>
                <th className="p-2 w-[7%] text-center align-middle"><div>완료</div><div>예정일</div></th>
                <th className="p-2 w-[7%] text-center align-middle">완료일</th>
                <th className="p-2 w-[6%] text-center align-middle">PM</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
      {/* --- 페이지 헤더 (Page Header) 끝 --- */}

      {/* --- 바디 (Body) 시작 --- */}
      <div className="flex-grow overflow-auto bg-card-bg rounded-b-lg shadow table-container">
        <table className="w-full text-sm text-left">
          <tbody className="divide-y divide-separator">
            {filteredProjects.map(project => (
              <tr key={project.id} onClick={() => handleRowClick(project.id)} className="hover:bg-tab-hover cursor-pointer divide-x divide-separator">
                <td className="p-2 w-[5%] text-center align-middle"><span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${project.status === '완료' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{project.status}</span></td>
                <td className="p-2 w-[8%] text-center font-semibold align-middle">{project.project_no}</td>
                <td className="p-2 w-[15%] align-middle tracking-tighter"><div className="truncate" title={project.project_name}>{project.project_name}</div></td>
                <td className="p-2 w-[15%] align-middle tracking-tighter"><div className="truncate" title={project.client}>{project.client}</div></td>
                <td className="p-2 w-[9%] text-right font-mono align-middle whitespace-nowrap">{formatCurrency(project.contract_amount)}</td>
                <td className="p-2 w-[9%] text-right font-mono align-middle whitespace-nowrap">{formatCurrency(project.equity_amount)}</td>
                <td className="p-2 w-[5%] text-center font-mono align-middle">{project.equity_rate || 0}%</td>
                <td className="p-2 w-[5%] text-center font-mono align-middle">{project.progress_rate || 0}%</td>
                <td className="p-2 w-[7%] text-center align-middle">{formatDate(project.contract_date)}</td>
                <td className="p-2 w-[7%] text-center align-middle">{formatDate(project.start_date)}</td>
                <td className="p-2 w-[7%] text-center align-middle">{formatDate(project.end_date)}</td>
                <td className="p-2 w-[7%] text-center align-middle">{project.status === '완료' ? formatDate(project.end_date) : '-'}</td>
                <td className="p-2 w-[6%] text-center align-middle">{project.manager}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* --- 바디 (Body) 끝 --- */}
    </div>
  );
};
export default ProjectList;