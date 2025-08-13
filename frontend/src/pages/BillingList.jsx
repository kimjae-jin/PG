import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ColumnSelector from '../components/ColumnSelector';

// 컬럼 정의는 이전과 동일합니다.
const ALL_COLUMNS = {
  status: { header: '상태', width: '6rem', align: 'center' },
  project_no: { header: '프로젝트 넘버', width: '8rem', align: 'center' },
  project_name: { header: '계약명', width: '20rem' },
  client: { header: '발주처', width: '12rem' },
  progress_rate: { header: '기성율', width: '5rem', align: 'center' },
  request_amount: { header: '청구금액', width: '10rem', align: 'right' },
  deposit_amount: { header: '입금금액', width: '10rem', align: 'right' },
  outstanding: { header: '미수금액', width: '10rem', align: 'right' },
  request_count: { header: '횟수', width: '4rem', align: 'center' },
  contract_amount: { header: '총 계약 금액', width: '10rem', align: 'right' },
  equity_amount: { header: '총 지분 금액', width: '10rem', align: 'right' },
};

const FIXED_COLUMNS = ['status', 'project_no'];

const getInitialVisibleColumns = () => ({
  status: true, project_no: true, project_name: true, client: true,
  progress_rate: true, request_amount: true, deposit_amount: true,
  outstanding: true, request_count: true, contract_amount: true,
  equity_amount: true,
});

const LOCAL_STORAGE_KEY = 'billingPage_visibleColumns_v2';

const TableColGroup = ({ visibleColumns }) => (
  <colgroup>
    <col style={{ width: '3rem' }} />
    {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
      <col key={colKey} style={{ width: ALL_COLUMNS[colKey].width }} />
    ))}
  </colgroup>
);

const BillingList = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const navigate = useNavigate();

  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : getInitialVisibleColumns();
    } catch(e) {
      return getInitialVisibleColumns();
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    // [핵심 복원] 원래의 올바른 API 엔드포인트인 /api/billing을 호출합니다.
    fetch('http://localhost:5001/api/billing')
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
      .then(data => { 
        setBillings(data); 
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
        return (b.project_no && String(b.project_no).toLowerCase().includes(term)) || 
               (b.project_name && b.project_name.toLowerCase().includes(term)) || 
               (b.client && b.client.toLowerCase().includes(term));
      });
  }, [billings, searchTerm, statusFilter]);
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(filteredBillings.map(b => b.id)));
    } else {
      setSelectedRows(new Set());
    }
  };
  
  const handleSelectRow = (id) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
  };

  const formatCurrency = (amount) => amount != null ? `${(amount).toLocaleString('ko-KR')}` : '0';
  
  // [핵심 복원] 재무 상태에 맞는 상태 배지
  const getStatusBadge = (status) => {
    switch(status) {
      case '입금완료': return 'bg-blue-500/20 text-blue-300';
      case '미수': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const renderCellContent = (billing, colKey) => {
    const value = billing[colKey];
    if (value === null || value === undefined) return '-';
    
    switch(colKey) {
      case 'status':
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)}`}>{value}</span>;
      case 'progress_rate':
        return `${value}%`;
      case 'request_amount':
      case 'deposit_amount':
      case 'contract_amount':
      case 'equity_amount':
        return `${formatCurrency(value)} 원`;
      case 'outstanding':
        return <span className={value > 0 ? 'text-red-400' : ''}>{formatCurrency(value)} 원</span>;
      default:
        return value;
    }
  };
  
  const isAllSelected = billings.length > 0 && selectedRows.size === billings.length;

  if (loading) return <div className="p-6 text-center text-text-muted">청구/입금 내역을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;
  if (!loading && billings.length === 0) return <div className="p-6 text-center text-text-muted">표시할 청구 내역이 없습니다.</div>;

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm">
                <option value="전체">상태 (전체)</option>
                <option value="미수">미수</option>
                <option value="입금완료">입금완료</option>
            </select>
            <input type="text" placeholder="프로젝트 넘버/계약명/발주처 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm" />
          </div>
           <div className="flex items-center space-x-2">
            <ColumnSelector allColumns={ALL_COLUMNS} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} fixedColumns={FIXED_COLUMNS}/>
            <button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover">+ 신규 등록</button>
          </div>
        </div>
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-shrink-0 overflow-x-auto">
            <table className="w-full text-sm text-left table-fixed">
              <TableColGroup visibleColumns={visibleColumns} />
              <thead className="bg-table-header text-table-header-text uppercase">
                <tr>
                  <th className="p-2 text-center"><input type="checkbox" onChange={handleSelectAll} checked={isAllSelected}/></th>
                  {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
                    <th key={colKey} className="p-2 text-center whitespace-nowrap">{ALL_COLUMNS[colKey].header}</th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <div className="flex-grow overflow-auto">
            <table className="w-full text-sm text-left table-fixed">
              <TableColGroup visibleColumns={visibleColumns} />
              <tbody className="divide-y divide-separator">
                {filteredBillings.map(billing => (
                  <tr key={billing.id} onDoubleClick={() => navigate(`/projects/${billing.project_id}?tab=finance`)} className="hover:bg-tab-hover cursor-pointer">
                    <td className="p-2 text-center"><input type="checkbox" checked={selectedRows.has(billing.id)} onChange={() => handleSelectRow(billing.id)} onClick={(e) => e.stopPropagation()}/></td>
                    {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
                      <td key={colKey} className={`p-2 whitespace-nowrap overflow-hidden text-ellipsis text-${ALL_COLUMNS[colKey].align || 'left'}`} title={billing[colKey]}>
                        {renderCellContent(billing, colKey)}
                      </td>
                    ))}
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

export default BillingList;