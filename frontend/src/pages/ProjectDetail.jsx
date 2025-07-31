import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useOutletContext } from 'react-router-dom';

const InfoCard = ({ title, children, className = '' }) => (
    <div className={`bg-secondary p-4 rounded-lg shadow-md ${className}`}>
        <h3 className="text-xs text-text-secondary font-semibold mb-2 uppercase">{title}</h3>
        <div>{children}</div>
    </div>
);

const TabButton = ({ label, name, activeTab, setActiveTab }) => {
    const isActive = activeTab === name;
    return (
        <Link to={`?tab=${name}`} replace>
            <button
                onClick={() => setActiveTab(name)}
                className={`py-3 px-4 text-sm font-semibold ${isActive ? 'border-b-2 border-accent-primary text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-tertiary/50'}`}
            >
                {label}
            </button>
        </Link>
    );
};

const TableHeader = ({ headers }) => (
    <thead className="bg-tertiary text-text-secondary uppercase text-xs">
        <tr>
            {headers.map(h => 
                <th key={h} className="p-3 font-semibold text-left">{h}</th>
            )}
        </tr>
    </thead>
);

const TechniciansTab = ({ technicians }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h4 className="font-bold text-text-primary">전체 참여 기술인</h4>
            <button className="bg-accent-primary text-white font-bold py-2 px-4 rounded hover:opacity-90 transition-opacity">+ 기술인 추가</button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border-primary">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <TableHeader headers={['이름', '생년월일', '직책', '직무분야', '전문분야', '책임정도', '담당업무', '시작일', '종료일', '특이사항', '비고', '관리']} />
                <tbody className="divide-y divide-border-primary">
                    {technicians.length === 0 ? (
                        <tr>
                            <td colSpan="12" className="text-center p-8 text-text-secondary">- 참여 기술인이 없습니다 -</td>
                        </tr>
                    ) : (
                        technicians.map(tech => (
                            <tr key={tech.id} className="hover:bg-tertiary">
                                {/* 실제 데이터 렌더링 (구현 예정) */}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const ProjectDetail = () => {
    const { projectId } = useParams();
    const { setPageTitle } = useOutletContext();
    const [searchParams] = useSearchParams();
    const [project, setProject] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'technicians');

    useEffect(() => {
        const currentTab = searchParams.get('tab') || 'technicians';
        if (currentTab !== activeTab) {
            setActiveTab(currentTab);
        }

        fetch(`http://localhost:3000/api/projects/${projectId}`)
            .then(res => res.json())
            .then(data => {
                setProject(data);
                if (data && data.project_number) {
                    setPageTitle(data.project_number);
                }
            });

        fetch(`http://localhost:3000/api/projects/${projectId}/technicians`)
            .then(res => res.json())
            .then(data => setTechnicians(data));

    }, [projectId, searchParams, activeTab, setPageTitle]);

    if (!project) return <div className="text-center text-text-secondary">Loading Project Data...</div>;

    const balance = (project.equity_amount || 0) - (project.billed_amount || 0);
    const statusColor = project.status === '진행중' ? 'text-accent-secondary' : 'text-accent-danger';

    const renderTabContent = () => {
        switch (activeTab) {
            case 'technicians':
                return <TechniciansTab technicians={technicians} />;
            case 'details':
                return <p className="text-text-secondary text-sm">세부 계약 내역 (구현 예정)</p>;
            case 'finance':
                return <p className="text-text-secondary text-sm">청구/재무 내역 (구현 예정)</p>;
            case 'notes':
                return <p className="text-text-secondary text-sm">특이사항 로그 (구현 예정)</p>;
            case 'files':
                return <p className="text-text-secondary text-sm">첨부 파일 목록 (구현 예정)</p>;
            default:
                return <TechniciansTab technicians={technicians} />;
        }
    };
    
    return (
        <div className="space-y-6">
            {/* [핵심 수정] 스크린샷과 동일하게 InfoCard 순서 전면 재배치 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <InfoCard title="계약 정보" className="md:col-span-2 lg:col-span-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="info-item"><span className="info-label">프로젝트 넘버</span> <span className="info-value">{project.project_number}</span></div>
                        <div className="info-item"><span className="info-label">주 계약번호</span> <span className="info-value">-</span></div>
                        <div className="info-item"><span className="info-label">계약형태</span> <span className="info-value">{project.contract_type || '일반'}</span></div>
                        <div className="info-item"><span className="info-label">구분</span> <span className="info-value">{project.category || '공공'}</span></div>
                    </div>
                </InfoCard>

                <InfoCard title="총괄 계약명" className="md:col-span-2 lg:col-span-2">
                    <p className="text-2xl font-bold text-text-primary break-words">{project.project_name}</p>
                </InfoCard>

                <InfoCard title="계약상대자">
                    <p className="text-xl font-bold text-text-primary">{project.client_name}</p>
                </InfoCard>
                
                <InfoCard title="담당 PM">
                    <p className="text-xl font-semibold text-text-primary">{project.pm_name}</p>
                </InfoCard>

                <InfoCard title="주요 사업일정">
                    <div className="space-y-2 text-sm">
                        <div className="info-item"><span className="info-label">계약일</span> <span className="info-value">{project.contract_date || '-'}</span></div>
                        <div className="info-item"><span className="info-label">착수일</span> <span className="info-value">{project.start_date}</span></div>
                        <div className="info-item"><span className="info-label">완료예정일</span> <span className="info-value">{project.end_date}</span></div>
                        <div className="info-item"><span className="info-label">현재상태</span> <span className={`info-value font-bold ${statusColor}`}>{project.status}</span></div>
                    </div>
                </InfoCard>

                <InfoCard title="금액 정보">
                    <div className="space-y-1 text-sm">
                        <div className="info-item"><span className="info-label">총 계약금액</span> <span className="info-value">{project.total_amount?.toLocaleString()} 원</span></div>
                        <div className="info-item"><span className="info-label">총 입금액</span> <span className="info-value">{project.billed_amount?.toLocaleString() || 0} 원</span></div>
                        <div className="info-item"><span className="info-label">현재 잔액</span> <span className="info-value text-accent-danger">{balance.toLocaleString()} 원</span></div>
                    </div>
                </InfoCard>
                
            </div>

            {/* 하단 탭 구간 (변경 없음) */}
            <div className="bg-secondary rounded-lg">
                <div className="flex border-b border-border-primary">
                    <TabButton label="참여 기술인" name="technicians" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="세부 계약" name="details" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="청구/재무" name="finance" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="특이사항" name="notes" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="첨부 파일" name="files" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                <div className="p-4 md:p-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;