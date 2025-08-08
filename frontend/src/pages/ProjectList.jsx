import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { List, LayoutGrid, ArrowUpDown, Plus } from 'lucide-react';
import ColumnSelector from '../components/ColumnSelector';
import ProjectCard from '../components/ProjectCard';

const ALL_COLUMNS = {
  status: { header: '상태', width: '6rem', sortable: true },
  project_no: { header: 'P.No', width: '8rem', sortable: true },
  project_name: { header: '계약명', width: '25rem', sortable: true },
  client: { header: '발주처', width: '12rem', sortable: true },
  contract_date: { header: '계약일', width: '8rem', sortable: true },
  start_date: { header: '착수일', width: '8rem', sortable: true },
  end_date: { header: '완료예정일', width: '8rem', sortable: true },
  manager: { header: 'PM', width: '6rem', sortable: true },
  contract_amount: { header: '계약금액', width: '10rem', sortable: true },
  equity_rate: { header: '지분율', width: '6rem', sortable: true },
  progress_rate: { header: '기성율', width: '6rem', sortable: true },
  balance: { header: '잔금', width: '10rem', sortable: true },
  request_count: { header: '청구횟수', width: '6rem', sortable: true },
};
const FIXED_COLUMNS = ['status', 'project_no'];
const LOCAL_STORAGE_KEYS = {
  visibleColumns: 'projectList_vFinale_2',
  viewMode: 'projectList_vFinale_2',
  sortConfig: 'projectList_vFinale_2',
};

const getInitialVisibleColumns = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.visibleColumns);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  const isMobile = window.innerWidth < 768;
  const base = { status: true, project_no: true, project_name: !isMobile };
  return { ...ALL_COLUMNS, ...base, ...Object.keys(ALL_COLUMNS).reduce((acc, key) => ({...acc, [key]: !isMobile}), {})};
};

const ProjectList = () => {
  const [projects, setProjects] = useState([]); const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); const [statusFilter, setStatusFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState(''); const [selectedRows, setSelectedRows] = useState(new Set());
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(getInitialVisibleColumns);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem(LOCAL_STORAGE_KEYS.viewMode) || 'list');
  const [sortConfig, setSortConfig] = useState(() => { try { const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.sortConfig); return saved ? JSON.parse(saved) : { key: 'start_date', direction: 'desc' }; } catch (e) { return { key: 'start_date', direction: 'desc' }; } });
  const navigate = useNavigate();

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.visibleColumns, JSON.stringify(visibleColumns)); }, [visibleColumns]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.viewMode, viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.sortConfig, JSON.stringify(sortConfig)); }, [sortConfig]);

  useEffect(() => {
    fetch('http://localhost:5001/api/projects')
      .then(res => res.ok ? res.json() : Promise.reject('Network error'))
      .then(data => { setProjects(data); setLoading(false); })
      .catch(err => { setError('데이터 로딩 실패'); setLoading(false); });
  }, []);

  const sortedAndFilteredProjects = useMemo(() => {
    let data = [...projects];
    if (showOnlySelected) data = data.filter(p => selectedRows.has(p.id));
    data = data.filter(p => statusFilter === '전체' || p.status === statusFilter)
      .filter(p => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return ['project_no', 'project_name', 'client', 'manager'].some(key => p[key] && String(p[key]).toLowerCase().includes(term));
      });
    if (sortConfig.key) {
      data.sort((a, b) => {
        const valA = a[sortConfig.key] || ''; const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [projects, statusFilter, searchTerm, selectedRows, showOnlySelected, sortConfig]);

  const requestSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  const handleSelectAll = (e) => setSelectedRows(e.target.checked ? new Set(sortedAndFilteredProjects.map(p => p.id)) : new Set());
  const handleSelectRow = (id) => setSelectedRows(prev => { const newSet = new Set(prev); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); return newSet; });
  
  const formatCurrency = (amount) => amount ? `${Math.round(amount / 10000).toLocaleString('ko-KR')}만원` : '-';
  const formatPercent = (rate) => rate != null ? `${rate.toFixed(2)}%` : '-';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\s/g, '') : '-';

  if (loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-transparent p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow-lg">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border-separator rounded-md px-2 py-1.5 text-sm">
              <option value="전체">상태 (전체)</option><option value="진행중">진행중</option><option value="완료">완료</option>
            </select>
            <div className="flex items-center space-x-1"><input type="checkbox" id="showOnlySelected" checked={showOnlySelected} onChange={(e) => setShowOnlySelected(e.target.checked)} className="h-4 w-4 rounded"/><label htmlFor="showOnlySelected" className="text-sm text-text-muted cursor-pointer">선택만</label></div>
            <input type="text" placeholder="검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border-separator rounded-md px-2 py-1.5 text-sm"/>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-input-bg rounded-md p-1">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent' : ''}`}><List size={18} /></button>
              <button onClick={() => setViewMode('card')} className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-accent' : ''}`}><LayoutGrid size={18} /></button>
            </div>
            {viewMode === 'list' && <ColumnSelector allColumns={ALL_COLUMNS} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} fixedColumns={FIXED_COLUMNS}/>}
            <Link to="/projects/new"><button className="flex items-center bg-accent font-bold py-2 px-4 rounded"><Plus size={16} className="mr-1"/> 신규 등록</button></Link>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <div className="flex-grow flex flex-col overflow-y-hidden">
            <div className="flex-grow overflow-auto">
              <table className="w-full text-sm text-left table-fixed">
                <thead className="bg-table-header text-table-header-text uppercase sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-center w-12"><input type="checkbox" onChange={handleSelectAll} checked={sortedAndFilteredProjects.length > 0 && selectedRows.size === sortedAndFilteredProjects.length} /></th>
                    {Object.entries(ALL_COLUMNS).map(([key, { header, sortable }]) => 
                      visibleColumns[key] && (
                        <th key={key} className="p-2 text-center whitespace-nowrap cursor-pointer" onClick={() => sortable && requestSort(key)}>
                          <div className="flex items-center justify-center">
                            {header}
                            {sortable && <ArrowUpDown size={12} className={`ml-1 ${sortConfig.key === key ? 'text-accent' : 'text-gray-500'}`} />}
                          </div>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-separator">
                  {sortedAndFilteredProjects.map(p => (
                    <tr key={p.id} onDoubleClick={() => navigate(`/projects/${p.id}`)} className="hover:bg-tab-hover cursor-pointer">
                      <td className="p-2 text-center"><input type="checkbox" checked={selectedRows.has(p.id)} onChange={() => handleSelectRow(p.id)} onClick={e => e.stopPropagation()} /></td>
                      {Object.keys(ALL_COLUMNS).map(key => visibleColumns[key] && (
                        <td key={key} className={`p-2 whitespace-nowrap overflow-hidden text-ellipsis ${['contract_amount', 'balance'].includes(key) ? 'text-right' : 'text-center'}`} title={p[key]}>
                          {key === 'status' ? <span className={`px-2 py-1 text-xs rounded-full ${p.status === '완료' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>{p.status}</span> :
                           ['start_date', 'end_date', 'completion_date', 'contract_date'].includes(key) ? formatDate(p[key]) :
                           ['contract_amount', 'balance'].includes(key) ? formatCurrency(p[key]) :
                           ['equity_rate', 'progress_rate'].includes(key) ? formatPercent(p[key]) :
                           p[key] || '-'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {sortedAndFilteredProjects.map(p => <ProjectCard key={p.id} project={p} isSelected={selectedRows.has(p.id)} onSelect={handleSelectRow} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProjectList;
