// frontend/src/pages/BillingPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const BillingPage = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState('전체'); // 전체, 청구, 입금 완료, 계산서 발행, 미수
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/billing')
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
      .then(data => {
        // 서버에서 받은 데이터에 프론트엔드용 '상태'를 추가
        const processedData = data.map(item => {
          let status = '입금 완료';
          if (item.outstanding > 0) status = '미수';
          else if (!item.deposit_date) status = '청구';
          // '계산서 발행' 상태는 tax_invoice_date 필드가 추가된 후 구현
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
      .filter(b => {
        if (statusFilter === '전체') return true;
        return b.status === statusFilter;
      })
      .filter(b => {
        if (searchTerm.trim() === '') return true;
        const term = searchTerm.toLowerCase();
        return (
          b.project_no.toLowerCase().includes(term) ||
          b.project_name.toLowerCase().includes(term) ||
          b.client.toLowerCase().includes(term)
        );
      });
  }, [billings, statusFilter, searchTerm]);

  const formatCurrency = (amount) => amount ? amount.toLocaleString('ko-KR') + ' 원' : '-';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ko-KR') : '-';
  
  const getStatusChip = (status) => {
    switch (status) {
      case '미수': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-800">미수</span>;
      case '청구': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800">청구</span>;
      case '입금 완료': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">입금 완료</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">{status}</span>;
    }
  };


  if (loading) return <div className="p-6 text-center text-text-muted">데이터를 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm focus:ring-accent focus:border-accent"
          >
            <option value="전체">상태 (전체)</option>
            <option value="청구">청구</option>
            <option value="입금 완료">입금 완료</option>
            <option value="미수">미수</option>
            {/* <option value="계산서 발행">계산서 발행</option> */}
          </select>
          <input
            type="text"
            placeholder="프로젝트 넘버/용역명/발주처 검색..."
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
              <th className="w-32 p-3">Project NO</th>
              <th className="p-3">용역명</th>
              <th className="w-48 p-3">발주처</th>
              <th className="w-32 p-3">청구일</th>
              <th className="w-32 p-3 text-right">청구금액</th>
              <th className="w-32 p-3">입금일</th>
              <th className="w-32 p-3 text-right">입금금액</th>
              <th className="w-32 p-3 text-right">미수금</th>
            </tr>
          </thead>
        </table>
        <div className="overflow-y-auto flex-grow">
          <table className="min-w-full text-sm text-left table-fixed">
            <tbody className="divide-y divide-separator">
              {filteredBillings.length > 0 ? (
                filteredBillings.map(item => (
                  <tr key={item.id} className="hover:bg-tab-hover">
                    <td className="w-24 p-3 align-middle">{getStatusChip(item.status)}</td>
                    <td className="w-32 p-3 font-semibold align-middle">{item.project_no}</td>
                    <td className="p-3 align-middle"><div className="truncate" title={item.project_name}>{item.project_name}</div></td>
                    <td className="w-48 p-3 align-middle"><div className="truncate" title={item.client}>{item.client}</div></td>
                    <td className="w-32 p-3 align-middle">{formatDate(item.request_date)}</td>
                    <td className="w-32 p-3 text-right font-mono align-middle">{formatCurrency(item.request_amount)}</td>
                    <td className="w-32 p-3 align-middle">{formatDate(item.deposit_date)}</td>
                    <td className="w-32 p-3 text-right font-mono align-middle">{formatCurrency(item.deposit_amount)}</td>
                    <td className={`w-32 p-3 text-right font-mono align-middle ${item.outstanding > 0 ? 'text-red-500' : ''}`}>{formatCurrency(item.outstanding)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center p-8 text-text-muted">
                    조회된 내역이 없습니다.
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

export default BillingPage;