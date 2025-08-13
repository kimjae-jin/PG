import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CompanyDetail = () => {
    const { id } = useParams();
    // const [company, setCompany] = useState(null);

    return (
        <div className="p-6 bg-transparent h-full">
            <div className="bg-card-bg p-6 rounded-lg shadow-lg h-full">
                <div className="flex items-center space-x-3 mb-6">
                    <Link to="/companies" className="p-2 rounded-md hover:bg-tab-hover">
                       <ArrowLeft className="w-5 h-5 text-text-muted" />
                    </Link>
                   <h1 className="text-2xl font-bold text-text-color">관계사 상세 정보 (ID: {id})</h1>
                </div>
                <div className="text-center text-text-muted py-20">
                    <p>관계사 상세 정보 페이지입니다.</p>
                    <p>향후 이곳에 회사 기본 정보, 거래 내역, 관련 프로젝트 목록 등이 표시될 것입니다.</p>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetail;