import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useOutletContext, useNavigate } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';

// --- 하위 컴포넌트 정의 ---

const InfoCard = ({ title, children, className = '' }) => (<div className={`bg-card-bg p-4 rounded-lg shadow-md ${className}`}><h3 className="text-xs text-text-muted font-semibold mb-2 uppercase">{title}</h3><div>{children}</div></div>);
const TabButton = ({ label, name, activeTab, setActiveTab }) => (<button onClick={() => setActiveTab(name)} className={`py-3 px-4 text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${activeTab === name ? 'border-b-2 border-accent text-text-color' : 'border-transparent text-text-muted hover:text-text-color hover:bg-tab-hover'}`}>{label}</button>);
const TableHeader = ({ headers }) => (<thead className="bg-table-header text-table-header-text uppercase text-xs sticky top-0 z-10"><tr>{headers.map(h => <th key={h} className={`p-3 font-semibold ${h.includes('금액') || h.includes('미수금') ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>);
const TechniciansTab = () => (<div className="h-full flex flex-col"><div className="flex-shrink-0 flex justify-between items-center mb-4"><h4 className="font-bold text-text-color">전체 참여 기술인</h4><button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover transition-opacity">+ 기술인 추가</button></div><div className="flex-grow overflow-y-auto rounded-lg border border-separator"><p className="p-8 text-center text-text-muted">- 기능 구현 예정 -</p></div></div>);
const NotesTab = ({ projectId }) => { const [notes, setNotes] = useState([]); const [isLoading, setIsLoading] = useState(true); useEffect(() => { setIsLoading(true); console.warn(`[안정화 모드] NotesTab: /api/projects/${projectId}/notes API 호출이 비활성화되었습니다.`); setNotes([]); setIsLoading(false); }, [projectId]); if (isLoading) return <p className="text-text-muted">특이사항 로딩 중...</p>; return ( <div className="space-y-6"> <div><h4 className="font-bold text-text-color mb-2">특이사항 수동 기록</h4><textarea rows="3" className="w-full p-2 bg-input-bg border border-separator rounded-md text-text-color" placeholder="기록할 내용을 입력하세요... (API 연결 필요)" disabled></textarea><button disabled className="mt-2 bg-accent text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">기록 저장</button></div> <div><h4 className="font-bold text-text-color mb-2">전체 기록</h4><div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">{notes.length > 0 ? notes.map(note => (<div key={note.id} />)) : <p className="p-4 text-center text-text-muted">- 기록이 없습니다 -</p>}</div></div> </div> ); };
const FinanceTab = ({ projectId }) => { const [billings, setBillings] = useState([]); const [loading, setLoading] = useState(true); useEffect(() => { setLoading(true); console.warn(`[안정화 모드] FinanceTab: /api/projects/${projectId}/billing API 호출이 비활성화되었습니다.`); setBillings([]); setLoading(false); }, [projectId]); if (loading) return <p className="text-text-muted">청구/재무 데이터 로딩 중...</p>; return ( <div className="h-full flex flex-col"> <div className="flex-shrink-0 flex justify-between items-center mb-4"><h4 className="font-bold text-text-color">청구 및 입금 내역</h4><button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover transition-opacity">+ 신규 청구 등록</button></div> <div className="flex-grow overflow-y-auto rounded-lg border border-separator"><table className="w-full text-left text-sm whitespace-nowrap"><TableHeader headers={['청구구분', '청구일', '청구금액', '입금일', '입금금액', '미수금', '비고']} /><tbody className="divide-y divide-separator"><tr><td colSpan="7" className="text-center p-8 text-text-muted">- 청구/입금 내역이 없습니다 -</td></tr></tbody></table></div> </div> ); };
const DetailsTab = ({ projectId }) => {
    const [subContracts, setSubContracts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setIsLoading(true);
        console.warn(`[안정화 모드] DetailsTab: /api/projects/${projectId}/sub-contracts API 호출이 비활성화되었습니다.`);
        setSubContracts([]);
        setIsLoading(false);
    }, [projectId]);
    if (isLoading) return <p className="text-text-muted">세부 계약 정보 로딩 중...</p>;
    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4"><h4 className="font-bold text-text-color">차수별 / 변경 계약 내역</h4><button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover transition-opacity">+ 신규 계약 추가</button></div>
            <div className="flex-grow overflow-y-auto rounded-lg border border-separator"><table className="w-full text-left text-sm whitespace-nowrap"><TableHeader headers={['계약명', '계약(변경)일', '계약 금액', '구분']} /><tbody className="divide-y divide-separator"><tr><td colSpan="4" className="text-center p-8 text-text-muted">- 등록된 세부 계약이 없습니다 -</td></tr></tbody></table></div>
        </div>
    );
};
const FormInput = ({ label, name, value, onChange, type = 'text', as = 'input' }) => {
    const commonProps = { id: name, name: name, value: value || '', onChange: onChange, className: "mt-1 block w-full bg-input-bg border border-separator rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" };
    return (<div><label htmlFor={name} className="block text-sm font-medium text-text-muted">{label}</label>{as === 'textarea' ? <textarea {...commonProps} rows="4" /> : <input type={type} {...commonProps} />}</div>);
};
const DocumentAutomationTab = ({ projectId }) => {
  const [isGenerating, setIsGenerating] = useState(null);
  const [error, setError] = useState(null);
  const documentsToGenerate = [
    { name: 'usage_seal_certificate', displayName: '[제주시청] 사용인감계' },
    // { name: '01_...', displayName: '[제주시청] 수의계약 체결 제한 여부 확인서' },
    // ... 다른 7개 문서 추가 ...
  ];
  const handleGenerateDocument = async (templateName, displayName) => {
    setIsGenerating(templateName);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/documents/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: projectId, templateName: templateName }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || '문서 생성에 실패했습니다.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${displayName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('문서 생성 오류:', err);
      setError(err.message);
    } finally {
      setIsGenerating(null);
    }
  };
  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center mb-4"><h4 className="font-bold text-text-color">자동 문서 생성 (제주시청 서식)</h4></div>
      {error && <p className="text-red-500 mb-4 p-2 bg-red-900/50 rounded-md">오류: {error}</p>}
      <div className="flex-grow overflow-y-auto rounded-lg border border-separator p-4 space-y-3">
        {documentsToGenerate.map(doc => (
          <div key={doc.name} className="flex items-center justify-between p-3 bg-tab-inactive rounded-md">
            <div className="flex items-center"><FileText className="w-5 h-5 text-accent mr-3" /><span className="text-text-color">{doc.displayName}</span></div>
            <button onClick={() => handleGenerateDocument(doc.name, doc.displayName)} disabled={isGenerating !== null} className="flex items-center bg-accent text-white font-bold py-2 px-3 rounded text-sm hover:bg-accent-hover disabled:opacity-50 disabled:cursor-wait"><Download className="w-4 h-4 mr-2" />{isGenerating === doc.name ? '생성 중...' : '생성 및 다운로드'}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 메인 컴포넌트 ---
const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useOutletContext();
    const setProjectNo = context ? context.setProjectNo : () => {};
    const [searchParams, setSearchParams] = useSearchParams();
    const isNew = !id || id === 'new';
    const [isEditing, setIsEditing] = useState(isNew);
    const [project, setProject] = useState(null);
    const [originalProject, setOriginalProject] = useState(null);
    const [isLoading, setIsLoading] = useState(!isNew);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'documents');
    
    useEffect(() => { setSearchParams({ tab: activeTab }, { replace: true }); }, [activeTab, setSearchParams]);
    
    useEffect(() => {
        const nullToEmptyString = (obj) => {
            if (!obj) return {};
            const newObj = {};
            for (const key in obj) { newObj[key] = obj[key] === null ? '' : obj[key]; }
            return newObj;
        };
        if (isNew) {
            const newProjectTemplate = { project_no: '', project_name: '', client: '', manager: '', status: '진행중', contract_date: '', start_date: '', end_date: '', completion_date: '', contract_amount: '', equity_amount: '', remarks: '', special_notes: '' };
            setProject(newProjectTemplate);
            if (setProjectNo) setProjectNo('신규 등록');
        } else {
            setIsLoading(true);
            fetch(`http://localhost:5001/api/projects/${id}`)
                .then(res => { if (!res.ok) throw new Error('프로젝트 정보를 찾을 수 없습니다.'); return res.json(); })
                .then(data => {
                    const formattedData = nullToEmptyString(data);
                    setProject(formattedData);
                    setOriginalProject(formattedData);
                    if (setProjectNo) setProjectNo(data.project_no);
                })
                .catch(err => { setError(err.message); })
                .finally(() => setIsLoading(false));
        }
        return () => { if (setProjectNo) setProjectNo(''); };
    }, [id, isNew, setProjectNo, navigate]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'date' && value === '') {
            setProject(prev => ({ ...prev, [name]: null }));
        } else {
            setProject(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCancel = () => {
        setProject(originalProject);
        setIsEditing(false);
    };

    const handleSave = async () => {
        const url = isNew ? '/api/projects' : `/api/projects/${id}`;
        const method = isNew ? 'POST' : 'PUT';
        const projectDataToSend = { ...project };
        ['contract_date', 'start_date', 'end_date', 'completion_date'].forEach(key => {
            if (projectDataToSend[key] === '') projectDataToSend[key] = null;
        });
        try {
            const response = await fetch(`http://localhost:5001${url}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectDataToSend),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || '저장에 실패했습니다.');
            }
            const result = await response.json();
            alert('성공적으로 저장되었습니다.');
            if (isNew) {
                navigate(`/projects/${result.id}`, { replace: true });
            } else {
                setOriginalProject(project);
                setIsEditing(false);
            }
        } catch (err) {
            alert(`오류: ${err.message}`);
        }
    };

    const renderTabContent = () => {
        if (isNew) return <p className="p-8 text-center text-text-muted">프로젝트를 먼저 저장해야 세부 정보를 볼 수 있습니다.</p>;
        switch (activeTab) {
            case 'documents': return <DocumentAutomationTab projectId={id} />;
            case 'technicians': return <TechniciansTab />;
            case 'details': return <DetailsTab projectId={id} />;
            case 'finance': return <FinanceTab projectId={id} />;
            case 'notes': return <NotesTab projectId={id} />;
            case 'files': return <p className="text-text-muted text-sm">첨부 파일 목록 (구현 예정)</p>;
            default: return <DocumentAutomationTab projectId={id} />;
        }
    };

    if (isLoading) return <div className="p-8 text-center text-text-muted">프로젝트 상세 정보를 불러오는 중입니다...</div>;
    if (error) return <div className="p-8 text-center text-text-muted">{error}</div>;
    if (!project) return <div className="p-8 text-center text-text-muted">프로젝트 데이터가 없습니다.</div>;

    const equityRate = project.contract_amount > 0 ? Math.round((project.equity_amount || 0) * 100 / project.contract_amount) : 0;
    const balance = (project.equity_amount || 0) - (project.billed_amount || 0);
    const statusColor = project.status === '완료' ? 'text-blue-500' : 'text-green-500';

    return (
        <div className="p-6 md:p-8 flex flex-col h-full gap-6">
            <div className="flex-shrink-0 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-color">{isNew ? '신규 프로젝트 등록' : '프로젝트 상세 정보'}</h1>
                <div>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-md mr-2 hover:bg-blue-700">저장</button>
                            {!isNew && <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">취소</button>}
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-green-600 text-white font-bold px-4 py-2 rounded-md hover:bg-green-700">정보 수정</button>
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
                            <select id="status" name="status" value={project.status} onChange={handleChange} className="mt-1 block w-full bg-input-bg border border-separator rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm">
                                <option value="진행중">진행중</option>
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
                            <InfoCard title="계약 정보" className="xl:col-span-1">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="font-semibold text-text-muted">프로젝트 넘버:</span> {project.project_no}</div>
                                    <div><span className="font-semibold text-text-muted">구분:</span> 공공</div>
                                    <div><span className="font-semibold text-text-muted">주 계약번호:</span> -</div>
                                    <div><span className="font-semibold text-text-muted">계약형태:</span> 일반</div>
                                </div>
                            </InfoCard>
                            <InfoCard title="총괄 계약명" className="xl:col-span-2">
                                <p className="text-2xl font-bold text-text-color break-words">{project.project_name}</p>
                            </InfoCard>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                            <InfoCard title="담당자"><p className="text-xl font-bold text-text-color">{project.manager}</p></InfoCard>
                            <InfoCard title="계약상대자"><p className="text-xl font-bold text-text-color">{project.client}</p></InfoCard>
                            <InfoCard title="주요 사업일정">
                                <div className="space-y-2 text-sm">
                                    <div><span className="font-semibold text-text-muted w-20 inline-block">계약일:</span> <span>{project.contract_date ? new Date(project.contract_date).toLocaleDateString('ko-KR') : '-'}</span></div>
                                    <div><span className="font-semibold text-text-muted w-20 inline-block">착수일:</span> <span>{project.start_date ? new Date(project.start_date).toLocaleDateString('ko-KR') : '-'}</span></div>
                                    <div><span className="font-semibold text-text-muted w-20 inline-block">완료예정일:</span> <span>{project.end_date ? new Date(project.end_date).toLocaleDateString('ko-KR') : '-'}</span></div>
                                    <div><span className="font-semibold text-text-muted w-20 inline-block">현재상태:</span> <span className={`font-bold ${statusColor}`}>{project.status}</span></div>
                                </div>
                            </InfoCard>
                            <InfoCard title="금액 정보">
                                <div className="space-y-1 text-sm">
                                    <div><span className="font-semibold text-text-muted w-24 inline-block">총 계약금액:</span> <span className="font-mono">{project.contract_amount?.toLocaleString()} 원</span></div>
                                    <div><span className="font-semibold text-text-muted w-24 inline-block">총 지분금액:</span> <span className="font-mono">{project.equity_amount?.toLocaleString()} 원 ({equityRate}%)</span></div>
                                    <div><span className="font-semibold text-text-muted w-24 inline-block">부가세 적용:</span> <span className="font-mono">Y</span></div>
                                    <hr className="my-2 border-separator"/>
                                    <div><span className="font-semibold text-text-muted w-24 inline-block">총 입금액:</span> <span className="font-mono text-green-500">{project.billed_amount?.toLocaleString() || 0} 원</span></div>
                                    <div><span className="font-semibold text-text-muted w-24 inline-block">현재 잔액:</span> <span className={`font-mono ${balance > 0 ? 'text-red-500' : ''}`}>{balance.toLocaleString()} 원</span></div>
                                </div>
                            </InfoCard>
                        </div>
                    </div>
                    
                    <div className="bg-card-bg rounded-lg shadow-md flex-grow flex flex-col overflow-hidden">
                        <div className="flex-shrink-0 border-b border-separator overflow-x-auto">
                            <TabButton label="문서 관리" name="documents" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton label="청구/재무" name="finance" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton label="특이사항" name="notes" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton label="세부 계약" name="details" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton label="참여 기술인" name="technicians" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton label="첨부 파일" name="files" activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>
                        <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                            {renderTabContent()}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProjectDetail;