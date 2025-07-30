import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const InfoCard = ({ title, children, className = '' }) => (
  <div className={`bg-[--card] p-5 rounded-lg shadow-md ${className}`}>
    <h3 className="text-sm text-[--text-secondary] mb-2">{title}</h3>
    <div className="text-xl font-semibold">{children}</div>
  </div>
);
const TabButton = ({ label, active }) => (
    <button className={`py-2 px-5 text-md ${active ? 'border-b-2 border-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}>{label}</button>
);

const ProjectDetail = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    useEffect(() => {
        fetch(`http://localhost:3000/api/projects/${projectId}`)
            .then(res => res.json()).then(data => setProject(data));
    }, [projectId]);

    if (!project) return <div className="text-center">Loading...</div>;

    const totalBalance = (project.total_amount || 0) - (project.billed_amount || 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard title="총괄 계약명" className="lg:col-span-2">{project.project_name}</InfoCard>
                <InfoCard title="계약상대자">{project.client_name}</InfoCard>
                <InfoCard title="담당 PM">{project.pm_name}</InfoCard>
                
                <InfoCard title="주요 사업일정" className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
                        <div><dt className="text-xs text-[--text-secondary]">계약일</dt><dd>{project.contract_date || '-'}</dd></div>
                        <div><dt className="text-xs text-[--text-secondary]">착수일</dt><dd>{project.start_date || '-'}</dd></div>
                        <div><dt className="text-xs text-[--text-secondary]">완료예정일</dt><dd>{project.end_date || '-'}</dd></div>
                        <div><dt className="text-xs text-[--text-secondary]">실제완료일</dt><dd className="text-green-400">{project.completion_date || '진행중'}</dd></div>
                    </div>
                </InfoCard>
                <InfoCard title="금액 정보">
                     <div className="grid grid-cols-2 gap-4 text-base">
                        <div><dt className="text-xs text-[--text-secondary]">총 계약금액</dt><dd>{project.total_amount?.toLocaleString()} 원</dd></div>
                        <div><dt className="text-xs text-[--text-secondary]">총 입금액</dt><dd>{project.billed_amount?.toLocaleString() || 0} 원</dd></div>
                        <div><dt className="text-xs text-[--text-secondary]">총 지분금액</dt><dd className="text-green-400">{project.equity_amount?.toLocaleString() || '-'} 원</dd></div>
                        <div><dt className="text-xs text-[--text-secondary]">현재 잔액</dt><dd className="text-red-500">{totalBalance.toLocaleString()} 원</dd></div>
                    </div>
                </InfoCard>
                 <InfoCard title="계약 정보" className="lg:col-span-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
                        <div><dt className="text-xs text-[--text-secondary]">프로젝트 넘버</dt><dd>{project.project_number}</dd></div>
                        <div><dt className="text-xs text-[--text-secondary]">계약형태</dt><dd>{project.contract_type || '일반'}</dd></div>
                        <div><dt className="text-xs text-[--text-secondary]">구분</dt><dd>{project.category || '공공'}</dd></div>
                    </div>
                </InfoCard>
            </div>

            <div className="bg-[--card] rounded-lg">
                <div className="flex border-b border-[--border] px-2">
                    <TabButton label="세부 계약" active={true} />
                    <TabButton label="참여 기술인" />
                    <TabButton label="청구/재무" />
                    <TabButton label="특이사항" />
                    <TabButton label="첨부 파일" />
                </div>
                <div className="p-6">
                    {/* 하단 탭 콘텐츠 */}
                    <p className="text-[--text-secondary]">세부 계약 내역 (구현 예정)</p>
                </div>
            </div>
        </div>
    );
};
export default ProjectDetail;