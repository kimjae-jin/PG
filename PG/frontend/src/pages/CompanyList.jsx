import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, List, LayoutGrid } from 'lucide-react';
import ColumnSelector from '../components/ColumnSelector';
import CompanyCard from '../components/CompanyCard';

const ALL_COLUMNS = {
  status: { header: '상태', width: '6rem' },
  name: { header: '거래처명', width: '15rem' },
  registration_number: { header: '사업자번호', width: '10rem' },
  ceo_name: { header: '대표자', width: '8rem' },
  phone_number: { header: '대표 연락처', width: '11rem' },
  work_manager_name: { header: '업무 담당자', width: '8rem' },
  transaction_count: { header: '거래 횟수', width: '6rem' },
  address: { header: '소재지', width: '20rem' },
  corporate_number: { header: '법인번호', width: '10rem' },
};

const FIXED_COLUMNS = ['status'];

const LOCAL_STORAGE_KEYS = {
  visibleColumns: 'companiesPage_visibleColumns_v1',
  viewMode: 'companiesPage_viewMode_v1',
};

const getInitialVisibleColumns = () => ({
  status: true, name: true, registration_number: true, ceo_name: true,
  phone_number: true, work_manager_name: true, transaction_count: true,
  address: false, corporate_number: false,
});

const TableColGroup = ({ visibleColumns }) => (
  <colgroup>
    <col style={{ width: '3rem' }} /> {/* 체크박스 컬럼 */}
    {Object.keys(ALL_COLUMNS).map(key => visibleColumns[key] && (
      <col key={key} style={{ width: ALL_COLUMNS[key].width }} />
    ))}
  </colgroup>
);


const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem(LOCAL_STORAGE_KEYS.viewMode) || 'list');
  const [visibleColumns, setVisibleColumns] = useState(getInitialVisibleColumns);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5001/api/companies')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Network response was not ok.')))
      .then(data => { setCompanies(data); setLoading(false); })
      .catch(err => { setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.'); setLoading(false); });
  }, []);

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.visibleColumns, JSON.stringify(visibleColumns)); }, [visibleColumns]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.viewMode, viewMode); }, [viewMode]);

  const filteredCompanies = useMemo(() => {
    let data = companies;
    if (showOnlySelected) data = data.filter(c => selectedRows.has(c.id));
    
    return data
      .filter(c => statusFilter === '전체' || c.status === statusFilter)
      .filter(c => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (c.name && c.name.toLowerCase().includes(term)) ||
               (c.registration_number && c.registration_number.includes(term)) ||
               (c.ceo_name && c.ceo_name.toLowerCase().includes(term));
      });
  }, [companies, searchTerm, statusFilter, selectedRows, showOnlySelected]);

  const handleSelectRow = (id) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) newSelectedRows.delete(id);
    else newSelectedRows.add(id);
    setSelectedRows(newSelectedRows);
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(new Set(filteredCompanies.map(c => c.id)));
    else setSelectedRows(new Set());
  };

  const isAllSelected = filteredCompanies.length > 0 && selectedRows.size === filteredCompanies.length;
  
  const getStatusBadge = (status) => {
    switch(status) {
      case '정상': return 'bg-green-500/20 text-green-300';
      case '휴업': return 'bg-yellow-500/20 text-yellow-300';
      case '폐업': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) return <div className="p-6 text-center text-text-muted">관계사 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-transparent p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow-lg">
        {/* 컨트롤 바 */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <input type="text" placeholder="거래처명, 사업자번호, 대표자 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm">
              <option value="전체">상태 (전체)</option><option value="정상">정상</option><option value="휴업">휴업</option><option value="폐업">폐업</option>
            </select>
            <div className="flex items-center space-x-1"><input type="checkbox" id="showOnlySelectedCo" checked={showOnlySelected} onChange={(e) => setShowOnlySelected(e.target.checked)} className="h-4 w-4 rounded"/><label htmlFor="showOnlySelectedCo" className="text-sm text-text-muted cursor-pointer">선택 항목만</label></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-input-bg border border-separator rounded-md p-1">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent text-white' : 'text-text-muted hover:bg-gray-700'}`}><List size={18} /></button>
              <button onClick={() => setViewMode('card')} className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-accent text-white' : 'text-text-muted hover:bg-gray-700'}`}><LayoutGrid size={18} /></button>
            </div>
            {viewMode === 'list' && <ColumnSelector allColumns={ALL_COLUMNS} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} fixedColumns={FIXED_COLUMNS}/>}
            <Link to="/companies/new"><button className="flex items-center bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover"><Plus size={16} className="mr-1"/> 신규 등록</button></Link>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        {viewMode === 'list' ? (
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-shrink-0 overflow-x-auto">
              <table className="w-full text-sm text-left table-fixed">
                <TableColGroup visibleColumns={visibleColumns} />
                <thead className="bg-table-header text-table-header-text uppercase">
                  <tr>
                    <th className="p-2 text-center"><input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} /></th>
                    {Object.keys(ALL_COLUMNS).map(key => visibleColumns[key] && <th key={key} className="p-2 text-center whitespace-nowrap">{ALL_COLUMNS[key].header}</th>)}
                  </tr>
                </thead>
              </table>
            </div>
            <div className="flex-grow overflow-auto">
              <table className="w-full text-sm text-left table-fixed">
                <TableColGroup visibleColumns={visibleColumns} />
                <tbody className="divide-y divide-separator">
                  {filteredCompanies.map(company => (
                    <tr key={company.id} onDoubleClick={() => navigate(`/companies/${company.id}`)} className="hover:bg-tab-hover cursor-pointer">
                      <td className="p-2 text-center"><input type="checkbox" checked={selectedRows.has(company.id)} onChange={() => handleSelectRow(company.id)} onClick={e => e.stopPropagation()} /></td>
                      {Object.keys(ALL_COLUMNS).map(key => visibleColumns[key] && (
                        <td key={key} className="p-2 whitespace-nowrap overflow-hidden text-ellipsis text-center" title={company[key]}>
                          {key === 'status' ? <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(company.status)}`}>{company.status}</span> : company[key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex-grow overflow-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCompanies.map(company => (
                <CompanyCard key={company.id} company={company} isSelected={selectedRows.has(company.id)} onSelect={handleSelectRow} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyList;