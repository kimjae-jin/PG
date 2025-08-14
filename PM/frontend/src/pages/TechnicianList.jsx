import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TechnicianList = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/technicians');
                setTechnicians(response.data);
            } catch (err) {
                setError('기술인력 데이터를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchTechnicians();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">기술인력 관리</h1>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2">이름</th>
                        <th className="py-2">이메일</th>
                    </tr>
                </thead>
                <tbody>
                    {technicians.map(tech => (
                        <tr key={tech.technician_id}>
                            <td className="border px-4 py-2">
                                <Link to={`/technicians/${tech.technician_id}`} className="text-blue-500 hover:underline">
                                    {tech.name}
                                </Link>
                            </td>
                            <td className="border px-4 py-2">{tech.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TechnicianList;
