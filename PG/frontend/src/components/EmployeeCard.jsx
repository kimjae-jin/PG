import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone } from 'lucide-react';

const EmployeeCard = ({ employee, isSelected, onSelect }) => {
  const navigate = useNavigate();
  if (!employee) return null;

  const handleCardClick = (e) => {
    if (e.target.closest('input[type="checkbox"]')) return;
    navigate(`/employees/${employee.employeeId}`);
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
      case '재직': return 'bg-green-500/20 text-green-300';
      case '휴직': return 'bg-yellow-500/20 text-yellow-300';
      case '퇴사': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div onClick={handleCardClick} className="relative flex flex-col bg-card-bg rounded-lg p-4 border border-separator cursor-pointer hover:border-accent transition-all shadow-md">
      <div className="absolute top-3 right-3"><input type="checkbox" checked={isSelected} onChange={() => onSelect(employee.employeeId)} onClick={e => e.stopPropagation()} className="h-5 w-5 rounded text-accent bg-gray-700 border-gray-600 focus:ring-accent"/></div>
      <div className="flex items-center mb-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-4">
          {employee.photoUrl ? <img src={employee.photoUrl} alt={employee.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-6 h-6 text-text-muted" />}
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-text-color truncate" title={employee.name}>{employee.name}</h3>
            <p className="text-sm text-text-muted truncate" title={employee.position}>{employee.position || '직책 정보 없음'}</p>
        </div>
      </div>
      <div className="mb-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(employee.status)}`}>{employee.status || '상태없음'}</span></div>
      <div className="space-y-2 text-sm mt-auto">
        <div className="flex items-center text-text-muted"><Phone className="w-4 h-4 mr-2 flex-shrink-0" /><span className="truncate">{employee.emergencyContact || '-'}</span></div>
        <div className="flex items-center text-text-muted"><Mail className="w-4 h-4 mr-2 flex-shrink-0" /><span className="truncate">{employee.email || '-'}</span></div>
      </div>
    </div>
  );
};
export default EmployeeCard;