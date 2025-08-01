import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ColumnSelector from '../components/ColumnSelector';

const ALL_COLUMNS = {
  status: { header: '상태', width: '5rem' },
  project_no: { header: '프로젝트 넘버', width: '8rem' },
  project_name: { header: '계약명', width: '20rem' },
  client: { header: '발주처', width: '12rem' },
  progress_rate: { header: '기성율', width: '5rem' },
  request_amount: { header: '청구금액', width: '10rem' },
  deposit_amount: { header: '입금금액', width: '10rem' },
  outstanding: { header: '미수금액', width: '10rem' },
  request_count: { header: '횟수', width: '4rem' },
  contract_amount: { header: '총 계약 금액', width: '10rem' },
  equity_amount: { header: '총 지분 금액', width: '10rem' },
};

const FIXED_COLUMNS = ['status', 'project_no'];

const getInitialVisibleColumns = () => {
  return {
    status: true, project_no: true, project_name: true, client: true,
    progress_rate: true, request_amount: true, deposit_amount: true,
    outstanding: true, request_count: true, contract_amount: false,
    equity_amount: false,
  };
};

const LOCAL_STORAGE_KEY = 'billingPage_visibleColumns_v1';

const TableColGroup = ({ visibleColumns }) => (
  <colgroup>
    <col style={{ width: '3rem' }} />
    {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
      <col key={colKey} style={{ width: ALL_COLUMNS[colKey].width }} />
    ))}
  </colgroup>
);

const BillingPage = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showOnlySelected, setShowOnlySelected] = useState(false);
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
    fetch('http://localhost:5001/api/billing')
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
      .then(data => { setBillings(data); setLoading(false); })
      .catch(err => { setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.'); setLoading(false); });
  }, []);
  
  const filteredBillings = useMemo(() => {
    let data = [...billings];
    if (showOnlySelected) {
      data = data.filter(b => selectedRows.has(b.id));
    }
    return data
      .filter(b => statusFilter === '전체' || b.status === statusFilter)
      .filter(b => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (b.project_no && b.project_no.toLowerCase().includes(term)) || 
               (b.project_name && b.project_name.toLowerCase().includes(term)) || 
               (b.client && b.client.toLowerCase().includes(term));
      });
  }, [billings, searchTerm, statusFilter, selectedRows, showOnlySelected]);
  
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

  const formatCurrency = (amount) => amount != null ? `${amount.toLocaleString('ko-KR')}\u00A0원` : '-';
  
  const getStatusBadge = (status) => {
    switch(status) {
      case '입금': return 'bg-blue-200 text-blue-800';
      case '미수': return 'bg-yellow-200 text-yellow-800';
      case '장기미수': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const renderCellContent = (billing, colKey) => {
    const value = billing[colKey];
    switch(colKey) {
      case 'status':
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)}`}>{value}</span>;
      case 'progress_rate':
        return `${value || 0}%`;
      case 'request_amount':
      case 'deposit_amount':
      case 'contract_amount':
      case 'equity_amount':
        return formatCurrency(value);
      case 'outstanding':
        return <span className={value !== 0 ? 'text-red-500' : ''}>{formatCurrency(value)}</span>;
      default:
        return value;
    }
  };
  
  const isAllSelected = filteredBillings.length > 0 && selectedRows.size === filteredBillings.length;

  if (loading) return <div className="p-6 text-center text-text-muted">청구/입금 내역을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-text-muted">{error}</div>;

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm">
              <option value="전체">상태 (전체)</option>
              <option value="입금">입금</option>
              <option value="미수">미수</option>
              <option value="장기미수">장기미수</option>
            </select>
            <div className="flex items-center space-x-1">
              <input type="checkbox" id="showOnlySelectedBilling" checked={showOnlySelected} onChange={(e) => setShowOnlySelected(e.target.checked)} className="h-4 w-4 rounded"/>
              <label htmlFor="showOnlySelectedBilling" className="text-sm text-text-muted cursor-pointer">선택 항목만 보기</label>
            </div>
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
                  <th className="p-2 text-center">
                    <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} className="h-4 w-4 rounded"/>
                  </th>
                  {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
                    <th key={colKey} className="p-2 text-center whitespace-nowrap">
                      {ALL_COLUMNS[colKey].header}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          
          <div className="flex-grow overflow-auto">
            <table className="w-full text-sm text-left table-fixed">
              <TableColGroup visibleColumns={visibleColumns} />
              <tbody>
                {filteredBillings.map(billing => (
                  <tr key={billing.id} className="hover:bg-tab-hover">
                    <td className="p-2 text-center">
                      <input type="checkbox" checked={selectedRows.has(billing.id)} onChange={() => handleSelectRow(billing.id)} onClick={(e) => e.stopPropagation()} className="h-4 w-4 rounded"/>
                    </td>
                    {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
                      <td key={colKey} onClick={() => navigate(`/projects/${billing.project_id}`)} className={`p-2 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer ${['request_amount', 'deposit_amount', 'outstanding', 'contract_amount', 'equity_amount'].includes(colKey) ? 'text-right font-mono' : 'text-center'}`} title={billing[colKey]}>
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

export default BillingPage;