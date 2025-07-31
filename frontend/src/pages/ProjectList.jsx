// frontend/src/pages/ProjectList.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // [신규] 필터링을 위한 상태 추가
  const [statusFilter, setStatusFilter] = useState('전체'); // '전체', '진행중', '완료'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/projects')
      .then(res => {
        if (!res.ok) throw new Error('네트워크 응답 오류');
        return res.json();
      })
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("프로젝트 목록 로딩 실패:", err);
        setError('데이터 로딩에 실패했습니다. 백엔드 서버 상태를 확인하십시오.');
        setLoading(false);
      });
  }, []);

  // [신규] 필터링된 프로젝트 목록을 계산 (useMemo로 성능 최적화)
  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => {
        // 상태 필터
        if (statusFilter === '전체') return true;
        return p.status === statusFilter;
      })
      .filter(p => {
        // 검색어 필터 (프로젝트 번호 또는 계약명)
        if (searchTerm.trim() === '') return true;
        const term = searchTerm.toLowerCase();
        return (
          p.project_no.toLowerCase().includes(term) ||
          p.project_name.toLowerCase().includes(term)
        );
      });
  }, [projects, statusFilter, searchTerm]);

  const formatCurrency = (amount) => amount?.toLocaleString('ko-KR') + ' 원' || '-';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ko-KR') : '-';

  if (loading) return <div className="p-6 text-center text-text-muted">프로젝트 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-text-muted">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      {/* [최종 수정] 헤더 영역: 좌측에 조회 필드, 우측에 버튼 배치 */}
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm focus:ring-accent focus:border-accent"
          >
            <option value="전체">상태 (전체)</option>
            <option value="진행중">진행중</option>
            <option value="완료">완료</option>
          </select>
          {/* 검색창 */}
          <input
            type="text"
            placeholder="프로젝트 넘버 / 계약명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm focus:ring-accent focus:border-accent"
          />
        </div>
        <button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover transition-opacity">+ 신규 등록</button>
      </div>

      <div className="flex-grow overflow-hidden bg-card-bg rounded-lg shadow flex flex-col">
        <table className="min-w-full text-sm text-left table-fixed">
          <thead className="bg-table-header text-table-header-text uppercase">
            <tr>
              <th className="w-24 p-3">상태</th>
              <th className="w-32 p-3">프로젝트 넘버</th>
              <th className="p-3">계약명</th>
              <th className="w-40 p-3 text-right">계약금액</th>
              <th className="w-32 p-3">착수일</th>
              <th className="w-32 p-3">완료예정일</th>
              <th className="w-24 p-3">담당자</th>
            </tr>
          </thead>
        </table>
        <div className="overflow-y-auto flex-grow">
          <table className="min-w-full text-sm text-left table-fixed">
            <tbody className="divide-y divide-separator">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <tr key={project.id} className="hover:bg-tab-hover">
                    <td className="w-24 p-3 align-middle"><span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${project.status === '완료' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{project.status}</span></td>
                    <td className="w-32 p-3 font-semibold align-middle"><Link to={`/projects/${project.id}`} className="hover:text-accent hover:underline">{project.project_no}</Link></td>
                    <td className="p-3 font-semibold text-text-color align-middle"><div className="truncate" title={project.project_name}>{project.project_name}</div></td>
                    <td className="w-40 p-3 text-right font-mono align-middle">{formatCurrency(project.contract_amount)}</td>
                    <td className="w-32 p-3 align-middle">{formatDate(project.start_date)}</td>
                    <td className="w-32 p-3 align-middle">{formatDate(project.end_date)}</td>
                    <td className="w-24 p-3 align-middle">{project.manager}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-text-muted">
                    조회된 프로젝트가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;