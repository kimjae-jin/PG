import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Award, BookOpen, Briefcase, GraduationCap, Building } from 'lucide-react';

// --- 재사용 하위 컴포넌트 ---
const InfoCard = ({ icon, label, value, className = '' }) => (
    <div className={`bg-card-bg p-4 rounded-lg flex flex-col items-center justify-center text-center ${className}`}>
        <div className="flex items-center text-sm text-text-muted mb-2">
            {React.createElement(icon, { size: 16, className: "mr-2" })}
            <span>{label}</span>
        </div>
        <p className="font-bold text-lg text-text-color truncate w-full" title={value}>{value || '-'}</p>
    </div>
);
const SectionCard = ({ title, actionText, onAction, children }) => (
    <div className="bg-card-bg p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-text-color">{title}</h3>
            {onAction && <button onClick={onAction} className="text-sm bg-accent text-white py-1 px-3 rounded hover:bg-accent-hover">{actionText}</button>}
        </div>
        <div>{children}</div>
    </div>
);
const TabButton = ({ label, name, activeTab, setActiveTab }) => (<button onClick={() => setActiveTab(name)} className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === name ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-color'}`}>{label}</button>);
const EmptyState = ({ message }) => (<p className="text-text-muted text-sm p-4 text-center">{message}</p>);
const Table = ({ headers, children }) => (
    <table className="w-full text-sm text-left">
        <thead className="text-xs text-text-muted uppercase">
            <tr>{headers.map(h => <th key={h} className="py-2 px-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
    </table>
);

// --- 메인 상세 페이지 컴포넌트 ---
const EmployeeDetail = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const isNew = !employeeId || employeeId === 'new';

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('licenses');

    useEffect(() => {
        if (!isNew) {
            setLoading(true);
            fetch(`http://localhost:5001/api/employees/${employeeId}`)
                .then(res => res.ok ? res.json() : Promise.reject('Not Found'))
                .then(data => { setEmployee(data); setLoading(false); })
                .catch(err => { setError('데이터를 불러오는데 실패했습니다.'); setLoading(false); });
        }
    }, [employeeId, isNew]);

    if (loading) return <div className="p-6 text-center text-text-muted">기술인 정보를 불러오는 중입니다...</div>;
    if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

    const data = employee || {};

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-color">기술인 / {data.name || '신규 등록'}</h1>
                <button onClick={() => {}} className="bg-green-600 text-white font-bold px-4 py-2 rounded-md hover:bg-green-700">
                    {isNew ? '저장' : '정보 수정'}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard icon={User} label="사원번호" value={data.employeeCode} />
                <InfoCard icon={Briefcase} label="상태" value={data.status} />
                <InfoCard icon={Phone} label="연락처" value={data.emergencyContact} />
                <InfoCard icon={Mail} label="이메일" value={data.email} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="학력 사항" actionText="+ 추가" onAction={() => {}}>
                    <EmptyState message="- 등록된 학력 정보가 없습니다." />
                </SectionCard>
                <SectionCard title="보유 자격증/교육" actionText="+ 추가" onAction={() => {}}>
                    {data.qualifications && data.qualifications.length > 0 ? (
                        <Table headers={['자격/교육명', '완료일', '유효기간']}>
                            {data.qualifications.map(q => 
                                <tr key={q.qualificationId} className="border-b border-separator">
                                    <td className="py-2 px-2">{q.name}</td>
                                    <td className="py-2 px-2">{q.completedDate}</td>
                                    <td className="py-2 px-2">{q.expiryDate}</td>
                                </tr>
                            )}
                        </Table>
                    ) : <EmptyState message="- 등록된 자격증/교육 정보가 없습니다." />}
                </SectionCard>
            </div>
            
            <div className="bg-card-bg rounded-lg">
                <div className="border-b border-separator px-4">
                    <nav className="flex space-x-4">
                        <TabButton label="적용 면허" name="licenses" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton label="참여 프로젝트" name="projects" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'licenses' && (
                        <div>
                            {data.appliedLicenses && data.appliedLicenses.length > 0 ? (
                                <Table headers={['면허 분류', '면허명', '역할']}>
                                    {data.appliedLicenses.map(l => 
                                        <tr key={l.licenseId} className="border-b border-separator">
                                            <td className="py-2 px-2">{l.category}</td>
                                            <td className="py-2 px-2">{l.name}</td>
                                            <td className="py-2 px-2">{l.role}</td>
                                        </tr>
                                    )}
                                </Table>
                            ) : <EmptyState message="- 적용된 면허 정보가 없습니다." />}
                        </div>
                    )}
                    {activeTab === 'projects' && <EmptyState message="- 참여한 프로젝트 정보가 없습니다. (구현 예정)" />}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetail;