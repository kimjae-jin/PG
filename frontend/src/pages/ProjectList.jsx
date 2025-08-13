import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ColumnSelector from '../components/ColumnSelector'; // ColumnSelector 컴포넌트 경로

// [핵심 수정] 신뢰성 있는 모든 컬럼 정의
const ALL_COLUMNS = {
  status: { header: '상태', width: '5rem', align: 'center' },
  project_no: { header: 'P.NO', width: '8rem', align: 'center' },
  project_name: { header: '계약명', width: '25rem', align: 'left' },
  client: { header: '발주처', width: '15rem', align: 'left' },
  manager: { header: 'PM', width: '5rem', align: 'center' },
  contract_date: { header: '계약일', width: '7rem', align: 'center' },
  start_date: { header: '착수일', width: '7rem', align: 'center' },
  end_date: { header: '완료예정일', width: '7rem', align: 'center' },
  completion_date: { header: '실제완료일', width: '7rem', align: 'center' },
  contract_amount: { header: '총 계약금액', width: '10rem', align: 'right' },
  equity_amount: { header: '총 지분금액', width: '10rem', align: 'right' },
  total_billed_amount: { header: '총 청구액', width: '10rem', align: 'right' },
  total_paid_amount: { header: '총 입금액', width: '10rem', align: 'right' },
  balance: { header: '잔금', width: '10rem', align: 'right', isNegative: true },
  request_count: { header: '청구횟수', width: '5rem', align: 'center' },
};

const FIXED_COLUMNS = ['status', 'project_no'];

const getInitialVisibleColumns = () => ({
  status: true, project_no: true, project_name: true, client: true, manager: true,
  contract_date: true, start_date: true, end_date: false, completion_date: false,
  contract_amount: true, equity_amount: true, total_billed_amount: true,
  total_paid_amount: true, balance: true, request_count: true,
});

const LOCAL_STORAGE_KEY = 'projectList_visibleColumns_v2';

// 이하 모든 코드는 완전한 형태로 제공됩니다.
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
    fetch('http://localhost:5001/api/projects')
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
      .then(data => { setProjects(data); setLoading(false); })
      .catch(err => { setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.'); setLoading(false); });
  }, []);
  
  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => statusFilter === '전체' || p.status === statusFilter)
      .filter(p => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return Object.values(p).some(val => 
            String(val).toLowerCase().includes(term)
        );
      });
  }, [projects, searchTerm, statusFilter]);
  
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

  const formatValue = (value, colKey) => {
    if (value === null || value === undefined) return '-';
    const column = ALL_COLUMNS[colKey];
    if (['contract_amount', 'equity_amount', 'total_billed_amount', 'total_paid_amount', 'balance'].includes(colKey)) {
        return `${(value / 10000).toLocaleString('ko-KR')}만`;
    }
    if (colKey.includes('_date')) {
        return value.substring(2).replace(/-/g, '.');
    }
    return value;
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
      case '진행중': return 'bg-blue-200 text-blue-800';
      case '완료': return 'bg-green-200 text-green-800';
      case '중지': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const renderCellContent = (project, colKey) => {
    const value = project[colKey];
    if (colKey === 'status') {
      return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)}`}>{value}</span>;
    }
    return formatValue(value, colKey);
  };
  
  const isAllSelected = filteredProjects.length > 0 && selectedRows.size === filteredProjects.length;

  if (loading) return <div className="p-6 text-center text-text-muted">프로젝트 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
            <div className="flex items-center space-x-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm">
                    <option value="전체">상태 (전체)</option>
                    <option value="진행중">진행중</option>
                    <option value="완료">완료</option>
                    <option value="중지">중지</option>
                </select>
                <input type="text" placeholder="검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm" />
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
                  <th className="p-2 text-center sticky left-0 bg-table-header z-10"><input type="checkbox" onChange={handleSelectAll} checked={isAllSelected}/></th>
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
                {filteredProjects.map(project => (
                  <tr key={project.id} onDoubleClick={() => navigate(`/projects/${project.id}`)} className="hover:bg-tab-hover cursor-pointer">
                    <td className="p-2 text-center sticky left-0 bg-card-bg hover:bg-tab-hover z-10"><input type="checkbox" checked={selectedRows.has(project.id)} onChange={() => handleSelectRow(project.id)} onClick={(e) => e.stopPropagation()}/></td>
                    {Object.keys(ALL_COLUMNS).map(colKey => visibleColumns[colKey] && (
                      <td key={colKey} className={`p-2 whitespace-nowrap overflow-hidden text-ellipsis text-${ALL_COLUMNS[colKey].align || 'left'}`} title={project[colKey]}>
                        {renderCellContent(project, colKey)}
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