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
    // 백엔드에서 모든 계산을 처리하므로, 하나의 API만 호출합니다.
    fetch('http://localhost:5001/api/billing')
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
      .then(data => {
        const processedData = data.map(item => {
          let status = '입금';
          if (item.outstanding > 0) status = '미수';
          else if (!item.deposit_date && item.request_date) status = '청구';
          else if (!item.request_date && item.deposit_date) status = '선입금';
          return { ...item, status };
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

  const formatCurrency = (amount) => amount ? amount.toLocaleString('ko-KR') : '-';
  const getStatusChip = (status) => { /* ... */ };
  const handleRowClick = (item) => { /* ... */ };

  if (loading) return <div className="p-6 text-center text-text-muted">데이터를 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        {/* ... 필터 및 검색창 (이전과 동일) ... */}
      </div>

      <div className="flex-grow overflow-hidden bg-card-bg rounded-lg shadow flex flex-col">
        <div className="overflow-y-auto">
            <table className="min-w-full text-sm text-left table-fixed">
                <thead className="sticky top-0 bg-table-header text-table-header-text uppercase z-10">
                    <tr>
                      <th className="w-20 p-3">상태</th>
                      <th className="w-28 p-3">프로젝트 넘버</th>
                      <th className="p-3">계약명</th>
                      <th className="p-3">발주처</th>
                      <th className="w-32 p-3 text-right">총계약금액</th>
                      <th className="w-32 p-3 text-right">총지분금액</th>
                      <th className="w-20 p-3 text-right">지분율</th>
                      <th className="w-20 p-3 text-right">기성율</th>
                      <th className="w-32 p-3 text-right">청구금액</th>
                      <th className="w-32 p-3 text-right">입금금액</th>
                      <th className="w-32 p-3 text-right">미수금액</th>
                      <th className="w-24 p-3 text-center">청구횟수</th>
                      <th className="w-24 p-3">비고</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-separator">
                {filteredBillings.length > 0 ? (
                    filteredBillings.map(item => (
                    <tr key={item.id} onClick={() => handleRowClick(item)} className="hover:bg-tab-hover cursor-pointer">
                        <td className="w-20 p-3 align-middle">{getStatusChip(item.status)}</td>
                        <td className="w-28 p-3 font-semibold align-middle">{item.project_no}</td>
                        <td className="p-3 align-middle"><div className="truncate" title={item.project_name}>{item.project_name.substring(0, 10)}{item.project_name.length > 10 && '...'}</div></td>
                        <td className="p-3 align-middle"><div className="truncate" title={item.client}>{item.client?.substring(0, 10)}{item.client?.length > 10 && '...'}</div></td>
                        <td className="w-32 p-3 text-right font-mono align-middle">{formatCurrency(item.total_amount)}</td>
                        <td className="w-32 p-3 text-right font-mono align-middle">{formatCurrency(item.equity_amount)}</td>
                        <td className="w-20 p-3 text-right font-mono align-middle">{item.equity_rate || 0}%</td>
                        <td className="w-20 p-3 text-right font-mono align-middle">{item.progress_rate || 0}%</td>
                        <td className="w-32 p-3 text-right font-mono align-middle">{formatCurrency(item.request_amount)}</td>
                        <td className="w-32 p-3 text-right font-mono align-middle text-green-500">{formatCurrency(item.deposit_amount)}</td>
                        <td className={`w-32 p-3 text-right font-mono align-middle ${item.outstanding > 0 ? 'text-red-500' : ''}`}>{formatCurrency(item.outstanding)}</td>
                        <td className="w-24 p-3 text-center align-middle">{item.request_count}</td>
                        <td className="w-24 p-3 align-middle"><div className="truncate" title={item.note}>{item.note}</div></td>
                    </tr>
                    ))
                ) : (
                    <tr><td colSpan="13" className="text-center p-8 text-text-muted">조회된 내역이 없습니다.</td></tr>
                )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;