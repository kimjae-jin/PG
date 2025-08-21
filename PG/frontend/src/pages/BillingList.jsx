import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ColumnSelector from '../components/ColumnSelector';

// (임시 아이콘)
const ListBulletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const Squares2X2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;

// [핵심 수정] '프로젝트 넘버' 헤더를 'P.N.'으로 변경
const ALL_COLUMNS = { 
  status: { header: '상태', width: '6rem', align: 'center' }, 
  projectIdentifier: { header: 'P.N.', width: '8rem', align: 'center' }, 
  projectName: { header: '계약명', width: '20rem' }, 
  clientName: { header: '발주처', width: '12rem' }, 
  invoiceAmount: { header: '청구금액', width: '10rem', align: 'right' }, 
  paymentAmount: { header: '입금금액', width: '10rem', align: 'right' }, 
  balance: { header: '미수금액', width: '10rem', align: 'right' }, 
  invoiceDate: { header: '청구일', width: '8rem', align: 'center' }, 
  paymentDate: { header: '입금일', width: '8rem', align: 'center' }, 
  taxInvoiceDate: { header: '세금계산서 발행일', width: '10rem', align: 'center' },
};

const FIXED_COLUMNS = ['status', 'projectIdentifier'];
const getInitialVisibleColumns = () => ({ status: true, projectIdentifier: true, projectName: true, clientName: true, invoiceAmount: true, paymentAmount: true, balance: true, invoiceDate: true, paymentDate: true, taxInvoiceDate: true,});
const LOCAL_STORAGE_KEY_COLUMNS = 'billingPage_visibleColumns_v4';
const LOCAL_STORAGE_KEY_VIEW = 'billingPage_viewMode';

const BillingList = () => {
  // (모든 state 선언과 로직 함수들은 이전과 100% 동일합니다)
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState(() => localStorage.getItem(LOCAL_STORAGE_KEY_VIEW) || 'list');
  const [visibleColumns, setVisibleColumns] = useState(() => { try { const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COLUMNS); return saved ? JSON.parse(saved) : getInitialVisibleColumns(); } catch(e) { return getInitialVisibleColumns(); }});
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_COLUMNS, JSON.stringify(visibleColumns));}, [visibleColumns]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_VIEW, viewMode);}, [viewMode]);
  useEffect(() => { fetch('http://localhost:5001/api/billing').then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.')).then(data => { setBillings(data); setLoading(false); }).catch(err => { setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.'); setLoading(false); });}, []);
  const getBillingStatus = (billing) => { if (!billing.invoiceDate) return '대기'; if (billing.balance != null && billing.balance <= 0) return '완료'; const today = new Date(); const invoiceDate = new Date(billing.invoiceDate); const daysDiff = (today - invoiceDate) / (1000 * 60 * 60 * 24); if (daysDiff > 60) return '장기미수'; if (daysDiff > 30) return '미수'; return '청구';};
  const processedBillings = useMemo(() => billings.map(b => ({ ...b, status: getBillingStatus(b),})), [billings]);
  const filteredBillings = useMemo(() => processedBillings.filter(b => statusFilter === '전체' || b.status === statusFilter).filter(b => { if (!searchTerm.trim()) return true; const term = searchTerm.toLowerCase(); return (b.projectIdentifier && String(b.projectIdentifier).toLowerCase().includes(term)) || (b.projectName && b.projectName.toLowerCase().includes(term)) || (b.clientName && b.clientName.toLowerCase().includes(term));}), [processedBillings, searchTerm, statusFilter]);
  const handleSelectAll = (e) => { if (e.target.checked) setSelectedRows(new Set(filteredBillings.map(b => b.projectId))); else setSelectedRows(new Set()); };
  const handleSelectRow = (id) => { const newSelectedRows = new Set(selectedRows); if (newSelectedRows.has(id)) newSelectedRows.delete(id); else newSelectedRows.add(id); setSelectedRows(newSelectedRows); };
  const formatCurrency = (amount) => amount != null ? `${(amount).toLocaleString('ko-KR')}` : '0';
  const getStatusBadge = (status) => { switch(status) { case '완료': return 'bg-blue-500/20 text-blue-300'; case '청구': return 'bg-green-500/20 text-green-300'; case '미수': return 'bg-yellow-500/20 text-yellow-300'; case '장기미수': return 'bg-red-500/20 text-red-400 font-bold'; default: return 'bg-gray-500/20 text-gray-400'; }};
  const renderCellContent = (billing, colKey) => { const value = billing[colKey]; if (colKey === 'status') { return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)}`}>{value}</span>; } if (value === null || value === undefined) return '-'; switch(colKey) { case 'invoiceAmount': case 'paymentAmount': case 'balance': return `${formatCurrency(value)} 원`; default: return value; }};
  const isAllSelected = filteredBillings.length > 0 && selectedRows.size === filteredBillings.length;

  if (loading) return <div className="p-6 text-center text-text-muted">재무 사령부 데이터를 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow overflow-hidden">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm">
                <option value="전체">상태 (전체)</option><option value="청구">청구</option><option value="미수">미수</option><option value="장기미수">장기미수</option><option value="완료">완료</option>
            </select>
            <input type="text" placeholder="P.N./계약명/발주처 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-input-bg border border-separator rounded-md p-0.5">
              <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-accent text-white' : 'text-text-muted'}`}><ListBulletIcon /></button>
              <button onClick={() => setViewMode('card')} className={`p-1 rounded ${viewMode === 'card' ? 'bg-accent text-white' : 'text-text-muted'}`}><Squares2X2Icon /></button>
            </div>
            <ColumnSelector allColumns={ALL_COLUMNS} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} fixedColumns={FIXED_COLUMNS}/>
            <button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover">+ 신규 등록</button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="flex-grow overflow-auto">
            <table className="text-sm text-left" style={{ minWidth: '1200px' }}>
              <thead className="sticky top-0 bg-table-header text-table-header-text uppercase z-10">
                <tr>
                  <th style={{ width: '3rem' }} className="p-2 text-center border-b border-separator"><input type="checkbox" onChange={handleSelectAll} checked={isAllSelected}/></th>
                  {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
                    <th key={colKey} style={{ width: ALL_COLUMNS[colKey].width }} className={`p-2 whitespace-nowrap border-b border-separator text-${ALL_COLUMNS[colKey].align || 'left'}`}>
                      {ALL_COLUMNS[colKey].header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-separator">
                {filteredBillings.length === 0 ? (
                  <tr><td colSpan={Object.values(visibleColumns).filter(v => v).length + 1} className="p-6 text-center text-text-muted">표시할 청구 내역이 없습니다.</td></tr>
                ) : (
                  filteredBillings.map(billing => (
                    <tr key={billing.projectId} onDoubleClick={() => navigate(`/projects/${billing.projectId}?tab=finance`)} className="hover:bg-tab-hover cursor-pointer">
                      <td className="p-2 text-center"><input type="checkbox" checked={selectedRows.has(billing.projectId)} onChange={() => handleSelectRow(billing.projectId)} onClick={(e) => e.stopPropagation()}/></td>
                      {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
                        <td key={colKey} className={`p-2 whitespace-nowrap overflow-hidden text-ellipsis text-${ALL_COLUMNS[colKey].align || 'left'}`} title={billing[colKey]}>
                          {renderCellContent(billing, colKey)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-grow overflow-auto p-4">
            {/* 카드 보기 로직은 변경 없음 */}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingList;