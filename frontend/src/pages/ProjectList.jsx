import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ColumnSelector from '../components/ColumnSelector';

// --- 단일 진실 공급원: 컬럼 정의 ---
const ALL_COLUMNS = {
  status: { header: '상태', width: '5rem' },
  project_no: { header: '프로젝트 넘버', width: '8rem' },
  project_name: { header: '계약명', width: '20rem' },
  client: { header: '발주처', width: '12rem' },
  contract_amount: { header: '총 계약 금액', width: '10rem' },
  equity_amount: { header: '총 지분 금액', width: '10rem' },
  equity_rate: { header: '지분율', width: '5rem' },
  progress_rate: { header: '기성율', width: '5rem' },
  contract_date: { header: '계약일', width: '7rem' },
  start_date: { header: '착수일', width: '7rem' },
  end_date: { header: '완료예정일', width: '7rem' },
  completion_date: { header: '완료일', width: '7rem' },
  manager: { header: 'PM', width: '7rem' },
  special_notes: { header: '특이사항', width: '12rem' },
  remarks: { header: '비고', width: '7rem' },
};

const FIXED_COLUMNS = ['status', 'project_no'];

const getInitialVisibleColumns = () => {
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    return { status: true, project_no: true, project_name: true, client: false, contract_amount: false, equity_amount: false, equity_rate: false, progress_rate: true, contract_date: false, start_date: false, end_date: false, completion_date: false, manager: false, special_notes: false, remarks: false, };
  }
  return { status: true, project_no: true, project_name: true, client: true, contract_amount: false, equity_amount: true, equity_rate: true, progress_rate: true, contract_date: false, start_date: true, end_date: true, completion_date: false, manager: true, special_notes: false, remarks: false, };
};

const LOCAL_STORAGE_KEY = 'projectList_visibleColumns_v2';

// [신규] 컬럼 너비 동기화를 위한 ColGroup 컴포넌트
const TableColGroup = ({ visibleColumns }) => (
  <colgroup>
    <col style={{ width: '3rem' }} />
    {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
      <col key={colKey} style={{ width: ALL_COLUMNS[colKey].width }} />
    ))}
  </colgroup>
);

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
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
    fetch('http://localhost:5001/api/projects')
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
      .then(data => { setProjects(data); setLoading(false); })
      .catch(err => { setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.'); setLoading(false); });
  }, []);
  
  const filteredProjects = useMemo(() => {
    let data = [...projects];
    if (showOnlySelected) {
      data = data.filter(p => selectedRows.has(p.id));
    }
    return data
      .filter(p => statusFilter === '전체' || p.status === statusFilter)
      .filter(p => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (p.project_no && p.project_no.toLowerCase().includes(term)) || 
               (p.project_name && p.project_name.toLowerCase().includes(term)) || 
               (p.client && p.client.toLowerCase().includes(term));
      });
  }, [projects, statusFilter, searchTerm, selectedRows, showOnlySelected]);
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(filteredProjects.map(p => p.id)));
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
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear().toString().slice(-2)}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}.`;
  };

  if (loading) return <div className="p-6 text-center text-text-muted">프로젝트 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-text-muted">{error}</div>;

  const isAllSelected = filteredProjects.length > 0 && selectedRows.size === filteredProjects.length;

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm">
              <option value="전체">상태 (전체)</option> <option value="진행중">진행중</option> <option value="완료">완료</option>
            </select>
            <div className="flex items-center space-x-1">
              <input type="checkbox" id="showOnlySelected" checked={showOnlySelected} onChange={(e) => setShowOnlySelected(e.target.checked)} className="h-4 w-4 rounded"/>
              <label htmlFor="showOnlySelected" className="text-sm text-text-muted cursor-pointer">선택 항목만 보기</label>
            </div>
            <input type="text" placeholder="프로젝트 넘버/계약명/발주처 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div className="flex items-center space-x-2">
            <ColumnSelector allColumns={ALL_COLUMNS} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} fixedColumns={FIXED_COLUMNS}/>
            <button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover">+ 신규 등록</button>
          </div>
        </div>

        <div className="flex-grow flex flex-col overflow-hidden">
          {/* --- 헤더 영역 --- */}
          <div className="flex-shrink-0 overflow-x-auto">
            <table className="w-full text-sm text-left table-fixed">
              <TableColGroup visibleColumns={visibleColumns} />
              <thead className="bg-table-header text-table-header-text uppercase">
                <tr>
                  <th className="p-2 text-center">
                    <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} className="h-4 w-4 rounded" />
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

          {/* --- 바디 영역 (스크롤 가능) --- */}
          <div className="flex-grow overflow-auto">
            <table className="w-full text-sm text-left table-fixed">
              <TableColGroup visibleColumns={visibleColumns} />
              <tbody>
                {filteredProjects.map(project => (
                  <tr key={project.id} className="hover:bg-tab-hover">
                    <td className="p-2 text-center">
                      <input type="checkbox" checked={selectedRows.has(project.id)} onChange={() => handleSelectRow(project.id)} onClick={(e) => e.stopPropagation()} className="h-4 w-4 rounded" />
                    </td>
                    {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
                      <td key={colKey} onClick={() => navigate(`/projects/${project.id}`)} className={`p-2 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer ${['contract_amount', 'equity_amount'].includes(colKey) ? 'text-right font-mono' : 'text-center'}`} title={project[colKey]}>
                        {colKey === 'status' ? <span className={`px-2 py-1 text-xs font-semibold rounded-full ${project.status === '완료' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{project.status}</span> :
                         ['contract_date', 'start_date', 'end_date', 'completion_date'].includes(colKey) ? formatDate(project[colKey]) :
                         ['contract_amount', 'equity_amount'].includes(colKey) ? formatCurrency(project[colKey]) :
                         ['equity_rate', 'progress_rate'].includes(colKey) ? `${project[colKey] || 0}%` :
                         project[colKey]}
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
export default ProjectList;