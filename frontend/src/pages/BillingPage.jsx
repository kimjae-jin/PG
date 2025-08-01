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
    fetch('http://localhost:5001/api/billing')
      .then(res => res.ok ? res.json() : Promise.reject('Billing API Error'))
      .then(billingData => {
        fetch('http://localhost:5001/api/projects')
            .then(res => res.ok ? res.json() : Promise.reject('Projects API Error'))
            .then(projectData => {
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
    // [수정] 페이지 최상위 div에 여백(p-4 md:p-6)을 직접 적용
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator">
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
        
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-shrink-0">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-table-header text-table-header-text uppercase">
                <tr>
                  <th className="p-2 text-center align-middle" style={{ width: '4rem' }}>상태</th>
                  <th className="p-2 text-center align-middle" style={{ width: '7rem' }}>프로젝트 넘버</th>
                  <th className="p-2 align-middle">계약명</th>
                  <th className="p-2 align-middle">발주처</th>
                  <th className="p-2 text-right align-middle" style={{ width: '8rem' }}>총 계약 금액</th>
                  <th className="p-2 text-right align-middle" style={{ width: '8rem' }}>총 지분 금액</th>
                  <th className="p-2 text-center align-middle" style={{ width: '5rem' }}>기성율</th>
                  <th className="p-2 text-right align-middle" style={{ width: '7rem' }}>청구금액</th>
                  <th className="p-2 text-right align-middle" style={{ width: '7rem' }}>입금금액</th>
                  <th className="p-2 text-right align-middle" style={{ width: '7rem' }}>미수금액</th>
                  <th className="p-2 text-center align-middle" style={{ width: '4rem' }}>횟수</th>
                </tr>
              </thead>
            </table>
          </div>

          <div className="flex-grow overflow-y-auto">
            <table className="w-full text-sm text-left table-fixed">
              <tbody className="divide-y divide-separator">
                {filteredBillings.map(item => (
                  <tr key={item.id} onClick={() => handleRowClick(item.projectId)} className="hover:bg-tab-hover cursor-pointer">
                    <td className="p-2 text-center align-middle" style={{ width: '4rem' }}>{getStatusChip(item.status)}</td>
                    <td className="p-2 text-center font-semibold align-middle" style={{ width: '7rem' }}>{item.project_no}</td>
                    <td className="p-2 align-middle whitespace-nowrap overflow-hidden text-ellipsis" title={item.project_name}>{item.project_name}</td>
                    <td className="p-2 align-middle whitespace-nowrap overflow-hidden text-ellipsis" title={item.client}>{item.client}</td>
                    <td className="p-2 text-right font-mono align-middle whitespace-nowrap" style={{ width: '8rem' }}>{formatCurrency(item.contract_amount)}</td>
                    <td className="p-2 text-right font-mono align-middle whitespace-nowrap" style={{ width: '8rem' }}>{formatCurrency(item.equity_amount)}</td>
                    <td className="p-2 text-center font-mono align-middle" style={{ width: '5rem' }}>{item.progress_rate || 0}%</td>
                    <td className="p-2 text-right font-mono align-middle whitespace-nowrap" style={{ width: '7rem' }}>{formatCurrency(item.request_amount)}</td>
                    <td className="p-2 text-right font-mono align-middle text-green-500 whitespace-nowrap" style={{ width: '7rem' }}>{formatCurrency(item.deposit_amount)}</td>
                    <td className={`p-2 text-right font-mono align-middle whitespace-nowrap ${item.outstanding > 0 ? 'text-red-500' : ''}`} style={{ width: '7rem' }}>{formatCurrency(item.outstanding)}</td>
                    <td className="p-2 text-center align-middle" style={{ width: '4rem' }}>{item.request_count}</td>
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
export default BillingPage;