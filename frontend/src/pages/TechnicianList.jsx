import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, List, LayoutGrid } from 'lucide-react';
import ColumnSelector from '../components/ColumnSelector';

// 기술인 페이지 컬럼 정의 (KOCEA 시스템 참조)
const ALL_COLUMNS = {
  status: { header: '상태', width: '6rem' },
  name: { header: '이름', width: '8rem' },
  grade: { header: '등급', width: '8rem' },
  role: { header: '직무', width: '10rem' },
  skills: { header: '보유기술', width: '15rem' },
  join_date: { header: '입사일', width: '10rem' },
  ongoing_projects: { header: '참여 프로젝트 수', width: '8rem' },
};

// 고정 컬럼
const FIXED_COLUMNS = ['status', 'name'];

// 로컬 스토리지 키
const LOCAL_STORAGE_KEYS = {
  visibleColumns: 'technicianList_visibleColumns_v1',
  viewMode: 'technicianList_viewMode_v1',
};

// 초기 컬럼 가시성
const getInitialVisibleColumns = () => ({
  status: true, name: true, grade: true, role: true,
  skills: true, join_date: true, ongoing_projects: true,
});

const TableColGroup = ({ visibleColumns }) => (
  <colgroup>
    <col style={{ width: '3rem' }} /> {/* 체크박스 */}
    {Object.keys(ALL_COLUMNS).map(key => visibleColumns[key] && (
      <col key={key} style={{ width: ALL_COLUMNS[key].width }} />
    ))}
  </colgroup>
);

const TechnicianList = () => {
  const [technicians, setTechnicians] = useState([]);
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
    fetch('http://localhost:5001/api/technicians')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Network response was not ok.')))
      .then(data => { setTechnicians(data); setLoading(false); })
      .catch(err => { setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.'); setLoading(false); });
  }, []);

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.visibleColumns, JSON.stringify(visibleColumns)); }, [visibleColumns]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.viewMode, viewMode); }, [viewMode]);

  const filteredTechnicians = useMemo(() => {
    let data = technicians;
    if (showOnlySelected) data = data.filter(t => selectedRows.has(t.id));
    
    return data
      .filter(t => statusFilter === '전체' || t.status === statusFilter)
      .filter(t => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (t.name && t.name.toLowerCase().includes(term)) ||
               (t.role && t.role.toLowerCase().includes(term)) ||
               (t.skills && t.skills.toLowerCase().includes(term));
      });
  }, [technicians, searchTerm, statusFilter, selectedRows, showOnlySelected]);

  const handleSelectRow = (id) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) newSelectedRows.delete(id);
    else newSelectedRows.add(id);
    setSelectedRows(newSelectedRows);
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(new Set(filteredTechnicians.map(t => t.id)));
    else setSelectedRows(new Set());
  };
  
  const isAllSelected = filteredTechnicians.length > 0 && selectedRows.size === filteredTechnicians.length;

  const getStatusBadge = (status) => {
    switch(status) {
      case '재직': return 'bg-green-500/20 text-green-300';
      case '휴직': return 'bg-yellow-500/20 text-yellow-300';
      case '퇴사': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) return <div className="p-6 text-center text-text-muted">기술인 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-transparent p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow-lg">
        {/* 컨트롤 바 */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <input type="text" placeholder="이름, 직무, 보유기술 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm">
              <option value="전체">상태 (전체)</option><option value="재직">재직</option><option value="휴직">휴직</option><option value="퇴사">퇴사</option>
            </select>
            <div className="flex items-center space-x-1"><input type="checkbox" id="showOnlySelectedTech" checked={showOnlySelected} onChange={(e) => setShowOnlySelected(e.target.checked)} /><label htmlFor="showOnlySelectedTech" className="text-sm text-text-muted cursor-pointer">선택 항목만</label></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-input-bg border border-separator rounded-md p-1">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent text-white' : 'text-text-muted hover:bg-gray-700'}`}><List size={18} /></button>
              <button onClick={() => setViewMode('card')} className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-accent text-white' : 'text-text-muted hover:bg-gray-700'}`}><LayoutGrid size={18} /></button>
            </div>
            {viewMode === 'list' && <ColumnSelector allColumns={ALL_COLUMNS} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} fixedColumns={FIXED_COLUMNS}/>}
            <Link to="/technicians/new"><button className="flex items-center bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover"><Plus size={16} className="mr-1"/> 신규 등록</button></Link>
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
                 {filteredTechnicians.map(tech => (
                   <tr key={tech.id} onDoubleClick={() => navigate(`/technicians/${tech.id}`)} className="hover:bg-tab-hover cursor-pointer">
                     <td className="p-2 text-center"><input type="checkbox" checked={selectedRows.has(tech.id)} onChange={() => handleSelectRow(tech.id)} onClick={e => e.stopPropagation()} /></td>
                     {Object.keys(ALL_COLUMNS).map(key => visibleColumns[key] && (
                       <td key={key} className="p-2 whitespace-nowrap overflow-hidden text-ellipsis text-center" title={tech[key]}>
                         {key === 'status' ? <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tech.status)}`}>{tech.status}</span> : tech[key] || '-'}
                       </td>
                     ))}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
        ) : (
          <div className="flex-grow overflow-auto p-4"><p className="text-center text-text-muted">카드 뷰는 개발 예정입니다.</p></div>
        )}
      </div>
    </div>
  );
};

export default TechnicianList;