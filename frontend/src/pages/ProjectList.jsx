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
      .catch(err => {
        setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.');
        setLoading(false);
      });
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
  
  // [최종 수정] 금액 포맷팅 함수: 숫자와 '원'이 줄바꿈되지 않도록   사용
  const formatCurrency = (amount) => amount != null ? `${amount.toLocaleString('ko-KR')}\u00A0원` : '-';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ko-KR') : '-';
  const handleRowClick = (id) => navigate(`/projects/${id}`);

  if (loading) return <div className="p-6 text-center text-text-muted">프로젝트 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-text-muted">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
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
      
      <div className="flex-grow overflow-hidden bg-card-bg rounded-lg shadow flex flex-col">
        {/* 테이블 헤더 영역 (고정) */}
        <div className="overflow-x-auto flex-shrink-0">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-table-header text-table-header-text uppercase">
              <tr>
                <th className="p-3 font-semibold sticky left-0 bg-table-header w-20">상태</th>
                <th className="p-3 font-semibold w-28">프로젝트 넘버</th>
                <th className="p-3 font-semibold min-w-[200px]">계약명</th>
                <th className="p-3 font-semibold min-w-[200px]">발주처</th>
                <th className="p-3 font-semibold w-32 text-right"><div>총 계약</div><div>금액</div></th>
                <th className="p-3 font-semibold w-32 text-right"><div>총 지분</div><div>금액</div></th>
                <th className="p-3 font-semibold w-20 text-right">지분율</th>
                <th className="p-3 font-semibold w-20 text-right">기성율</th>
                <th className="p-3 font-semibold w-28">계약일</th>
                <th className="p-3 font-semibold w-28">착수일</th>
                <th className="p-3 font-semibold w-28"><div>완료</div><div>예정일</div></th>
                <th className="p-3 font-semibold w-28">완료일</th>
                <th className="p-3 font-semibold w-24">PM</th>
                <th className="p-3 font-semibold w-24"><div>추가</div><div>계약</div></th>
                <th className="p-3 font-semibold w-24">비고</th>
              </tr>
            </thead>
          </table>
        </div>
        {/* 테이블 바디 영역 (스크롤) */}
        <div className="overflow-auto flex-grow">
          <table className="min-w-full text-sm text-left">
            <tbody className="divide-y divide-separator">
              {filteredProjects.map(project => (
                <tr key={project.id} onClick={() => handleRowClick(project.id)} className="hover:bg-tab-hover cursor-pointer">
                  <td className="p-3 align-middle sticky left-0 bg-card-bg hover:bg-tab-hover w-20"><span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${project.status === '완료' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{project.status}</span></td>
                  <td className="p-3 font-semibold align-middle w-28">{project.project_no}</td>
                  <td className="p-3 align-middle min-w-[200px]"><div className="w-24 truncate" title={project.project_name}>{project.project_name}</div></td>
                  <td className="p-3 align-middle min-w-[200px]"><div className="w-24 truncate" title={project.client}>{project.client}</div></td>
                  <td className="p-3 text-right font-mono align-middle w-32 whitespace-nowrap">{formatCurrency(project.contract_amount)}</td>
                  <td className="p-3 text-right font-mono align-middle w-32 whitespace-nowrap">{formatCurrency(project.equity_amount)}</td>
                  <td className="p-3 text-right font-mono align-middle w-20">{project.equity_rate || 0}%</td>
                  <td className="p-3 text-right font-mono align-middle w-20">{project.progress_rate || 0}%</td>
                  <td className="p-3 align-middle w-28">{formatDate(project.contract_date)}</td>
                  <td className="p-3 align-middle w-28">{formatDate(project.start_date)}</td>
                  <td className="p-3 align-middle w-28">{formatDate(project.end_date)}</td>
                  <td className="p-3 align-middle w-28">{project.status === '완료' ? formatDate(project.end_date) : '-'}</td>
                  <td className="p-3 align-middle w-24">{project.manager}</td>
                  <td className="p-3 align-middle w-24">{project.is_additional_contract ? 'Y' : 'N'}</td>
                  <td className="p-3 align-middle w-24"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ProjectList;