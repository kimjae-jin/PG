import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TechnicianDetail = () => {
  const { id } = useParams();
  // 실제로는 여기서 id를 사용해 API로 데이터를 fetch 해야 합니다.
  // const [technician, setTechnician] = useState(null);
  
  return (
    <div className="p-6 bg-transparent h-full">
      <div className="bg-card-bg p-6 rounded-lg shadow-lg h-full">
        <div className="flex items-center space-x-3 mb-6">
            <Link to="/technicians" className="p-2 rounded-md hover:bg-tab-hover">
               <ArrowLeft className="w-5 h-5 text-text-muted" />
            </Link>
           <h1 className="text-2xl font-bold text-text-color">기술인 상세 정보 (ID: {id})</h1>
        </div>
        <div className="text-center text-text-muted py-20">
            <p>기술인 상세 정보 페이지입니다.</p>
            <p>향후 이곳에 기술 경력, 참여 프로젝트, 교육 이력 등이 표시될 것입니다.</p>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDetail;