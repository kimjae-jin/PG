import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AddCareerModal from '../components/AddCareerModal';

const TechnicianDetail = () => {
    const { id } = useParams();
    const [technician, setTechnician] = useState(null);
    const [careerHistory, setCareerHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('career');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCareerHistory = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:4000/api/technicians/${id}/career`);
            setCareerHistory(res.data);
        } catch (err) { console.error("경력 조회 실패:", err); }
    }, [id]);

    useEffect(() => {
        const fetchTechnician = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/technicians/${id}`);
                setTechnician(res.data);
                fetchCareerHistory();
            } catch (err) { console.error("기술인 조회 실패:", err); }
        };
        fetchTechnician();
    }, [id, fetchCareerHistory]);

    const handleCareerAdded = () => {
        setIsModalOpen(false);
        fetchCareerHistory();
    };

    if (!technician) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold">{technician.name}</h1>
            <div className="my-4 border-b">
                <button onClick={() => setActiveTab('career')} className={`py-2 px-4 ${activeTab === 'career' ? 'border-b-2 border-blue-500' : ''}`}>기술경력</button>
                <button onClick={() => setActiveTab('certs')} className={`py-2 px-4 ${activeTab === 'certs' ? 'border-b-2 border-blue-500' : ''}`}>자격/교육</button>
            </div>
            {activeTab === 'career' && (
                <div>
                    <button onClick={() => setIsModalOpen(true)} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">+ 경력 추가</button>
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2">프로젝트명</th>
                                <th className="py-2">참여기간</th>
                                <th className="py-2">직무</th>
                            </tr>
                        </thead>
                        <tbody>
                            {careerHistory.map(c => (
                                <tr key={c.career_id}>
                                    <td className="border px-4 py-2">{c.project_name}</td>
                                    <td className="border px-4 py-2">{c.participation_start_date} ~ {c.participation_end_date}</td>
                                    <td className="border px-4 py-2">{c.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {activeTab === 'certs' && <div>자격 및 교육 탭</div>}
            <AddCareerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} technicianId={id} onCareerAdded={handleCareerAdded} />
        </div>
    );
};

export default TechnicianDetail;
