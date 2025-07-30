import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
    let colorClass = 'bg-gray-500';
    if (status === '진행중') colorClass = 'bg-green-500';
    if (status === '완료') colorClass = 'bg-blue-500';
    if (status === '보류') colorClass = 'bg-yellow-500';
    
    return (
        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${colorClass}`}>
            {status || 'N/A'}
        </span>
    );
};


const ProjectList = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/projects')
            .then(res => res.json()).then(data => setProjects(data));
    }, []);

    const ProgressCircle = ({ percentage }) => { /* 이전과 동일 */ };
    
    return (
        <div>
            <div className="flex justify-end items-center mb-6">
                <button className="bg-[--accent] text-white font-bold py-2 px-4 rounded hover:opacity-80 transition-opacity">+ 신규등록</button>
            </div>
            <div className="bg-[--card] rounded-lg overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-[--text-secondary] uppercase text-xs">
                        <tr>
                            <th className="p-4">상태</th>
                            <th className="p-4">프로젝트 넘버</th>
                            <th className="p-4">구분</th>
                            <th className="p-4">계약명</th>
                            <th className="p-4">계약금액</th>
                            <th className="p-4">계약일</th>
                            <th className="p-4">시작일</th>
                            <th className="p-4">완료예정일</th>
                            <th className="p-4">PM</th>
                            <th className="p-4">기성율</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => {
                            const progress = p.equity_amount > 0 ? ((p.billed_amount / p.equity_amount) * 100).toFixed(0) : 0;
                            return (
                                <tr key={p.id} className="border-b border-[--border] last:border-b-0">
                                    <td className="p-4"><StatusBadge status={p.status} /></td>
                                    <td className="p-4"><Link to={`/projects/${p.id}`} className="hover:text-[--accent] font-semibold">{p.project_number}</Link></td>
                                    <td className="p-4">{p.category}</td>
                                    <td className="p-4">{p.project_name}</td>
                                    <td className="p-4">{p.total_amount?.toLocaleString()}</td>
                                    <td className="p-4">{p.contract_date}</td>
                                    <td className="p-4">{p.start_date}</td>
                                    <td className="p-4">{p.end_date}</td>
                                    <td className="p-4">{p.pm_name}</td>
                                    <td className="p-4 text-center">{progress}%</td>
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