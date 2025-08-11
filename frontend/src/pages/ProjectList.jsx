import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { List, LayoutGrid, ArrowUpDown, Plus } from 'lucide-react';

import ColumnSelector from '../components/ColumnSelector';
import ProjectCard from '../components/ProjectCard';

const ALL_COLUMNS = {
  status: { header: '상태', sortable: true, width: 'w-24' },
  project_no: { header: 'P.No', sortable: true, width: 'w-32' },
  project_name: { header: '계약명', sortable: true, width: 'w-96' },
  client: { header: '발주처', sortable: true, width: 'w-48' },
  manager: { header: 'PM', sortable: true, width: 'w-24' },
  contract_date: { header: '계약일', sortable: true, width: 'w-32' },
  start_date: { header: '착수일', sortable: true, width: 'w-32' },
  end_date: { header: '완료예정일', sortable: true, width: 'w-32' },
  contract_amount: { header: '총 지분금액', sortable: true, width: 'w-40' },
  balance: { header: '잔금', sortable: true, width: 'w-40' },
  request_count: { header: '청구횟수', sortable: true, width: 'w-24' },
};

const DEFAULT_COLUMN_ORDER = [
    'status', 'project_no', 'project_name', 'client', 'manager', 'contract_date', 'start_date', 'end_date', 'contract_amount', 'balance'
];

const LOCAL_STORAGE_KEYS = {
  visibleColumns: 'projectList_vFinale_1',
  viewMode: 'projectList_vFinale_1',
  sortConfig: 'projectList_vFinale_1',
};

// [수정] 모든 상태('중지', '취소' 등)를 처리하는 헬퍼 컴포넌트
const StatusDisplay = ({ status }) => {
    const getStatusStyle = () => {
        switch (status) {
            case '진행중': return { text: '진행중', style: 'bg-green-500/20 text-green-300' };
            case '완료': return { text: '완료', style: 'bg-blue-500/20 text-blue-300' };
            case '중지': return { text: '중지', style: 'bg-red-500/20 text-red-300' };
            case '취소': return { text: '취소', style: 'bg-gray-500/20 text-gray-300' };
            case '보류': return { text: '보류', style: 'bg-yellow-500/20 text-yellow-300' };
            default: return { text: status || 'N/A', style: 'bg-gray-700/50 text-gray-400' };
        }
    };
    const { text, style } = getStatusStyle();
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>{text}</span>;
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
    // [수정] 기본 보기를 'list'로 설정
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

    const sortedAndFilteredProjects = useMemo(() => {
        let data = [...projects];
        if (showOnlySelected) data = data.filter(p => selectedRows.has(p.id));
        if (statusFilter !== '전체') data = data.filter(p => p.status === statusFilter);
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            data = data.filter(p => ['project_no', 'project_name', 'client', 'manager'].some(key => p[key] && String(p[key]).toLowerCase().includes(term)));
        }
        if (sortConfig && sortConfig.key) {
            data.sort((a, b) => {
                const valA = a[sortConfig.key] || ''; const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [projects, statusFilter, searchTerm, selectedRows, showOnlySelected, sortConfig]);
    
    const displayedColumns = useMemo(() => {
        return DEFAULT_COLUMN_ORDER.filter(key => visibleColumns[key]);
    }, [visibleColumns]);

    const requestSort = (key) => setSortConfig(prev => ({ key, direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc' }));
    const handleSelectAll = (e) => setSelectedRows(e.target.checked ? new Set(sortedAndFilteredProjects.map(p => p.id)) : new Set());
    const handleSelectRow = (id) => setSelectedRows(prev => { const newSet = new Set(prev); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); return newSet; });

    const formatCurrency = (amount) => amount != null ? `${Math.round(amount / 10000).toLocaleString('ko-KR')}만` : '-';
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\s/g, '') : '-';

    if (loading) return <div className="p-6 text-center">로딩 중...</div>;
    if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

    return (
        <div className="flex flex-col h-full bg-transparent p-4 md:p-6">
            <div className="flex flex-col h-full bg-card-bg rounded-lg shadow-lg">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                         {/* [수정] 필터에 모든 상태 추가 */}
                         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border-separator rounded-md px-2 py-1.5 text-sm">
                           <option value="전체">상태 (전체)</option>
                           <option value="진행중">진행중</option>
                           <option value="완료">완료</option>
                           <option value="중지">중지</option>
                           <option value="취소">취소</option>
                           <option value="보류">보류</option>
                         </select>
                         <div className="flex items-center space-x-1"><input type="checkbox" id="showOnlySelected" checked={showOnlySelected} onChange={(e) => setShowOnlySelected(e.target.checked)} className="h-4 w-4 rounded"/><label htmlFor="showOnlySelected" className="text-sm text-text-muted cursor-pointer">선택만</label></div>
                         <input type="text" placeholder="검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border-separator rounded-md px-2 py-1.5 text-sm"/>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center bg-input-bg rounded-md p-1">
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent' : ''}`}><List size={18} /></button>
                            <button onClick={() => setViewMode('card')} className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-accent' : ''}`}><LayoutGrid size={18} /></button>
                        </div>
                        {viewMode === 'list' && <ColumnSelector allColumns={ALL_COLUMNS} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />}
                        <Link to="/projects/new"><button className="flex items-center bg-accent font-bold py-2 px-4 rounded"><Plus size={16} className="mr-1"/> 신규 등록</button></Link>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="flex-grow overflow-auto">
                        <table className="w-full text-sm text-left table-fixed">
                            <thead className="sticky top-0 z-10 bg-table-header">
                                <tr>
                                    <th className="p-2 w-12 text-center bg-table-header"><input type="checkbox" onChange={handleSelectAll} checked={!loading && sortedAndFilteredProjects.length > 0 && selectedRows.size === sortedAndFilteredProjects.length} /></th>
                                    {displayedColumns.map(key => (
                                        <th key={key} className={`p-2 text-center whitespace-nowrap cursor-pointer bg-table-header ${ALL_COLUMNS[key]?.width || ''}`} onClick={() => ALL_COLUMNS[key].sortable && requestSort(key)}>
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
                                            <td key={key} className={`p-2 whitespace-nowrap ${['contract_amount', 'balance'].includes(key) ? 'text-right' : 'text-center'}`} title={p[key]}>
                                                <div className="truncate">
                                                    {/* [수정] StatusDisplay 컴포넌트로 상태 표시 로직 교체 */}
                                                    {key === 'status' ? <StatusDisplay status={p.status} /> :
                                                     ['start_date', 'end_date', 'contract_date'].includes(key) ? formatDate(p[key]) :
                                                     ['contract_amount', 'balance'].includes(key) ? formatCurrency(p[key]) :
                                                     p[key] || '-'}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-grow overflow-auto p-4"><ProjectCard /></div>
                )}
            </div>
        </div>
    );
};

export default ProjectList;