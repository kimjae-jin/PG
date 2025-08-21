import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// --- 임시 아이콘 및 컴포넌트 ---
const ColumnSelector = ({ allColumns, visibleColumns, setVisibleColumns, fixedColumns = [] }) => { const [isOpen, setIsOpen] = useState(false); const toggleColumn = (key) => { if (fixedColumns.includes(key)) return; setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] })); }; return ( <div className="relative"> <button onClick={() => setIsOpen(!isOpen)} className="bg-gray-700 text-white text-sm font-bold py-2 px-3 rounded hover:bg-gray-600"> 필드 설정 </button> {isOpen && ( <div className="absolute right-0 mt-2 w-56 bg-card-bg-darker border border-separator rounded-md shadow-lg z-20"> {Object.keys(allColumns).map(key => ( <div key={key} className="flex items-center p-2 hover:bg-tab-hover"> <input type="checkbox" id={`col-${key}`} checked={!!visibleColumns[key]} onChange={() => toggleColumn(key)} disabled={fixedColumns.includes(key)} className="mr-2 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" /> <label htmlFor={`col-${key}`} className={`text-sm ${fixedColumns.includes(key) ? 'text-gray-500' : 'cursor-pointer'}`}>{allColumns[key].header}</label> </div> ))} </div> )} </div> );};
const ListBulletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const Squares2X2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;

const ALL_COLUMNS = { status: { header: '상태', width: '6rem', align: 'center' }, projectIdentifier: { header: 'P.N.', width: '8rem', align: 'center' }, projectCategory: { header: '구분', width: '8rem', align: 'center' }, projectName: { header: '계약명', width: '20rem' }, clientNames: { header: '발주처', width: '15rem' }, contractDate: { header: '계약일', width: '8rem', align: 'center' }, startDate: { header: '착수일', width: '8rem', align: 'center' }, endDate: { header: '완료예정일', width: '8rem', align: 'center' }, completionDate: { header: '최종 완료일', width: '8rem', align: 'center' }, totalAmount: { header: '총 계약금액', width: '10rem', align: 'right' }, totalEquityAmount: { header: '총 지분금액', width: '10rem', align: 'right' }, equityRatio: { header: '지분율', width: '5rem', align: 'center' }, isRevised: { header: '변경', width: '4rem', align: 'center' }, stopDate: { header: '중지일', width: '8rem', align: 'center' }, restartDate: { header: '재개일', width: '8rem', align: 'center' }, invoiceCount: { header: '청구', width: '4rem', align: 'center' }, progressRate: { header: '기성율', width: '5rem', align: 'center' }, balance: { header: '잔금', width: '10rem', align: 'right' }, remarks: { header: '비고', width: '15rem' },};
const FIXED_COLUMNS = ['status', 'projectIdentifier'];
const getInitialVisibleColumns = () => Object.keys(ALL_COLUMNS).reduce((acc, key) => ({ ...acc, [key]: true }), {});
const LOCAL_STORAGE_KEY_COLUMNS = 'projectPage_visibleColumns_vFinal';
const LOCAL_STORAGE_KEY_VIEW = 'projectPage_viewMode_vFinal';

const formatDate = (dateValue) => { if (!dateValue) return '-'; let date; if (!isNaN(dateValue) && String(dateValue).length > 10) { date = new Date(Number(dateValue)); } else { date = new Date(dateValue); } if (isNaN(date.getTime())) { const num = Number(dateValue); if (!isNaN(num)) { const numDate = new Date(num); if(!isNaN(numDate.getTime())) return numDate.toISOString().split('T')[0]; } return dateValue; } return date.toISOString().split('T')[0]; };
const formatCurrency = (amount) => amount != null ? `${Number(amount).toLocaleString('ko-KR')}` : '0';
const truncateText = (text, maxLength) => { if (typeof text !== 'string' || text.length <= maxLength) return text; return text.substring(0, maxLength) + '...'; };

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem(LOCAL_STORAGE_KEY_VIEW) || 'list');
  const [visibleColumns, setVisibleColumns] = useState(() => { try { const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COLUMNS); return saved ? { ...getInitialVisibleColumns(), ...JSON.parse(saved) } : getInitialVisibleColumns(); } catch(e) { return getInitialVisibleColumns(); }});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [sortConfig, setSortConfig] = useState({ key: 'projectIdentifier', direction: 'desc' });
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_COLUMNS, JSON.stringify(visibleColumns)); }, [visibleColumns]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_VIEW, viewMode); }, [viewMode]);
  
  const fetchProjects = () => { setLoading(true); fetch('http://localhost:5001/api/projects').then(res => res.ok ? res.json() : Promise.reject(new Error('서버 응답 실패'))).then(data => setProjects(Array.isArray(data) ? data : [])).catch(err => setError("데이터 로딩 실패")).finally(() => setLoading(false)); };
  useEffect(() => { fetchProjects(); }, []);

  const handleSort = (key) => { let direction = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') { direction = 'desc'; } setSortConfig({ key, direction }); };
  const handleSelectAll = (e) => { if (e.target.checked) setSelectedRows(new Set(processedData.map(p => p.projectId))); else setSelectedRows(new Set()); };
  const handleSelectRow = (id) => { const newSelectedRows = new Set(selectedRows); if (newSelectedRows.has(id)) newSelectedRows.delete(id); else newSelectedRows.add(id); setSelectedRows(newSelectedRows); };
  const getStatusBadge = (status) => { switch(status) { case '완료': return 'bg-blue-500/20 text-blue-300'; case '진행중': return 'bg-green-500/20 text-green-300'; case '중지': return 'bg-red-500/20 text-red-400'; default: return 'bg-gray-500/20 text-gray-400'; }};
  const handleExport = () => { window.location.href = 'http://localhost:5001/api/projects/export'; };
  const handleFileChange = (event) => { setSelectedFile(event.target.files[0]); };
  const handleImport = async () => { if (!selectedFile) { alert('업로드할 파일을 선택해주세요.'); return; } const formData = new FormData(); formData.append('file', selectedFile); try { const response = await fetch('http://localhost:5001/api/projects/import', { method: 'POST', body: formData }); const result = await response.json(); if (!response.ok) throw new Error(result.error || '서버 오류'); let alertMessage = result.message; if (result.errors && result.errors.length > 0) { const errorDetails = result.errors.map(e => `\n- ${e.row}행: ${e.reason}`).join(''); alertMessage += `\n\n[오류 상세]\n${errorDetails}`; } alert(alertMessage); fetchProjects(); setSelectedFile(null); document.getElementById('project-file-input').value = null; } catch (error) { alert('업로드 실패: ' + error.message); } };
  const handleDelete = async () => { const idsToDelete = Array.from(selectedRows); if (idsToDelete.length === 0) { alert('삭제할 프로젝트를 선택해주세요.'); return; } if (window.confirm(`선택된 ${idsToDelete.length}개의 프로젝트를 정말로 삭제하시겠습니까?`)) { try { const response = await fetch('http://localhost:5001/api/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: idsToDelete }), }); const result = await response.json(); if (!response.ok) throw new Error(result.error || '삭제 중 오류 발생'); alert(result.message); setSelectedRows(new Set()); fetchProjects(); } catch (error) { alert(`삭제 실패: ${error.message}`); } } };
  
  const processedData = useMemo(() => {
    let data = [...projects].filter(p => statusFilter === '전체' || p.status === statusFilter).filter(p => { const term = searchTerm.toLowerCase(); if (!term) return true; return Object.values(p).some(val => String(val).toLowerCase().includes(term)); });
    if (sortConfig.key) { data.sort((a, b) => { if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1; if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1; if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1; if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1; return 0; }); }
    return data;
  }, [projects, searchTerm, statusFilter, sortConfig]);

  const isAllSelected = processedData.length > 0 && selectedRows.size === processedData.length;
  
  const formatCell = (project, key) => { const value = project[key]; if (value === null || value === undefined) return '-'; switch (key) { case 'projectName': case 'clientNames': return truncateText(value, 10); case 'contractDate': case 'startDate': case 'endDate': case 'stopDate': case 'restartDate': case 'completionDate': return formatDate(value); case 'status': return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)}`}>{value}</span>; case 'totalAmount': case 'totalEquityAmount': case 'balance': return `${formatCurrency(value)} 원`; case 'equityRatio': case 'progressRate': return `${Math.round(value)}%`; case 'invoiceCount': return value > 0 ? `${value}회` : '-'; default: return value; }};

  if (loading) return <div className="p-6 text-center text-text-muted">프로젝트 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow overflow-hidden">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator flex-wrap gap-2">
            <div className="flex items-center space-x-2">
                {selectedRows.size > 0 && (<button onClick={handleDelete} className="bg-red-600 text-white text-sm font-bold py-2 px-3 rounded hover:bg-red-700">선택 삭제 ({selectedRows.size})</button>)}
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm">
                    <option value="전체">상태 (전체)</option><option value="진행중">진행중</option><option value="완료">완료</option><option value="중지">중지</option>
                </select>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="전체 검색..." className="w-64 bg-input-bg border border-separator rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div className="flex items-center space-x-2">
                <div className="flex items-center bg-input-bg border border-separator rounded-md p-0.5">
                    <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-accent text-white' : 'text-text-muted'}`}><ListBulletIcon /></button>
                    <button onClick={() => setViewMode('card')} className={`p-1 rounded ${viewMode === 'card' ? 'bg-accent text-white' : 'text-text-muted'}`}><Squares2X2Icon /></button>
                </div>
                <ColumnSelector allColumns={ALL_COLUMNS} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} fixedColumns={FIXED_COLUMNS} />
                <button onClick={handleExport} className="bg-green-600 text-white text-sm font-bold py-2 px-3 rounded hover:bg-green-700">내보내기</button>
                <div className="flex items-center bg-input-bg border border-separator rounded-md">
                    <input id="project-file-input" type="file" onChange={handleFileChange} accept=".xlsx, .xls" className="text-sm p-1.5 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                    <button onClick={handleImport} className="bg-blue-600 text-white text-sm font-bold py-2 px-3 rounded-r-md hover:bg-blue-700 disabled:bg-gray-500" disabled={!selectedFile}>불러오기</button>
                </div>
                <button onClick={() => navigate('/projects/new')} className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover">+ 신규 등록</button>
            </div>
        </div>
        
        {viewMode === 'list' ? (
          <div className="flex-grow overflow-auto">
            <table className="text-sm text-left" style={{ minWidth: '1800px' }}>
              <thead className="sticky top-0 bg-table-header text-table-header-text uppercase z-10">
                <tr>
                  <th style={{ width: '3rem' }} className="p-2 text-center border-b border-separator"><input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} /></th>
                  {Object.keys(ALL_COLUMNS).map(key => visibleColumns[key] && ( <th key={key} style={{ width: ALL_COLUMNS[key].width }} className={`p-2 whitespace-nowrap border-b border-separator text-${ALL_COLUMNS[key].align || 'left'} cursor-pointer`} onDoubleClick={() => handleSort(key)}> {ALL_COLUMNS[key].header} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''} </th> ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-separator">
                {processedData.length > 0 ? ( processedData.map(p => ( <tr key={p.projectId} className="hover:bg-tab-hover cursor-pointer" onDoubleClick={() => navigate(`/projects/${p.projectId}`)}> <td className="p-2 text-center"><input type="checkbox" checked={selectedRows.has(p.projectId)} onChange={() => handleSelectRow(p.projectId)} onClick={(e) => e.stopPropagation()}/></td> {Object.keys(ALL_COLUMNS).map(key => visibleColumns[key] && ( <td key={key} className={`p-2 whitespace-nowrap overflow-hidden text-ellipsis text-${ALL_COLUMNS[key].align || 'left'}`} title={p[key]}>{formatCell(p, key)}</td> ))} </tr> )) ) : ( <tr><td colSpan={Object.values(visibleColumns).filter(v => v).length + 1} className="p-6 text-center text-text-muted">표시할 프로젝트가 없습니다.</td></tr> )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-grow overflow-auto p-4">{processedData.length === 0 ? <div className="text-center text-text-muted">표시할 프로젝트가 없습니다.</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{processedData.map(p => (<div key={p.projectId} className="bg-card-bg-darker rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/projects/${p.projectId}`)}><div className="flex justify-between items-start"><h3 className="font-bold text-lg mb-2 truncate" title={p.projectName}>{p.projectName}</h3><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(p.status)}`}>{p.status}</span></div><p className="text-sm text-text-muted truncate" title={p.clientNames}>{p.clientNames}</p><p className="text-xs text-text-muted mt-1">{p.projectIdentifier}</p></div>))}</div>}</div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;