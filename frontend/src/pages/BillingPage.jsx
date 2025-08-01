// frontend/src/pages/BillingPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const BillingPage = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5001/api/billing').then(res => res.ok ? res.json() : Promise.reject('Billing API Error')),
      fetch('http://localhost:5001/api/projects').then(res => res.ok ? res.json() : Promise.reject('Projects API Error'))
    ]).then(([billingData, projectData]) => {
        const projectMap = new Map(projectData.map(p => [p.project_no, p.id]));
        const processedData = billingData.map(item => {
          let status = '입금';
          if (!item.deposit_date && item.request_date) status = '청구';
          if (item.outstanding > 0) status = '미수';
          if (!item.request_date && item.deposit_date) status = '선입금';
          return { ...item, status, projectId: projectMap.get(item.project_no) };
        });
        setBillings(processedData);
        setLoading(false);
      })
      .catch(err => { setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.'); setLoading(false); });
  }, []);

  const filteredBillings = useMemo(() => {
    return billings
      .filter(b => statusFilter === '전체' || b.status === statusFilter)
      .filter(b => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return ( b.project_no.toLowerCase().includes(term) || b.project_name.toLowerCase().includes(term) || b.client.toLowerCase().includes(term) );
      });
  }, [billings, statusFilter, searchTerm]);

  const formatCurrency = (amount) => amount != null ? `${amount.toLocaleString('ko-KR')}\u00A0원` : '-';
  const getStatusChip = (status) => { const base = "px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap"; switch (status) { case '미수': return <span className={`${base} bg-red-200 text-red-800`}>미수</span>; case '청구': return <span className={`${base} bg-yellow-200 text-yellow-800`}>청구</span>; case '입금': return <span className={`${base} bg-green-200 text-green-800`}>입금</span>; case '선입금': return <span className={`${base} bg-purple-200 text-purple-800`}>선입금</span>; default: return <span className={`${base} bg-gray-200 text-gray-800`}>{status}</span>; } };
  const handleRowClick = (projectId) => { if(projectId) navigate(`/projects/${projectId}`); };

  if (loading) return <div className="p-6 text-center text-text-muted">데이터를 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      {/* --- 페이지 헤더 (Page Header) 시작 --- */}
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        {/* [최종 수정] 누락되었던 조회 필드 영역을 완벽하게 복원합니다. */}
        <div className="flex items-center space-x-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm focus:ring-accent focus:border-accent">
            <option value="전체">상태 (전체)</option>
            <option value="청구">청구</option>
            <option value="입금">입금</option>
            <option value="미수">미수</option>
            <option value="선입금">선입금</option>
          </select>
          <input type="text" placeholder="프로젝트/용역명/발주처 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm focus:ring-accent focus:border-accent" />
        </div>
        <button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover transition-opacity">+ 신규 등록</button>
      </div>
      
      <div className="flex-grow overflow-hidden bg-card-bg rounded-lg shadow flex flex-col">
        {/* 필드 헤더 (Table Head) */}
        <div className="overflow-x-auto flex-shrink-0">
          <table className="w-full text-sm text-left table-fixed">
            <thead className="bg-table-header text-table-header-text uppercase">
              <tr className="divide-x divide-separator">
                <th style={{width: '80px'}} className="p-2 text-center align-middle">상태</th>
                <th style={{width: '120px'}} className="p-2 text-center align-middle">프로젝트 넘버</th>
                <th style={{width: '280px'}} className="p-2 align-middle">계약명</th>
                <th style={{width: '280px'}} className="p-2 align-middle">발주처</th>
                <th style={{width: '130px'}} className="p-2 text-right align-middle"><div>총 계약</div><div>금액</div></th>
                <th style={{width: '130px'}} className="p-2 text-right align-middle"><div>총 지분</div><div>금액</div></th>
                <th style={{width: '80px'}} className="p-2 text-center align-middle">지분율</th>
                <th style={{width: '80px'}} className="p-2 text-center align-middle">기성율</th>
                <th style={{width: '130px'}} className="p-2 text-right align-middle">청구금액</th>
                <th style={{width: '130px'}} className="p-2 text-right align-middle">입금금액</th>
                <th style={{width: '130px'}} className="p-2 text-right align-middle">미수금액</th>
                <th style={{width: '100px'}} className="p-2 text-center align-middle"><div>청구</div><div>횟수</div></th>
              </tr>
            </thead>
          </table>
        </div>
        {/* --- 바디 (Body) 시작 --- */}
        <div className="overflow-y-auto flex-grow">
          <table className="w-full text-sm text-left table-fixed">
            <tbody className="divide-y divide-separator">
              {filteredBillings.map(item => (
                <tr key={item.id} onClick={() => handleRowClick(item.projectId)} className="hover:bg-tab-hover cursor-pointer divide-x divide-separator">
                  <td style={{width: '80px'}} className="p-2 text-center align-middle">{getStatusChip(item.status)}</td>
                  <td style={{width: '120px'}} className="p-2 text-center font-semibold align-middle">{item.project_no}</td>
                  <td style={{width: '280px'}} className="p-2 align-middle tracking-tighter" title={item.project_name}>{item.project_name.length > 10 ? `${item.project_name.substring(0, 10)}...` : item.project_name}</td>
                  <td style={{width: '280px'}} className="p-2 align-middle tracking-tighter" title={item.client}>{item.client && item.client.length > 10 ? `${item.client.substring(0, 10)}...` : item.client}</td>
                  <td style={{width: '130px'}} className="p-2 text-right font-mono align-middle whitespace-nowrap">{formatCurrency(item.contract_amount)}</td>
                  <td style={{width: '130px'}} className="p-2 text-right font-mono align-middle whitespace-nowrap">{formatCurrency(item.equity_amount)}</td>
                  <td style={{width: '80px'}} className="p-2 text-center font-mono align-middle">{item.equity_rate || 0}%</td>
                  <td style={{width: '80px'}} className="p-2 text-center font-mono align-middle">{item.progress_rate || 0}%</td>
                  <td style={{width: '130px'}} className="p-2 text-right font-mono align-middle whitespace-nowrap">{formatCurrency(item.request_amount)}</td>
                  <td style={{width: '130px'}} className="p-2 text-right font-mono align-middle text-green-500 whitespace-nowrap">{formatCurrency(item.deposit_amount)}</td>
                  <td className={`p-2 w-[130px] text-right font-mono align-middle whitespace-nowrap ${item.outstanding > 0 ? 'text-red-500' : ''}`}>{formatCurrency(item.outstanding)}</td>
                  <td className="p-2 w-[100px] text-center align-middle">{item.request_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default BillingPage;