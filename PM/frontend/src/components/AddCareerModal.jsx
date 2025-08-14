import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddCareerModal = ({ isOpen, onClose, technicianId, onCareerAdded }) => {
    const [formData, setFormData] = useState({ project_id: '', participation_field: '', assigned_task: '', role: '', participation_start_date: '', participation_end_date: '' });
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (isOpen) {
            axios.get('http://localhost:4000/api/projects').then(res => setProjects(res.data));
        }
    }, [isOpen]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:4000/api/technicians/${technicianId}/career`, formData);
            onCareerAdded();
        } catch (err) { console.error("경력 추가 실패:", err); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-1/3">
                <h2 className="text-xl font-bold mb-4">기술경력 추가</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="project_id" onChange={handleChange} required className="w-full p-2 border rounded">
                        <option value="">프로젝트 선택</option>
                        {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                    </select>
                    <input type="text" name="participation_field" placeholder="참여분야" onChange={handleChange} required className="w-full p-2 border rounded"/>
                    <input type="text" name="assigned_task" placeholder="담당업무" onChange={handleChange} required className="w-full p-2 border rounded"/>
                    <input type="text" name="role" placeholder="직무" onChange={handleChange} required className="w-full p-2 border rounded"/>
                    <input type="date" name="participation_start_date" onChange={handleChange} required className="w-full p-2 border rounded"/>
                    <input type="date" name="participation_end_date" onChange={handleChange} required className="w-full p-2 border rounded"/>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">취소</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddCareerModal;
