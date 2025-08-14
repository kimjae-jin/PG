import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Download, Plus, Edit, X, Save, Paperclip, Eye, DownloadCloud } from 'lucide-react';
import AddRevisionModal from '../components/AddRevisionModal';
import FileUploadModal from '../components/FileUploadModal';

// --- 하위 컴포넌트 정의 ---

const InfoCard = ({ title, children, className = '' }) => (
    <div className={`bg-card-bg p-4 rounded-lg shadow-md ${className}`}>
        <h3 className="text-xs text-text-muted font-semibold mb-2 uppercase">{title}</h3>
        <div>{children}</div>
    </div>
);

const TabButton = ({ label, name, activeTab, setActiveTab }) => (
    <button 
        onClick={() => setActiveTab(name)} 
        className={`py-3 px-4 text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${activeTab === name ? 'border-b-2 border-accent text-text-color' : 'border-transparent text-text-muted hover:text-text-color hover:bg-tab-hover'}`}
    >
        {label}
    </button>
);

const FormInput = ({ label, name, value, onChange, type = 'text', as = 'input' }) => {
    const commonProps = {
        id: name,
        name: name,
        value: value || '',
        onChange: onChange,
        className: "mt-1 block w-full bg-input-bg border border-separator rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
    };
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-text-muted">{label}</label>
            {as === 'textarea' ? <textarea {...commonProps} rows="4" /> : <input type={type} {...commonProps} />}
        </div>
    );
};

// [수정됨] 누락된 모든 필드를 복원한 DetailsTab 컴포넌트
const DetailsTab = ({ projectId, revisions, onAddFileClick }) => {
    const headers = ["적용일", "구분", "변경사항/사유", "계약일", "착수일", "완료일", "지분금액", "비고", "첨부파일"];
    const TableHeader = ({ headers }) => (
        <thead className="bg-table-header text-table-header-text uppercase text-xs sticky top-0 z-10">
            <tr>
                {headers.map(h => <th key={h} className="p-3 font-semibold text-left whitespace-nowrap">{h}</th>)}
            </tr>
        </thead>
    );
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto rounded-lg border border-separator">
                <table className="w-full text-left text-sm">
                    <TableHeader headers={headers} />
                    <tbody className="divide-y divide-separator">
                        {revisions && revisions.length > 0 ? (
                            revisions.map(rev => (
                                <tr key={rev.id}>
                                    <td className="p-3">{rev.status_change_date ? new Date(rev.status_change_date).toLocaleDateString('ko-KR') : '-'}</td>
                                    <td className="p-3 font-semibold">{rev.revision_type}</td>
                                    <td className="p-3 whitespace-pre-wrap min-w-[200px]">{rev.reason}</td>
                                    <td className="p-3">{rev.contract_date ? new Date(rev.contract_date).toLocaleDateString('ko-KR') : '-'}</td>
                                    <td className="p-3">{rev.start_date ? new Date(rev.start_date).toLocaleDateString('ko-KR') : '-'}</td>
                                    <td className="p-3">{rev.end_date ? new Date(rev.end_date).toLocaleDateString('ko-KR') : '-'}</td>
                                    <td className="p-3 text-right font-mono">{rev.total_equity_amount ? rev.total_equity_amount.toLocaleString() : '-'}</td>
                                    <td className="p-3">{rev.remarks}</td>
                                    <td className="p-3">
                                        {rev.attachment_count > 0 ? (
                                            <button onClick={() => window.open(`/projects/${projectId}?tab=files`, '_self')} className="flex items-center text-accent text-xs hover:underline">
                                                <Paperclip size={12} className="mr-1"/> 파일 보기 ({rev.attachment_count})
                                            </button>
                                        ) : (
                                            <button onClick={() => onAddFileClick(rev.id)} className="text-text-muted text-xs hover:text-accent hover:underline">
                                                + 파일 추가
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={headers.length} className="text-center p-8 text-text-muted">- 등록된 이력이 없습니다 -</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const FinanceTab = ({ projectId }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto rounded-lg border border-separator">
                <table className="w-full text-left text-sm border-separate border-spacing-0">
                    <thead className="bg-table-header text-table-header-text uppercase text-xs sticky top-0 z-10">
                        <tr>
                            <th colSpan={2} className="p-2 font-semibold text-center border-b border-separator bg-table-header/80">기본 정보</th>
                            <th colSpan={2} className="p-2 font-semibold text-center border-b border-l border-separator bg-table-header/80">청구</th>
                            <th colSpan={2} className="p-2 font-semibold text-center border-b border-l border-separator bg-table-header/80">입금</th>
                            <th colSpan={3} className="p-2 font-semibold text-center border-b border-l border-separator bg-table-header/80">세금계산서</th>
                            <th colSpan={2} className="p-2 font-semibold text-center border-b border-l border-separator bg-table-header/80">기타</th>
                        </tr>
                        <tr>
                            <th className="p-3 font-semibold text-left whitespace-nowrap">작성일</th>
                            <th className="p-3 font-semibold text-left whitespace-nowrap border-r border-separator">적용일</th>
                            <th className="p-3 font-semibold text-left whitespace-nowrap">청구구분</th>
                            <th className="p-3 font-semibold text-left whitespace-nowrap border-r border-separator">청구금액</th>
                            <th className="p-3 font-semibold text-left whitespace-nowrap">입금일</th>
                            <th className="p-3 font-semibold text-left whitespace-nowrap border-r border-separator">입금금액</th>
                            <th className="p-3 font-semibold text-left whitespace-nowrap">승인번호</th>
                            <th className="p-3 font-semibold text-left whitespace-nowrap">발행금액</th>
                            <th className="p-3 font-semibold text-left whitespace-nowrap border-r border-separator">발행구분</th>
                            <th className="p-3 font-semibold text-left whitespace-nowrap">미수금</th>
                            <th className="p-3 font-semibold text-left whitespace-nowrap">비고</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-separator">
                        <tr><td colSpan={11} className="text-center p-8 text-text-muted">- 청구/입금 내역이 없습니다 -</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TechniciansTab = () => {
    const headers = ["No.", "성명", "생년월일", "자격사항(학력/자격증)", "자격번호", "직무분야", "전문분야", "책임정도", "담당업무", "직책", "시작일", "종료일", "중지일", "재개일", "특이사항", "비고"];
    const TableHeader = ({ headers }) => (<thead className="bg-table-header text-table-header-text uppercase text-xs sticky top-0 z-10"><tr>{headers.map(h => <th key={h} className="p-3 font-semibold text-left whitespace-nowrap">{h}</th>)}</tr></thead>);
    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto rounded-lg border border-separator">
                <table className="w-full text-left text-sm"><TableHeader headers={headers} /><tbody className="divide-y divide-separator"><tr><td colSpan={headers.length} className="text-center p-8 text-text-muted">- 참여 기술인이 없습니다 -</td></tr></tbody></table>
            </div>
        </div>
    );
};

const DocumentAutomationTab = ({ projectId }) => { const [isGenerating, setIsGenerating] = useState(null); const [error, setError] = useState(null); const documentsToGenerate = [{ name: 'usage_seal_certificate', displayName: '[제주시청] 사용인감계' }]; const handleGenerateDocument = async (templateName, displayName) => { setIsGenerating(templateName); setError(null); try { const response = await fetch('http://localhost:5001/api/documents/generate-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: projectId, templateName: templateName }), }); if (!response.ok) { const errData = await response.json(); throw new Error(errData.details || errData.error || '문서 생성에 실패했습니다.'); } const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${displayName}.pdf`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url); } catch (err) { console.error('문서 생성 오류:', err); setError(err.message); } finally { setIsGenerating(null); } }; return ( <div className="h-full flex flex-col"> <div className="flex-shrink-0 flex justify-between items-center mb-4"><h4 className="font-bold text-text-color">자동 문서 생성 (제주시청 서식)</h4></div> {error && <p className="text-red-500 mb-4 p-2 bg-red-900/50 rounded-md">오류: {error}</p>} <div className="flex-grow overflow-y-auto rounded-lg border border-separator p-4 space-y-3"> {documentsToGenerate.map(doc => ( <div key={doc.name} className="flex items-center justify-between p-3 bg-tab-inactive rounded-md"> <div className="flex items-center"><FileText className="w-5 h-5 text-accent mr-3" /><span className="text-text-color">{doc.displayName}</span></div> <button onClick={() => handleGenerateDocument(doc.name, doc.displayName)} disabled={isGenerating !== null} className="flex items-center bg-accent text-white font-bold py-2 px-3 rounded text-sm hover:bg-accent-hover disabled:opacity-50 disabled:cursor-wait"><Download className="w-4 h-4 mr-2" />{isGenerating === doc.name ? '생성 중...' : '생성 및 다운로드'}</button> </div> ))} </div> </div> );};

const FilesTab = ({ projectId }) => {
    const [attachments, setAttachments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const headers = ["파일명", "파일 유형", "연관 이력", "업로드 일시", "작업"];
    const TableHeader = ({ headers }) => (<thead className="bg-table-header text-table-header-text uppercase text-xs sticky top-0 z-10"><tr>{headers.map(h => <th key={h} className="p-3 font-semibold text-left whitespace-nowrap">{h}</th>)}</tr></thead>);
    
    const API_URL = 'http://localhost:5001';

    useEffect(() => {
        const fetchAttachments = async () => {
            try {
                const res = await fetch(`${API_URL}/api/projects/${projectId}/attachments`);
                if(!res.ok) throw new Error('첨부파일 로딩 실패');
                const data = await res.json();
                setAttachments(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttachments();
    }, [projectId]);

    if (isLoading) return <p className="p-8 text-center text-text-muted">첨부 파일 목록을 불러오는 중입니다...</p>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto rounded-lg border border-separator">
                <table className="w-full text-left text-sm">
                    <TableHeader headers={headers} />
                    <tbody className="divide-y divide-separator">
                        {attachments && attachments.length > 0 ? (
                            attachments.map(file => (
                                <tr key={file.id}>
                                    <td className="p-3 font-semibold">{file.original_filename}</td>
                                    <td className="p-3">{file.mime_type}</td>
                                    <td className="p-3">{`${file.status_change_date ? new Date(file.status_change_date).toLocaleDateString('ko-KR') : ''} ${file.revision_type}`}</td>
                                    <td className="p-3">{new Date(file.uploaded_at).toLocaleString('ko-KR')}</td>
                                    <td className="p-3">
                                        <div className="flex items-center space-x-3">
                                            {(file.mime_type.startsWith('image/') || file.mime_type === 'application/pdf') &&
                                                <a href={`${API_URL}/api/attachments/${file.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-accent hover:underline">
                                                    <Eye size={14} className="mr-1" /> 미리보기
                                                </a>
                                            }
                                            <a href={`${API_URL}/api/attachments/${file.id}?download=true`} className="flex items-center text-accent hover:underline">
                                                <DownloadCloud size={14} className="mr-1" /> 다운로드
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={headers.length} className="text-center p-8 text-text-muted">- 첨부된 파일이 없습니다 -</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const NotesTab = ({ projectId }) => { const [notes, setNotes] = useState([]); const [isLoading, setIsLoading] = useState(true); useEffect(() => { setIsLoading(true); console.warn(`[안정화 모드] NotesTab: /api/projects/${projectId}/notes API 호출이 비활성화되었습니다.`); setNotes([]); setIsLoading(false); }, [projectId]); if (isLoading) return <p className="text-text-muted">특이사항 로딩 중...</p>; return ( <div className="space-y-6"> <div><h4 className="font-bold text-text-color mb-2">특이사항 수동 기록</h4><textarea rows="3" className="w-full p-2 bg-input-bg border border-separator rounded-md text-text-color" placeholder="기록할 내용을 입력하세요... (API 연결 필요)" disabled></textarea><button disabled className="mt-2 bg-accent text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">기록 저장</button></div> <div><h4 className="font-bold text-text-color mb-2">전체 기록</h4><div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">{notes.length > 0 ? notes.map(note => (<div key={note.id} />)) : <p className="p-4 text-center text-text-muted">- 기록이 없습니다 -</p>}</div></div> </div> ); };
const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isNew = !id || id === 'new';
    const [isEditing, setIsEditing] = useState(isNew);
    const [project, setProject] = useState(null);
    const [originalProject, setOriginalProject] = useState(null);
    const [revisions, setRevisions] = useState([]);
    const [isLoading, setIsLoading] = useState(!isNew);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'details');
    const [isAddRevisionModalOpen, setIsAddRevisionModalOpen] = useState(false);
    const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
    const [selectedRevisionId, setSelectedRevisionId] = useState(null);
    
    useEffect(() => { setSearchParams({ tab: activeTab }, { replace: true }); }, [activeTab, setSearchParams]);
    
    const fetchProjectData = async () => {
        if (isNew) {
            setProject({ current_status: '진행중' });
            setIsLoading(false);
        } else {
            setIsLoading(true);
            try {
                const [projectRes, revisionsRes] = await Promise.all([
                    fetch(`http://localhost:5001/api/projects/${id}`),
                    fetch(`http://localhost:5001/api/projects/${id}/revisions`)
                ]);

                if (!projectRes.ok) throw new Error('프로젝트 정보를 불러오는 데 실패했습니다.');
                if (!revisionsRes.ok) throw new Error('프로젝트 이력 정보를 불러오는 데 실패했습니다.');

                const projectData = await projectRes.json();
                const revisionsData = await revisionsRes.json();

                setProject(projectData);
                setOriginalProject(projectData);
                setRevisions(revisionsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [id, isNew]);

    // [수정됨] 안정성과 즉각적인 UI 반응을 보장하는 저장 핸들러
    const handleSaveRevision = async (formData) => {
        try {
            const response = await fetch(`http://localhost:5001/api/projects/${id}/revisions`, { method: 'POST', body: formData });
            if (!response.ok) { 
                const errData = await response.json(); 
                throw new Error(errData.details || errData.error || '이력 저장에 실패했습니다.'); 
            }
            // 백엔드가 반환한 새 이력 객체를 직접 상태에 추가
            const newRevision = await response.json();
            setRevisions(prevRevisions => [newRevision, ...prevRevisions]);
            
            // 프로젝트 상태도 최신으로 갱신
            fetch(`http://localhost:5001/api/projects/${id}`).then(res => res.json()).then(data => setProject(data));

            setIsAddRevisionModalOpen(false);
            alert('이력이 성공적으로 추가되었습니다.');
        } catch (err) { 
            alert(`오류: ${err.message}`); 
        }
    };

    const handleOpenUploadModal = (revisionId) => { setSelectedRevisionId(revisionId); setIsFileUploadModalOpen(true); };

    // [수정됨] 파일 업로드 후 이력 목록의 첨부파일 개수도 갱신
    const handleFileUpload = async (revisionId, file) => {
        const formData = new FormData();
        formData.append('attachment', file);
        try {
            const response = await fetch(`http://localhost:5001/api/revisions/${revisionId}/attachments`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('파일 업로드에 실패했습니다.');
            
            // 특정 이력의 attachment_count만 갱신
            setRevisions(prevRevisions => prevRevisions.map(rev => 
                rev.id === revisionId ? { ...rev, attachment_count: rev.attachment_count + 1 } : rev
            ));

            setIsFileUploadModalOpen(false);
            alert('파일이 성공적으로 첨부되었습니다.');
        } catch (err) { 
            alert(`오류: ${err.message}`); 
        }
    };

    const handleChange = (e) => setProject(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleCancel = () => { setProject(originalProject); setIsEditing(false); };
    const handleSave = async () => { /* 저장 로직 */ };

    const renderHeaderActions = () => {
        if (isEditing || isNew) return null;
        const buttonClass = "flex items-center bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded";
        switch (activeTab) {
            case 'details': return <button onClick={() => setIsAddRevisionModalOpen(true)} className={buttonClass}><Plus size={16} className="mr-1"/> 이력 추가</button>;
            case 'finance': return <button className={buttonClass}><Plus size={16} className="mr-1"/> 신규 청구 등록</button>;
            case 'technicians': return <button className={buttonClass}><Plus size={16} className="mr-1"/> 기술인 추가</button>;
            default: return null;
        }
    };

    const renderTabContent = () => {
        if (isNew) return <p className="p-8 text-center text-text-muted">프로젝트를 먼저 저장해야 세부 정보를 볼 수 있습니다.</p>;
        switch (activeTab) {
            case 'details': return <DetailsTab projectId={id} revisions={revisions} onAddFileClick={handleOpenUploadModal} />;
            case 'finance': return <FinanceTab projectId={id} />;
            case 'technicians': return <TechniciansTab />;
            case 'documents': return <DocumentAutomationTab projectId={id} />;
            case 'files': return <FilesTab projectId={id} />;
            case 'notes': return <NotesTab projectId={id} />;
            default: return <DetailsTab projectId={id} revisions={revisions} onAddFileClick={handleOpenUploadModal} />;
        }
    };

    if (isLoading) return <div className="p-8 text-center text-text-muted">데이터를 불러오는 중입니다...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!project) return null;

    const statusColor = project.status === '완료' ? 'text-blue-400' : (project.status === '중지' ? 'text-red-400' : 'text-green-400');
    const equityRate = project.contract_amount > 0 ? Math.round((project.equity_amount || 0) * 100 / project.contract_amount) : 0;
    const balance = (project.equity_amount || 0) - (project.billed_amount || 0);

    return (
        <>
            <AddRevisionModal isOpen={isAddRevisionModalOpen} onClose={() => setIsAddRevisionModalOpen(false)} onSave={handleSaveRevision} />
            <FileUploadModal isOpen={isFileUploadModalOpen} onClose={() => setIsFileUploadModalOpen(false)} onUpload={handleFileUpload} revisionId={selectedRevisionId} />
            <div className="p-6 md:p-8 flex flex-col h-full gap-6">
                <div className="flex-shrink-0 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-text-color">{isEditing ? (isNew ? '신규 프로젝트 등록' : '프로젝트 정보 수정') : project.project_name}</h1>
                    <div className="flex items-center space-x-2">
                        {renderHeaderActions()}
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="flex items-center bg-accent hover:bg-accent-hover font-bold py-2 px-4 rounded"><Save size={16} className="mr-1" /> 저장</button>
                                {!isNew && <button onClick={handleCancel} className="flex items-center bg-gray-600 hover:bg-gray-700 font-bold py-2 px-4 rounded"><X size={16} className="mr-1" /> 취소</button>}
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="flex items-center bg-gray-600 hover:bg-gray-700 font-bold py-2 px-4 rounded"><Edit size={16} className="mr-1" /> 정보 수정</button>
                        )}
                    </div>
                </div>
                {isEditing ? (
                    <div className="flex-grow overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-2"><FormInput label="프로젝트 넘버" name="project_no" value={project.project_no} onChange={handleChange} /></div>
                            <div className="lg:col-span-2"><FormInput label="계약명" name="project_name" value={project.project_name} onChange={handleChange} /></div>
                            <div className="lg:col-span-2"><FormInput label="발주처(계약상대자)" name="client" value={project.client} onChange={handleChange} /></div>
                            <FormInput label="담당 PM" name="manager" value={project.manager} onChange={handleChange} />
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-text-muted">상태</label>
                                <select id="status" name="current_status" value={project.current_status} onChange={handleChange} className="mt-1 block w-full bg-input-bg border border-separator rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm">
                                    <option value="진행중">진행중</option>
                                    <option value="중지">중지</option>
                                    <option value="완료">완료</option>
                                    <option value="보류">보류</option>
                                    <option value="취소">취소</option>
                                </select>
                            </div>
                            <FormInput label="계약일" name="contract_date" value={project.contract_date} onChange={handleChange} type="date" />
                            <FormInput label="착수일" name="start_date" value={project.start_date} onChange={handleChange} type="date" />
                            <FormInput label="완료예정일" name="end_date" value={project.end_date} onChange={handleChange} type="date" />
                            <FormInput label="실제 완료일" name="completion_date" value={project.completion_date} onChange={handleChange} type="date" />
                            <FormInput label="총 계약금액" name="contract_amount" value={project.contract_amount} onChange={handleChange} type="number" />
                            <FormInput label="총 지분금액" name="equity_amount" value={project.equity_amount} onChange={handleChange} type="number" />
                            <div className="lg:col-span-2"><FormInput label="비고" name="remarks" value={project.remarks} onChange={handleChange} /></div>
                            <div className="lg:col-span-4"><FormInput label="주요 특이사항 (기타)" name="special_notes" value={project.special_notes} onChange={handleChange} as="textarea" /></div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-shrink-0">
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                                <InfoCard title="계약 정보" className="xl:col-span-1"><div className="grid grid-cols-2 gap-4 text-sm"><div><span className="font-semibold text-text-muted">프로젝트 넘버:</span> {project.project_no}</div><div><span className="font-semibold text-text-muted">구분:</span> {project.project_category || '공공'}</div><div><span className="font-semibold text-text-muted">주 계약번호:</span> -</div><div><span className="font-semibold text-text-muted">계약형태:</span> {project.contract_type || '일반'}</div></div></InfoCard>
                                <InfoCard title="총괄 계약명" className="xl:col-span-2"><p className="text-2xl font-bold text-text-color break-words">{project.project_name}</p></InfoCard>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                                <InfoCard title="담당자"><p className="text-xl font-bold text-text-color">{project.manager}</p></InfoCard>
                                <InfoCard title="계약상대자"><p className="text-xl font-bold text-text-color">{project.client}</p></InfoCard>
                                <InfoCard title="주요 사업일정">
                                    <div className="space-y-2 text-sm">
                                        <div><span className="font-semibold text-text-muted w-20 inline-block">계약일:</span> <span>{project.contract_date}</span></div>
                                        <div><span className="font-semibold text-text-muted w-20 inline-block">착수일:</span> <span>{project.start_date}</span></div>
                                        <div><span className="font-semibold text-text-muted w-20 inline-block">완료예정일:</span> <span>{project.end_date}</span></div>
                                        <div><span className="font-semibold text-text-muted w-20 inline-block">현재상태:</span> <span className={`font-bold ${statusColor}`}>{project.status}</span></div>
                                        {project.status === '중지' && (
                                            <div className="text-red-400 font-bold"><span className="font-semibold w-20 inline-block">중지일:</span> <span>{project.status_change_date}</span></div>
                                        )}
                                    </div>
                                </InfoCard>
                                <InfoCard title="금액 정보"><div className="space-y-1 text-sm"><div><span className="font-semibold text-text-muted w-24 inline-block">총 계약금액:</span> <span className="font-mono">{project.contract_amount?.toLocaleString()} 원</span></div><div><span className="font-semibold text-text-muted w-24 inline-block">총 지분금액:</span> <span className="font-mono">{project.equity_amount?.toLocaleString()} 원 ({equityRate}%)</span></div><div><span className="font-semibold text-text-muted w-24 inline-block">부가세 적용:</span> <span className="font-mono">Y</span></div><hr className="my-2 border-separator"/><div><span className="font-semibold text-text-muted w-24 inline-block">총 입금액:</span> <span className="font-mono text-green-500">{project.billed_amount?.toLocaleString() || 0} 원</span></div><div><span className="font-semibold text-text-muted w-24 inline-block">현재 잔액:</span> <span className={`font-mono ${balance > 0 ? 'text-red-500' : ''}`}>{balance.toLocaleString()} 원</span></div></div></InfoCard>
                            </div>
                        </div>
                        <div className="bg-card-bg rounded-lg shadow-md flex-grow flex flex-col overflow-hidden">
                            <div className="flex-shrink-0 border-b border-separator overflow-x-auto">
                                <TabButton label="세부 계약" name="details" activeTab={activeTab} setActiveTab={setActiveTab} />
                                <TabButton label="청구/재무" name="finance" activeTab={activeTab} setActiveTab={setActiveTab} />
                                <TabButton label="참여 기술인" name="technicians" activeTab={activeTab} setActiveTab={setActiveTab} />
                                <TabButton label="문서 관리" name="documents" activeTab={activeTab} setActiveTab={setActiveTab} />
                                <TabButton label="첨부 파일" name="files" activeTab={activeTab} setActiveTab={setActiveTab} />
                                <TabButton label="특이사항" name="notes" activeTab={activeTab} setActiveTab={setActiveTab} />
                            </div>
                            <div className="flex-grow p-4 md:p-6 overflow-y-auto">{renderTabContent()}</div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ProjectDetail;