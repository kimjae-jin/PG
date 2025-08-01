import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    useEffect(() => {
        fetch('http://localhost:3000/api/companies')
            .then(res => res.json()).then(data => setCompanies(data));
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div></div>
                <button className="bg-dark-accent text-white font-bold py-2 px-4 rounded hover:bg-blue-500 transition-colors">+ 신규등록</button>
            </div>
            <div className="bg-dark-card rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-dark-text-secondary uppercase text-sm">
                        <tr>
                            <th className="p-4">관계사명</th><th className="p-4">회계 담당자</th>
                            <th className="p-4">과업 담당자</th><th className="p-4">진행 프로젝트</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(c => (
                            <tr key={c.id} className="border-b border-dark-border hover:bg-gray-700">
                                <td className="p-4">{c.name}</td>
                                <td className="p-4">{c.accounting_contact}</td>
                                <td className="p-4">{c.task_contact}</td>
                                <td className="p-4">{c.active_projects}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default CompanyList;