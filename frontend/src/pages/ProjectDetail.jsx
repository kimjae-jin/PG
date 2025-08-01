// frontend/src/pages/ProjectDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useOutletContext } from 'react-router-dom';

const InfoCard = ({ title, children, className = '' }) => (<div className={`bg-card-bg p-4 rounded-lg shadow-md ${className}`}><h3 className="text-xs text-text-muted font-semibold mb-2 uppercase">{title}</h3><div>{children}</div></div>);
const TabButton = ({ label, name, activeTab, setActiveTab }) => (<button onClick={() => setActiveTab(name)} className={`py-3 px-4 text-sm font-semibold transition-colors duration-200 ${activeTab === name ? 'border-b-2 border-accent text-text-color' : 'text-text-muted hover:text-text-color hover:bg-tab-hover'}`}>{label}</button>);
const TableHeader = ({ headers }) => (<thead className="bg-table-header text-table-header-text uppercase text-xs"><tr>{headers.map(h => <th key={h} className={`p-3 font-semibold ${h.includes('금액') || h.includes('미수금') ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>);
const TechniciansTab = () => (<div className="space-y-4"><div className="flex justify-between items-center"><h4 className="font-bold text-text-color">전체 참여 기술인</h4><button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover transition-opacity">+ 기술인 추가</button></div><div className="overflow-x-auto rounded-lg border border-separator"><p className="p-8 text-center text-text-muted">- 기능 구현 예정 -</p></div></div>);
const NotesTab = ({ projectId }) => { const [notes, setNotes] = useState([]); const [newNote, setNewNote] = useState(''); const [isSaving, setIsSaving] = useState(false); const [isLoading, setIsLoading] = useState(true); useEffect(() => { setIsLoading(true); fetch(`http://localhost:5001/api/projects/${projectId}/notes`).then(res => res.json()).then(data => { setNotes(data); setIsLoading(false); }).catch(err => { console.error('특이사항 로딩 오류:', err); setIsLoading(false); }); }, [projectId]); const handleSaveNote = async () => { if (!newNote.trim()) return; setIsSaving(true); try { const response = await fetch(`http://localhost:5001/api/projects/${projectId}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: newNote }), }); if (!response.ok) throw new Error('저장 실패'); const savedNote = await response.json(); setNotes(prevNotes => [savedNote, ...prevNotes]); setNewNote(''); } catch (error) { console.error('특이사항 저장 오류:', error); } finally { setIsSaving(false); } }; if (isLoading) return <p className="text-text-muted">특이사항 로딩 중...</p>; return ( <div className="space-y-6"> <div><h4 className="font-bold text-text-color mb-2">특이사항 수동 기록</h4><textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows="3" className="w-full p-2 bg-input-bg border border-separator rounded-md text-text-color focus:ring-2 focus:ring-accent focus:outline-none" placeholder="기록할 내용을 입력하세요..."></textarea><button onClick={handleSaveNote} disabled={isSaving || !newNote.trim()} className="mt-2 bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed">{isSaving ? '저장 중...' : '기록 저장'}</button></div> <div><h4 className="font-bold text-text-color mb-2">전체 기록</h4><div className="space-y-4">{notes.map(note => (<div key={note.id} className="flex items-start space-x-3 p-3 bg-tab-inactive rounded-md"><div className="flex-shrink-0 text-accent text-xl pt-1">{note.note.startsWith('[') ? '⚙️' : '👤'}</div><div className="flex-grow"><p className="text-text-color break-words">{note.note}</p><div className="text-xs text-text-muted mt-1"><span>{new Date(note.created_at).toLocaleString('ko-KR')}</span></div></div></div>))}</div></div> </div> ); };
const FinanceTab = ({ projectId }) => { const [billings, setBillings] = useState([]); const [loading, setLoading] = useState(true); useEffect(() => { setLoading(true); fetch(`http://localhost:5001/api/projects/${projectId}/billing`).then(res => res.json()).then(data => { setBillings(data); setLoading(false); }).catch(err => { console.error("Billing data fetch error:", err); setLoading(false); }); }, [projectId]); if (loading) return <p className="text-text-muted">청구/재무 데이터 로딩 중...</p>; return ( <div className="space-y-4"> <div className="flex justify-between items-center"><h4 className="font-bold text-text-color">청구 및 입금 내역</h4><button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover transition-opacity">+ 신규 청구 등록</button></div> <div className="overflow-x-auto rounded-lg border border-separator"><table className="w-full text-left text-sm whitespace-nowrap"><TableHeader headers={['청구구분', '청구일', '청구금액', '입금일', '입금금액', '미수금', '비고']} /><tbody className="divide-y divide-separator">{billings.length === 0 ? (<tr><td colSpan="7" className="text-center p-8 text-text-muted">- 청구/입금 내역이 없습니다 -</td></tr>) : (billings.map((item, index) => { const outstanding = (item.request_amount || 0) - (item.deposit_amount || 0); return (<tr key={index} className="hover:bg-tab-hover"><td className="p-3 font-semibold">{item.request_type}</td><td className="p-3">{item.request_date ? new Date(item.request_date).toLocaleDateString('ko-KR') : '-'}</td><td className="p-3 text-right">{item.request_amount?.toLocaleString() || 0} 원</td><td className="p-3">{item.deposit_date ? new Date(item.deposit_date).toLocaleDateString('ko-KR') : '-'}</td><td className="p-3 text-right text-green-500 font-semibold">{item.deposit_amount?.toLocaleString() || 0} 원</td><td className={`p-3 text-right font-semibold ${outstanding > 0 ? 'text-red-500' : ''}`}>{outstanding.toLocaleString()} 원</td><td className="p-3 text-xs">{item.note}</td></tr>)}))}</tbody></table></div> </div> ); };

const ProjectDetail = () => {
    const { id } = useParams();
    const { setProjectNo } = useOutletContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'finance');
    
    useEffect(() => {
        setSearchParams({ tab: activeTab }, { replace: true });
    }, [activeTab, setSearchParams]);

    useEffect(() => {
        if (!id) { setError('유효하지 않은 프로젝트 ID입니다.'); setIsLoading(false); return; }
        setIsLoading(true);
        fetch(`http://localhost:5001/api/projects/${id}`)
          .then(res => { if (!res.ok) throw new Error('프로젝트 정보를 찾을 수 없습니다.'); return res.json(); })
          .then(data => { setProject(data); setProjectNo(data.project_no); setIsLoading(false); })
          .catch(err => { setError(err.message); setIsLoading(false); });
        return () => setProjectNo('');
    }, [id, setProjectNo]);

    const renderTabContent = () => {
        if (!id) return null;
        switch (activeTab) {
            case 'technicians': return <TechniciansTab />;
            case 'details': return <p className="text-text-muted text-sm">세부 계약 내역 (구현 예정)</p>;
            case 'finance': return <FinanceTab projectId={id} />;
            case 'notes': return <NotesTab projectId={id} />;
            case 'files': return <p className="text-text-muted text-sm">첨부 파일 목록 (구현 예정)</p>;
            default: return <FinanceTab projectId={id} />;
        }
    };
    
    if (isLoading) return <div className="p-8 text-center text-text-muted">프로젝트 상세 정보를 불러오는 중입니다...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!project) return <div className="p-8 text-center text-text-muted">프로젝트 데이터가 없습니다.</div>;
    
    const equityRate = project.contract_amount > 0 ? Math.round((project.equity_amount || 0) * 100 / project.contract_amount) : 0;
    const balance = (project.equity_amount || 0) - (project.billed_amount || 0);
    const statusColor = project.status === '완료' ? 'text-blue-500' : 'text-green-500';
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* [최종 수정] 함장님의 원본 설계대로 모든 정보 카드를 완벽하게 복원합니다. */}
                <InfoCard title="계약 정보" className="md:col-span-2 lg:col-span-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="font-semibold text-text-muted">프로젝트 넘버:</span> {project.project_no}</div>
                        <div><span className="font-semibold text-text-muted">주 계약번호:</span> -</div>
                        <div><span className="font-semibold text-text-muted">계약형태:</span> 일반</div>
                        <div><span className="font-semibold text-text-muted">구분:</span> 공공</div>
                    </div>
                </InfoCard>

                <InfoCard title="총괄 계약명" className="md:col-span-2 lg:col-span-2"><p className="text-2xl font-bold text-text-color break-words">{project.project_name}</p></InfoCard>
                <InfoCard title="계약상대자"><p className="text-xl font-bold text-text-color">{project.client}</p></InfoCard>
                <InfoCard title="담당자/비고"><p className="text-xl font-semibold text-text-color">{project.manager}</p></InfoCard>
                <InfoCard title="주요 사업일정"><div className="space-y-2 text-sm"><div><span className="font-semibold text-text-muted w-20 inline-block">계약일:</span> <span>{project.contract_date ? new Date(project.contract_date).toLocaleDateString('ko-KR') : '-'}</span></div><div><span className="font-semibold text-text-muted w-20 inline-block">착수일:</span> <span>{new Date(project.start_date).toLocaleDateString('ko-KR')}</span></div><div><span className="font-semibold text-text-muted w-20 inline-block">완료예정일:</span> <span>{new Date(project.end_date).toLocaleDateString('ko-KR')}</span></div><div><span className="font-semibold text-text-muted w-20 inline-block">현재상태:</span> <span className={`font-bold ${statusColor}`}>{project.status}</span></div></div></InfoCard>
                
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
            <div className="bg-card-bg rounded-lg shadow-md">
                <div className="flex border-b border-separator overflow-x-auto">
                    <TabButton label="청구/재무" name="finance" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="특이사항" name="notes" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="참여 기술인" name="technicians" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="세부 계약" name="details" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="첨부 파일" name="files" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                <div className="p-4 md:p-6 min-h-[300px]">{renderTabContent()}</div>
            </div>
        </div>
    );
};
export default ProjectDetail;