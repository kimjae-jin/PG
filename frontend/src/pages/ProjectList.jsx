import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectList = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/projects')
            .then(res => res.json())
            .then(data => setProjects(data));
    }, []);

    const handleRowClick = (id) => {
        navigate(`/projects/${id}`);
    };
    
    const StatusBadge = ({ status }) => {
        let bgColor = 'bg-accent-primary'; // 기본값
        if (status === '진행중') bgColor = 'bg-accent-secondary';
        if (status === '완료') bgColor = 'bg-tertiary text-text-secondary';
        if (status === '보류') bgColor = 'bg-yellow-500'; // 보류는 유지
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${bgColor}`}>{status}</span>
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div></div>
                <button className="bg-accent-primary text-white font-bold py-2 px-4 rounded hover:opacity-80">+ 신규등록</button>
            </div>
            <div className="bg-secondary rounded-lg overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-text-secondary uppercase text-xs bg-tertiary">
                        <tr>
                            <th className="p-4">상태</th>
                            <th className="p-4">프로젝트 넘버</th>
                            <th className="p-4">구분</th>
                            <th className="p-4">계약명</th>
                            <th className="p-4 text-right">계약금액</th>
                            <th className="p-4">계약일</th>
                            <th className="p-4">시작일</th>
                            <th className="p-4">완료예정일</th>
                            <th className="p-4">완료일</th>
                            <th className="p-4">PM</th>
                            <th className="p-4 text-center">기성율</th>
                            <th className="p-4">비고</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-primary">
                        {projects.map(p => {
                            const progress = p.equity_amount > 0 ? ((p.billed_amount / p.equity_amount) * 100).toFixed(0) : 0;
                            return (
                                <tr key={p.id} onClick={() => handleRowClick(p.id)} className="hover:bg-tertiary cursor-pointer">
                                    <td className="p-4"><StatusBadge status={p.status || '진행중'} /></td>
                                    <td className="p-4 font-semibold text-text-primary">{p.project_number}</td>
                                    <td className="p-4 text-text-secondary">{p.category}</td>
                                    <td className="p-4 text-text-primary">{p.project_name}</td>
                                    <td className="p-4 text-right text-text-primary">{p.total_amount?.toLocaleString()}</td>
                                    <td className="p-4 text-text-secondary">{p.contract_date}</td>
                                    <td className="p-4 text-text-secondary">{p.start_date}</td>
                                    <td className="p-4 text-text-secondary">{p.end_date}</td>
                                    <td className="p-4 text-text-secondary">{p.completion_date || '-'}</td>
                                    <td className="p-4 text-text-primary">{p.pm_name}</td>
                                    <td className="p-4 text-center text-text-primary">{progress}%</td>
                                    <td className="p-4 text-text-secondary">{p.remarks || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectList;