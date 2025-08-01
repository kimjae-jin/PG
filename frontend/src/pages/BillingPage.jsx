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
      .catch(err => {
        setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.');
        setLoading(false);
      });
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
  const handleRowClick = (projectId) => {
    if(projectId) navigate(`/projects/${projectId}`);
  };

  if (loading) return <div className="p-6 text-center text-text-muted">데이터를 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        {/* ... 필터 및 검색창 (이전과 동일) ... */}
      </div>
      
      <div className="flex-grow overflow-hidden bg-card-bg rounded-lg shadow flex flex-col">
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
                <th className="p-3 font-semibold w-32 text-right">청구금액</th>
                <th className="p-3 font-semibold w-32 text-right">입금금액</th>
                <th className="p-3 font-semibold w-32 text-right">미수금액</th>
                <th className="p-3 font-semibold w-24 text-center"><div>청구</div><div>횟수</div></th>
                <th className="p-3 font-semibold w-24">비고</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="overflow-auto flex-grow">
          <table className="min-w-full text-sm text-left">
            <tbody className="divide-y divide-separator">
              {filteredBillings.map(item => (
                <tr key={item.id} onClick={() => handleRowClick(item.projectId)} className="hover:bg-tab-hover cursor-pointer">
                  <td className="p-3 align-middle sticky left-0 bg-card-bg hover:bg-tab-hover w-20">{getStatusChip(item.status)}</td>
                  <td className="p-3 font-semibold align-middle w-28">{item.project_no}</td>
                  <td className="p-3 align-middle min-w-[200px]"><div className="w-24 truncate" title={item.project_name}>{item.project_name}</div></td>
                  <td className="p-3 align-middle min-w-[200px]"><div className="w-24 truncate" title={item.client}>{item.client}</div></td>
                  <td className="p-3 text-right font-mono align-middle w-32 whitespace-nowrap">{formatCurrency(item.contract_amount)}</td>
                  <td className="p-3 text-right font-mono align-middle w-32 whitespace-nowrap">{formatCurrency(item.equity_amount)}</td>
                  <td className="p-3 text-right font-mono align-middle w-20">{item.equity_rate || 0}%</td>
                  <td className="p-3 text-right font-mono align-middle w-20">{item.progress_rate || 0}%</td>
                  <td className="p-3 text-right font-mono align-middle w-32 whitespace-nowrap">{formatCurrency(item.request_amount)}</td>
                  <td className="p-3 text-right font-mono align-middle text-green-500 w-32 whitespace-nowrap">{formatCurrency(item.deposit_amount)}</td>
                  <td className={`p-3 text-right font-mono align-middle w-32 whitespace-nowrap ${item.outstanding > 0 ? 'text-red-500' : ''}`}>{formatCurrency(item.outstanding)}</td>
                  <td className="p-3 text-center align-middle w-24">{item.request_count}</td>
                  <td className="p-3 align-middle w-24"><div className="truncate" title={item.note}>{item.note}</div></td>
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