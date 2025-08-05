import React from 'react';
import { useParams, Link } from 'react-router-dom';

const CompanyDetail = () => {
  const { companyId } = useParams();
  const isNew = !companyId || companyId === 'new';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isNew ? '신규 관계사 등록' : `관계사 상세 정보 (ID: ${companyId})`}</h1>
        <Link to="/companies"><button className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-700">목록으로</button></Link>
      </div>
      <div className="bg-card-bg p-6 rounded-lg">
        <p className="text-text-muted">이 페이지는 상세 정보 표시 및 수정 기능을 담당합니다. (구현 예정)</p>
      </div>
    </div>
  );
};

export default CompanyDetail;