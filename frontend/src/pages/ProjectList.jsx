import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { List, LayoutGrid, ArrowUpDown, Plus } from 'lucide-react';

import ColumnSelector from '../components/ColumnSelector';
import ProjectCard from '../components/ProjectCard';

// 핵심 기능 유지: 확장된 전체 컬럼
const ALL_COLUMNS = {
  status: { header: '상태', sortable: true },
  project_no: { header: 'P.No', sortable: true },
  project_name: { header: '계약명', sortable: true },
  project_category: { header: '구분', sortable: true },
  manager: { header: 'PM', sortable: true },
  client: { header: '발주처', sortable: true },
  contract_date: { header: '계약일', sortable: true },
  start_date: { header: '착수일', sortable: true },
  end_date: { header: '완료예정일', sortable: true },
  contract_amount: { header: '총 지분금액', sortable: true },
  equity_rate: { header: '지분율', sortable: true },
  progress_rate: { header: '기성율', sortable: true },
  balance: { header: '잔금', sortable: true },
  request_count: { header: '청구횟수', sortable: true },
  facility_type: { header: '시설물종류', sortable: false },
};

// 단순화를 위해 컬럼 순서는 이 배열을 따름
const DEFAULT_COLUMN_ORDER = [
    'status', 'project_no', 'project_name', 'client', 'manager', 'contract_date', 'start_date', 'end_date', 'contract_amount', 'balance', 'request_count'
];

const LOCAL_STORAGE_KEYS = {
  visibleColumns: 'projectList_vStable_1',
  viewMode: 'projectList_vStable_1',
  sortConfig: 'projectList_vStable_1',
};

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('전체');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [showOnlySelected, setShowOnlySelected] = useState(false);
    const navigate = useNavigate();

    // 안정화된 상태 초기화 로직
    const getInitialState = useCallback((key, defaultValue) => {
        try {
            const saved = localStorage.getItem(key);
            if (saved === null || saved === 'undefined') return defaultValue;
            const parsed = JSON.parse(saved);
            return parsed ?? defaultValue;
        } catch (e) { return defaultValue; }
    }, []);

    const [visibleColumns, setVisibleColumns] = useState(() => getInitialState(LOCAL_STORAGE_KEYS.visibleColumns, 
        DEFAULT_COLUMN_ORDER.reduce((acc, key) => ({...acc, [key]: true}), {})
    ));
    const [sortConfig, setSortConfig] = useState(() => getInitialState(LOCAL_STORAGE_KEYS.sortConfig, { key: 'start_date', direction: 'desc' }));
    const [viewMode, setViewMode] = useState(() => getInitialState(LOCAL_STORAGE_KEYS.viewMode, 'list'));

    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.visibleColumns, JSON.stringify(visibleColumns)); }, [visibleColumns]);
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.sortConfig, JSON.stringify(sortConfig)); }, [sortConfig]);
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.viewMode, viewMode); }, [viewMode]);

    useEffect(() => {
        fetch('http://localhost:5001/api/projects')
            .then(res => res.ok ? res.json() : Promise.reject('Network error'))
            .then(data => { setProjects(data); setLoading(false); })
            .catch(err => { setError('데이터 로딩 실패'); setLoading(false); });
    }, []);

    // 절대 안정성을 확보한 정렬 및 필터링 로직
    const sortedAndFilteredProjects = useMemo(() => {
        let data = [...projects];
        if (showOnlySelected) data = data.filter(p => selectedRows.has(p.id));
        if (statusFilter !== '전체') data = data.filter(p => p.status === statusFilter);
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            data = data.filter(p => ['project_no', 'project_name', 'client', 'manager'].some(key => p[key] && String(p[key]).toLowerCase().includes(term)));
        }
        if (sortConfig && sortConfig.key) { // Null 체크 강화
            data.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [projects, statusFilter, searchTerm, selectedRows, showOnlySelected, sortConfig]);
    
    // 표시할 컬럼 목록 (단순화된 순서 기반)
    const displayedColumns = useMemo(() => {
        return DEFAULT_COLUMN_ORDER.filter(key => visibleColumns[key]);
    }, [visibleColumns]);

    const requestSort = (key) => setSortConfig(prev => ({ key, direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc' }));
    const handleSelectAll = (e) => setSelectedRows(e.target.checked ? new Set(sortedAndFilteredProjects.map(p => p.id)) : new Set());
    const handleSelectRow = (id) => setSelectedRows(prev => { const newSet = new Set(prev); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); return newSet; });

    const formatCurrency = (amount) => amount != null ? `${Math.round(amount / 10000).toLocaleString('ko-KR')}만원` : '-';
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\s/g, '') : '-';

    if (loading) return <div className="p-6 text-center">로딩 중...</div>;
    if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

    return (
        <div className="flex flex-col h-full bg-transparent p-4 md:p-6">
            <div className="flex flex-col h-full bg-card-bg rounded-lg shadow-lg">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border-separator rounded-md px-2 py-1.5 text-sm"><option value="전체">상태 (전체)</option><option value="진행중">진행중</option><option value="완료">완료</option></select>
                        <div className="flex items-center space-x-1"><input type="checkbox" id="showOnlySelected" checked={showOnlySelected} onChange={(e) => setShowOnlySelected(e.target.checked)} className="h-4 w-4 rounded"/><label htmlFor="showOnlySelected" className="text-sm text-text-muted cursor-pointer">선택만</label></div>
                        <input type="text" placeholder="검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border-separator rounded-md px-2 py-1.5 text-sm"/>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center bg-input-bg rounded-md p-1"><button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent' : ''}`}><List size={18} /></button><button onClick={() => setViewMode('card')} className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-accent' : ''}`}><LayoutGrid size={18} /></button></div>
                        {viewMode === 'list' && <ColumnSelector allColumns={ALL_COLUMNS} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} fixedColumns={[]} />}
                        <Link to="/projects/new"><button className="flex items-center bg-accent font-bold py-2 px-4 rounded"><Plus size={16} className="mr-1"/> 신규 등록</button></Link>
                    </div>
                </div>
                
                {viewMode === 'list' ? (
                    <div className="flex-grow overflow-auto">
                        <table className="w-full text-sm text-left table-auto border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10 bg-table-header">
                                <tr>
                                    <th className="p-2 w-12 text-center bg-table-header"><input type="checkbox" onChange={handleSelectAll} checked={!loading && sortedAndFilteredProjects.length > 0 && selectedRows.size === sortedAndFilteredProjects.length} /></th>
                                    {displayedColumns.map(key => (
                                        <th key={key} className="p-2 text-center whitespace-nowrap cursor-pointer bg-table-header" onClick={() => ALL_COLUMNS[key].sortable && requestSort(key)}>
                                            <div className="flex items-center justify-center">{ALL_COLUMNS[key].header}{ALL_COLUMNS[key].sortable && <ArrowUpDown size={12} className={`ml-1 ${sortConfig?.key === key ? 'text-accent' : 'text-gray-500'}`} />}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-separator">
                                {sortedAndFilteredProjects.map(p => (
                                    <tr key={p.id} onDoubleClick={() => navigate(`/projects/${p.id}`)} className="hover:bg-tab-hover cursor-pointer group">
                                        <td className="p-2 text-center"><input type="checkbox" checked={selectedRows.has(p.id)} onChange={() => handleSelectRow(p.id)} onClick={e => e.stopPropagation()} /></td>
                                        {displayedColumns.map(key => (
                                            <td key={key} className={`p-2 whitespace-nowrap overflow-hidden text-ellipsis ${['contract_amount', 'balance'].includes(key) ? 'text-right' : 'text-center'}`} title={p[key]}>
                                                {key === 'status' ? <span className={`px-2 py-1 text-xs rounded-full ${p.status === '완료' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>{p.status}</span> :
                                                 ['start_date', 'end_date', 'contract_date'].includes(key) ? formatDate(p[key]) :
                                                 ['contract_amount', 'balance'].includes(key) ? formatCurrency(p[key]) :
                                                 p[key] || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-grow overflow-auto p-4"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">{sortedAndFilteredProjects.map(p => <ProjectCard key={p.id} project={p} isSelected={selectedRows.has(p.id)} onSelect={handleSelectRow} />)}</div></div>
                )}
            </div>
        </div>
    );
};
export default ProjectList;