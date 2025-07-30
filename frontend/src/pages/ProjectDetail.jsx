import React, 'useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const InfoCard = ({ title, children, className = '' }) => (
    <div className={`bg-navy-light p-4 rounded-lg shadow-lg ${className}`}>
        <h3 className="text-xs text-gray-400 font-semibold mb-2">{title}</h3>
        <div>{children}</div>
    </div>
);

const TabButton = ({ label, active }) => (
    <button className={`py-2 px-4 text-sm ${active ? 'border-b-2 border-accent-blue text-white' : 'text-gray-400 hover:text-white'}`}>
        {label}
    </button>
);

const ProjectDetail = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:3000/api/projects/${projectId}`)
            .then(res => res.json())
            .then(data => setProject(data));
    }, [projectId]);

    if (!project) return <div className="text-center">Loading...</div>;

    const balance = (project.equity_amount || 0) - (project.billed_amount || 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <InfoCard title="총괄 계약명" className="lg:col-span-2">
                    <p className="text-2xl font-bold">{project.project_name}</p>
                </InfoCard>
                <InfoCard title="계약상대자">
                    <p className="text-2xl font-bold">{project.client_name}</p>
                </InfoCard>
                
                <InfoCard title="담당 PM">
                    <p className="text-xl font-semibold">{project.pm_name}</p>
                </InfoCard>
                <InfoCard title="주요 사업일정">
                    <div className="space-y-2 text-sm">
                        <div className="info-item"><span className="info-label">계약일</span> <span className="info-value">{project.contract_date || '-'}</span></div>
                        <div className="info-item"><span className="info-label">착수일</span> <span className="info-value">{project.start_date}</span></div>
                        <div className="info-item"><span className="info-label">완료예정일</span> <span className="info-value">{project.end_date}</span></div>
                        <div className="info-item"><span className="info-label">실제완료일</span> <span className="info-value text-accent-green">{project.completion_date || '진행중'}</span></div>
                    </div>
                </InfoCard>
                <InfoCard title="금액 정보">
                    <div className="space-y-1 text-sm">
                        <div className="info-item"><span className="info-label">총 계약금액</span> <span className="info-value">{project.total_amount?.toLocaleString()} 원</span></div>
                        <div className="info-item"><span className="info-label">총 입금액</span> <span className="info-value">{project.billed_amount?.toLocaleString() || 0} 원</span></div>
                        <div className="info-item"><span className="info-label">총 지분금액</span> <span className="info-value text-accent-green">{project.equity_amount?.toLocaleString()} 원</span></div>
                        <div className="info-item"><span className="info-label">현재 잔액</span> <span className="info-value text-accent-red">{balance.toLocaleString()} 원</span></div>
                    </div>
                </InfoCard>
                
                <InfoCard title="계약 정보" className="lg:col-span-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="info-item"><span className="info-label">프로젝트 넘버</span> <span className="info-value">{project.project_number}</span></div>
                        <div className="info-item"><span className="info-label">주 계약번호</span> <span className="info-value">-</span></div>
                        <div className="info-item"><span className="info-label">계약형태</span> <span className="info-value">{project.contract_type || '일반'}</span></div>
                        <div className="info-item"><span className="info-label">구분</span> <span className="info-value">{project.category || '공공'}</span></div>
                    </div>
                </InfoCard>
            </div>

            <div className="bg-navy-light rounded-lg">
                <div className="flex border-b border-navy-lighter px-2">
                    <TabButton label="참여 기술인" />
                    <TabButton label="세부 계약" active={true} />
                    <TabButton label="청구/재무" />
                    <TabButton label="첨부 파일" />
                </div>
                <div className="p-4">
                     <p className="text-gray-400 text-sm">변경 계약 내역 (구현 예정)</p>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;