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
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator">
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

        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-shrink-0">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-table-header text-table-header-text uppercase">
                <tr>
                  <th className="p-2 text-center align-middle" style={{ width: '4rem' }}>상태</th>
                  <th className="p-2 text-center align-middle" style={{ width: '7rem' }}>프로젝트 넘버</th>
                  <th className="p-2 align-middle">계약명</th>
                  <th className="p-2 align-middle">발주처</th>
                  {/* [수정] 헤더 텍스트를 div로 감싸 두 줄로 표시 */}
                  <th className="p-2 text-right align-middle" style={{ width: '8rem' }}><div>총 계약</div><div>금액</div></th>
                  <th className="p-2 text-right align-middle" style={{ width: '8rem' }}><div>총 지분</div><div>금액</div></th>
                  <th className="p-2 text-center align-middle" style={{ width: '5rem' }}>기성율</th>
                  <th className="p-2 text-center align-middle" style={{ width: '6rem' }}>착수일</th>
                  <th className="p-2 text-center align-middle" style={{ width: '6rem' }}>완료예정일</th>
                  <th className="p-2 text-center align-middle" style={{ width: '4rem' }}>PM</th>
                </tr>
              </thead>
            </table>
          </div>

          <div className="flex-grow overflow-y-auto">
            <table className="w-full text-sm text-left table-fixed">
              <tbody className="divide-y divide-separator">
                {filteredProjects.map(project => (
                  <tr key={project.id} onClick={() => handleRowClick(project.id)} className="hover:bg-tab-hover cursor-pointer">
                    <td className="p-2 text-center align-middle" style={{ width: '4rem' }}><span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${project.status === '완료' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{project.status}</span></td>
                    <td className="p-2 text-center font-semibold align-middle" style={{ width: '7rem' }}>{project.project_no}</td>
                    <td className="p-2 align-middle whitespace-nowrap overflow-hidden text-ellipsis" title={project.project_name}>{project.project_name}</td>
                    <td className="p-2 align-middle whitespace-nowrap overflow-hidden text-ellipsis" title={project.client}>{project.client}</td>
                    <td className="p-2 text-right font-mono align-middle whitespace-nowrap" style={{ width: '8rem' }}>{formatCurrency(project.contract_amount)}</td>
                    <td className="p-2 text-right font-mono align-middle whitespace-nowrap" style={{ width: '8rem' }}>{formatCurrency(project.equity_amount)}</td>
                    <td className="p-2 text-center font-mono align-middle" style={{ width: '5rem' }}>{project.progress_rate || 0}%</td>
                    <td className="p-2 text-center align-middle" style={{ width: '6rem' }}>{formatDate(project.start_date)}</td>
                    <td className="p-2 text-center align-middle" style={{ width: '6rem' }}>{formatDate(project.end_date)}</td>
                    <td className="p-2 text-center align-middle" style={{ width: '4rem' }}>{project.manager}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProjectList;