import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
// --- 존재하지 않는 Card, Button 컴포넌트 import 제거 ---
// import Card from '../components/Card';
// import Button from '../components/Button';
import { Plus, Edit, Trash2, Printer } from 'lucide-react';

const TechniciansPage = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTechs, setSelectedTechs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const fetchTechnicians = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/technicians');
            setTechnicians(response.data.data);
        } catch (error) {
            console.error("Failed to fetch technicians:", error);
        } finally {
            setLoading(false);
        }
    };

    // handleDelete, handleSelect, handleSelectAll, handlePrint 함수는 그대로 유지됩니다.
    const handleDelete = async (id) => { console.log("Delete:", id) };
    const handleSelect = (techId) => {
        setSelectedTechs(prev => 
            prev.includes(techId) 
            ? prev.filter(id => id !== techId) 
            : [...prev, techId]
        );
    };
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedTechs(technicians.map(t => t.technician_id));
        } else {
            setSelectedTechs([]);
        }
    };
    const handlePrint = () => { console.log("Print:", selectedTechs) };

    if (loading) {
        return <div className="text-center py-10 text-white">기술인 목록을 불러오는 중...</div>;
    }

    // Card 컴포넌트를 일반 div 태그로 대체합니다.
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">기술인 목록</h2>
                <div className="flex items-center space-x-2">
                    {/* Button 컴포넌트를 일반 button 태그로 대체합니다. */}
                    <button onClick={handlePrint} disabled={selectedTechs.length === 0} className="flex items-center px-3 py-2 bg-gray-600 rounded-md text-sm hover:bg-gray-500 disabled:opacity-50">
                        <Printer size={16} className="mr-2" />
                        선택 항목 출력
                    </button>
                    <button onClick={() => navigate('/technicians/new')} className="flex items-center px-3 py-2 bg-blue-600 rounded-md text-sm hover:bg-blue-500">
                        <Plus size={16} className="mr-2" />
                        기술인 추가
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="w-12 px-4 py-3">
                                <input 
                                    type="checkbox" 
                                    onChange={handleSelectAll} 
                                    checked={technicians.length > 0 && selectedTechs.length === technicians.length}
                                    className="bg-gray-900 border-gray-600 rounded"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">이름 (클릭 시 상세정보)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">이메일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">재직 상태</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {technicians.map((tech) => (
                            <tr key={tech.technician_id}>
                                <td className="px-4 py-4">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedTechs.includes(tech.technician_id)} 
                                        onChange={() => handleSelect(tech.technician_id)}
                                        className="bg-gray-900 border-gray-600 rounded"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link to={`/technicians/${tech.technician_id}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                                        {tech.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{tech.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tech.employment_status === 'ACTIVE' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                                        {tech.employment_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => navigate(`/technicians/edit/${tech.technician_id}`)} className="text-gray-400 hover:text-blue-400 p-1 rounded-full">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(tech.technician_id)} className="text-gray-400 hover:text-red-400 p-1 rounded-full">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TechniciansPage;
