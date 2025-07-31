// frontend/src/pages/ProjectList.jsx

// [최종 수정] 치명적인 import 구문 오류를 수정합니다.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const formatCurrency = (amount) => amount?.toLocaleString('ko-KR') + ' 원' || '-';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ko-KR') : '-';

  if (loading) return <div className="p-6 text-center text-text-muted">프로젝트 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex justify-end items-center mb-4">
        <button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover transition-opacity">+ 신규 등록</button>
      </div>

      <div className="flex-grow overflow-auto bg-card-bg rounded-lg shadow">
        <table className="min-w-full text-sm text-left table-fixed">
          <thead className="sticky top-0 bg-table-header text-table-header-text uppercase z-10">
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
          <tbody className="divide-y divide-separator">
            {projects.map(project => (
              <tr key={project.id} className="hover:bg-tab-hover">
                <td className="p-3 align-middle"><span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${project.status === '완료' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{project.status}</span></td>
                <td className="p-3 font-semibold align-middle"><Link to={`/projects/${project.id}`} className="hover:text-accent hover:underline">{project.project_no}</Link></td>
                <td className="p-3 font-semibold text-text-color align-middle"><div className="truncate" title={project.project_name}>{project.project_name}</div></td>
                <td className="p-3 text-right font-mono align-middle">{formatCurrency(project.contract_amount)}</td>
                <td className="p-3 align-middle">{formatDate(project.start_date)}</td>
                <td className="p-3 align-middle">{formatDate(project.end_date)}</td>
                <td className="p-3 align-middle">{project.manager}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;