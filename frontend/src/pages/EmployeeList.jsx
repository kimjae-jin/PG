import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { List, LayoutGrid, Plus } from 'lucide-react';
import ColumnSelector from '../components/ColumnSelector';
import EmployeeCard from '../components/EmployeeCard';

const ALL_COLUMNS = {
  status: { header: '상태', width: '6rem' },
  name: { header: '이름', width: '8rem' },
  position: { header: '직책', width: '8rem' },
  department: { header: '소속부서', width: '8rem' },
  email: { header: '이메일', width: '15rem' },
  emergencyContact: { header: '비상연락망', width: '10rem' },
  hireDate: { header: '입사일', width: '8rem' },
};
const FIXED_COLUMNS = ['status', 'name'];
const LOCAL_STORAGE_KEYS = {
  visibleColumns: 'employeeList_visibleColumns_v1',
  viewMode: 'employeeList_viewMode_v1',
};
const getInitialVisibleColumns = () => ({
  status: true, name: true, position: true, department: true, 
  email: true, emergencyContact: true, hireDate: false,
});
const TableColGroup = ({ visibleColumns }) => (
  <colgroup>
    <col style={{ width: '3rem' }} />
    {Object.keys(ALL_COLUMNS).map(key => visibleColumns[key] && <col key={key} style={{ width: ALL_COLUMNS[key].width }} />)}
  </colgroup>
);

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
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
    fetch('http://localhost:5001/api/employees')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Network response was not ok.')))
      .then(data => { setEmployees(data); setLoading(false); })
      .catch(err => { setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.'); setLoading(false); });
  }, []);

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.visibleColumns, JSON.stringify(visibleColumns)); }, [visibleColumns]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.viewMode, viewMode); }, [viewMode]);

  const filteredEmployees = useMemo(() => {
    let data = employees;
    if (showOnlySelected) data = data.filter(e => selectedRows.has(e.employeeId));
    return data
      .filter(e => statusFilter === '전체' || e.status === statusFilter)
      .filter(e => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (e.name && e.name.toLowerCase().includes(term)) ||
               (e.position && e.position.toLowerCase().includes(term)) ||
               (e.department && e.department.toLowerCase().includes(term));
      });
  }, [employees, searchTerm, statusFilter, selectedRows, showOnlySelected]);
  
  const handleSelectRow = (id) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) newSelectedRows.delete(id);
    else newSelectedRows.add(id);
    setSelectedRows(newSelectedRows);
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(new Set(filteredEmployees.map(e => e.employeeId)));
    else setSelectedRows(new Set());
  };
  const isAllSelected = filteredEmployees.length > 0 && selectedRows.size === filteredEmployees.length;

  if (loading) return <div className="p-6 text-center text-text-muted">기술인 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-transparent p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow-lg">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <input type="text" placeholder="이름, 직책, 부서 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm">
              <option value="전체">상태 (전체)</option><option value="재직">재직</option><option value="휴직">휴직</option><option value="퇴사">퇴사</option>
            </select>
            <div className="flex items-center space-x-1"><input type="checkbox" id="showOnlySelectedEmp" checked={showOnlySelected} onChange={(e) => setShowOnlySelected(e.target.checked)} className="h-4 w-4 rounded"/><label htmlFor="showOnlySelectedEmp" className="text-sm text-text-muted cursor-pointer">선택 항목만</label></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-input-bg border border-separator rounded-md p-1">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent text-white' : 'text-text-muted hover:bg-gray-700'}`}><List size={18} /></button>
              <button onClick={() => setViewMode('card')} className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-accent text-white' : 'text-text-muted hover:bg-gray-700'}`}><LayoutGrid size={18} /></button>
            </div>
            {viewMode === 'list' && <ColumnSelector allColumns={ALL_COLUMNS} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} fixedColumns={FIXED_COLUMNS}/>}
            <Link to="/employees/new"><button className="flex items-center bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover"><Plus size={16} className="mr-1"/> 신규 등록</button></Link>
          </div>
        </div>
        
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
                  {filteredEmployees.map(emp => (
                    <tr key={emp.employeeId} onClick={() => navigate(`/employees/${emp.employeeId}`)} className="hover:bg-tab-hover cursor-pointer">
                      <td className="p-2 text-center"><input type="checkbox" checked={selectedRows.has(emp.employeeId)} onChange={() => handleSelectRow(emp.employeeId)} onClick={e => e.stopPropagation()} /></td>
                      {Object.keys(ALL_COLUMNS).map(key => visibleColumns[key] && (
                        <td key={key} className="p-2 whitespace-nowrap overflow-hidden text-ellipsis text-center" title={emp[key]}>{emp[key] || '-'}</td>
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
              {filteredEmployees.map(emp => (
                <EmployeeCard key={emp.employeeId} employee={emp} isSelected={selectedRows.has(emp.employeeId)} onSelect={handleSelectRow} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default EmployeeList;