import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, Calendar, DollarSign } from 'lucide-react';

const ProjectCard = ({ project, isSelected, onSelect }) => {
  const navigate = useNavigate();
  if (!project) return null;

  const handleCardClick = (e) => {
    // 체크박스 클릭 시에는 네비게이션 방지
    if (e.target.closest('input[type="checkbox"]')) return;
    navigate(`/projects/${project.id}`);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case '완료': return { text: '완료', color: 'bg-blue-500/20 text-blue-300' };
      default: return { text: '진행중', color: 'bg-green-500/20 text-green-300' };
    }
  };
  
  const formatCurrency = (amount) => {
    if (amount == null) return '-';
    return `${Math.round(amount / 10000).toLocaleString('ko-KR')} 만원`;
  };

  const statusInfo = getStatusInfo(project.status);

  return (
    <div onClick={handleCardClick} className={`relative flex flex-col bg-card-bg rounded-lg p-4 border transition-all shadow-md cursor-pointer ${isSelected ? 'border-accent' : 'border-separator hover:border-accent'}`}>
      
      {/* [수정 1] 겹침 현상 해결: 헤더 영역을 좌/우로 명확히 분리 */}
      <div className="flex justify-between items-start mb-3">
        {/* 좌측 정보 영역 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <p className="text-sm text-text-muted truncate" title={project.project_no}>{project.project_no}</p>
            <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.color} flex-shrink-0`}>{statusInfo.text}</span>
          </div>
          <h3 className="font-bold text-md text-text-color truncate mt-1" title={project.project_name}>{project.project_name}</h3>
        </div>
        {/* 우측 선택박스 영역 */}
        <div className="flex-shrink-0 ml-2 mt-1">
          <input type="checkbox" checked={isSelected} onChange={() => onSelect(project.id)} onClick={(e) => e.stopPropagation()} className="h-5 w-5 rounded"/>
        </div>
      </div>

      <div className="flex-grow space-y-2 text-sm text-text-muted mb-4">
        <div className="flex items-center"><Briefcase size={14} className="mr-2 flex-shrink-0" /><span className="truncate" title={project.client}>{project.client || '-'}</span></div>
        <div className="flex items-center"><User size={14} className="mr-2 flex-shrink-0" /><span className="truncate">{project.manager || '-'}</span></div>
        <div className="flex items-center"><Calendar size={14} className="mr-2 flex-shrink-0" /><span className="truncate">{project.start_date ? new Date(project.start_date).toLocaleDateString('ko-KR') : '?'} ~ {project.end_date ? new Date(project.end_date).toLocaleDateString('ko-KR') : '?'}</span></div>
      </div>
      
      <div className="mt-auto pt-3 border-t border-separator space-y-3">
        {/* [수정 2] 핵심 정보 추가: 계약 금액 정보 */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted flex items-center"><DollarSign size={12} className="mr-1"/>총 지분금액</span>
          <span className="font-bold text-base text-text-color">{formatCurrency(project.contract_amount)}</span>
        </div>
        
        {/* 기성율 정보 */}
        <div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-muted">기성율</span>
            <span className="font-bold text-lg text-text-color">{project.progress_rate || 0}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
            <div className="bg-accent h-1.5 rounded-full" style={{ width: `${project.progress_rate || 0}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;