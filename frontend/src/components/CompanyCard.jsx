import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Phone, Mail } from 'lucide-react';

const CompanyCard = ({ company, isSelected, onSelect }) => {
  const navigate = useNavigate();
  if (!company) return null;

  const handleCardClick = (e) => {
    if (e.target.closest('input[type="checkbox"]')) return;
    navigate(`/companies/${company.id}`);
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
      case '정상': return 'bg-green-500/20 text-green-300';
      case '휴업': return 'bg-yellow-500/20 text-yellow-300';
      case '폐업': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div onClick={handleCardClick} className="relative flex flex-col bg-card-bg rounded-lg p-4 border border-separator cursor-pointer hover:border-accent transition-all shadow-md">
      <div className="absolute top-3 right-3"><input type="checkbox" checked={isSelected} onChange={() => onSelect(company.id)} onClick={e => e.stopPropagation()} className="h-5 w-5 rounded text-accent bg-gray-700 border-gray-600 focus:ring-accent"/></div>
      <div className="flex items-center mb-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3"><Briefcase className="w-5 h-5 text-text-muted" /></div>
        <div className="flex-1 min-w-0"><h3 className="font-bold text-lg text-text-color truncate" title={company.name}>{company.name || '관계사명'}</h3><p className="text-sm text-text-muted truncate" title={company.ceo_name}>{company.ceo_name || '대표자명'}</p></div>
      </div>
      <div className="mb-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(company.status)}`}>{company.status || '상태없음'}</span></div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-text-muted"><Phone className="w-4 h-4 mr-2 flex-shrink-0" /><span className="truncate">{company.phone_number || '-'}</span></div>
        <div className="flex items-center text-text-muted"><Mail className="w-4 h-4 mr-2 flex-shrink-0" /><span className="truncate">{company.work_manager_email || '-'}</span></div>
      </div>
      <div className="mt-auto pt-4 text-xs text-right text-text-muted"><span>거래 횟수: </span><span className="font-semibold text-text-color">{company.transaction_count || 0}회</span></div>
    </div>
  );
};
export default CompanyCard;