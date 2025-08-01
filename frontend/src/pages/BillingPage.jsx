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
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
      .then(data => {
        const processedData = data.map(item => {
          let status = '입금';
          if (!item.deposit_date && item.request_date) status = '청구';
          if (item.outstanding > 0) status = '미수';
          if (!item.request_date && item.deposit_date) status = '선입금';
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

  const formatCurrency = (amount) => amount != null ? amount.toLocaleString('ko-KR') + ' 원' : '-';
  const getStatusChip = (status) => { const base = "px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap"; switch (status) { case '미수': return <span className={`${base} bg-red-200 text-red-800`}>미수</span>; case '청구': return <span className={`${base} bg-yellow-200 text-yellow-800`}>청구</span>; case '입금': return <span className={`${base} bg-green-200 text-green-800`}>입금</span>; case '선입금': return <span className={`${base} bg-purple-200 text-purple-800`}>선입금</span>; default: return <span className={`${base} bg-gray-200 text-gray-800`}>{status}</span>; } };
  const handleRowClick = (item) => { console.log("Clicked item:", item); };

  if (loading) return <div className="p-6 text-center text-text-muted">데이터를 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    // [최종 수정] flex-col과 h-full로 전체 레이아웃 구조를 정의
    <div className="flex flex-col h-full">
      {/* 1. 헤더 영역 (고정) */}
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
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

      {/* 2. 테이블 컨테이너 (고정) */}
      <div className="flex-grow overflow-auto bg-card-bg rounded-lg shadow">
        <table className="min-w-full text-sm text-left table-fixed">
          {/* 3. 테이블 헤더 (내용 스크롤 시 상단에 고정) */}
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
                  <td className="w-32 p-3 text-right font-mono align-middle">{formatCurrency(item.contract_amount)}</td>
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
  );
};

export default BillingPage;