import React, { useState, useEffect } from 'react';

const ALL_COLUMNS = {
  status: { header: '상태', width: '5rem' },
  name: { header: '거래처명', width: '15rem' },
  registration_number: { header: '사업자등록번호', width: '10rem' },
  corporate_number: { header: '법인등록번호', width: '10rem' },
  address: { header: '소재지', width: '20rem' },
  phone_number: { header: '연락처', width: '10rem' },
  ceo_name: { header: '대표자', width: '7rem' },
  contract_manager_name: { header: '계약담당자', width: '7rem' },
  contract_manager_phone: { header: '계약담당 연락처', width: '10rem' },
  contract_manager_email: { header: '계약담당 이메일', width: '12rem' },
  work_manager_name: { header: '업무담당자', width: '7rem' },
  work_manager_phone: { header: '업무담당 연락처', width: '10rem' },
  work_manager_email: { header: '업무담당 이메일', width: '12rem' },
  transaction_count: { header: '거래횟수', width: '5rem' },
  special_notes: { header: '특이사항', width: '15rem' },
  remarks: { header: '비고', width: '15rem' },
};

const TableColGroup = () => (
    <colgroup>
        {Object.values(ALL_COLUMNS).map(col => <col key={col.header} style={{ width: col.width }} />)}
    </colgroup>
);


const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/companies')
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
      .then(data => { setCompanies(data); setLoading(false); })
      .catch(err => { setError('데이터 로딩 실패. 백엔드 서버를 확인하세요.'); setLoading(false); });
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case '정상': return 'bg-green-200 text-green-800';
      case '휴업': return 'bg-yellow-200 text-yellow-800';
      case '폐업': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) return <div className="p-6 text-center text-text-muted">관계사 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-6 text-center text-text-muted">{error}</div>;

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col h-full bg-card-bg rounded-lg shadow">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-separator">
          <h2 className="text-lg font-semibold text-text-color">관계사 목록 ({companies.length}개)</h2>
          <button className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-hover">+ 신규 등록</button>
        </div>

        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-shrink-0 overflow-x-auto">
            <table className="w-full text-sm text-left table-fixed">
              <TableColGroup />
              <thead className="bg-table-header text-table-header-text uppercase">
                <tr>
                  {Object.values(ALL_COLUMNS).map(col => <th key={col.header} className="p-2 text-center whitespace-nowrap">{col.header}</th>)}
                </tr>
              </thead>
            </table>
          </div>
          
          <div className="flex-grow overflow-auto">
            <table className="w-full text-sm text-left table-fixed">
              <TableColGroup />
              <tbody className="divide-y divide-separator">
                {companies.map(company => (
                  <tr key={company.id} className="hover:bg-tab-hover">
                    <td className="p-2 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(company.status)}`}>{company.status}</span></td>
                    <td className="p-2 font-semibold text-text-color whitespace-nowrap overflow-hidden text-ellipsis" title={company.name}>{company.name}</td>
                    <td className="p-2 text-center text-text-muted">{company.registration_number || '-'}</td>
                    <td className="p-2 text-center text-text-muted">{company.corporate_number || '-'}</td>
                    <td className="p-2 text-text-muted whitespace-nowrap overflow-hidden text-ellipsis" title={company.address}>{company.address || '-'}</td>
                    <td className="p-2 text-center text-text-muted">{company.phone_number || '-'}</td>
                    <td className="p-2 text-center">{company.ceo_name || '-'}</td>
                    <td className="p-2 text-center">{company.contract_manager_name || '-'}</td>
                    <td className="p-2 text-center text-text-muted">{company.contract_manager_phone || '-'}</td>
                    <td className="p-2 text-center text-text-muted">{company.contract_manager_email || '-'}</td>
                    <td className="p-2 text-center">{company.work_manager_name || '-'}</td>
                    <td className="p-2 text-center text-text-muted">{company.work_manager_phone || '-'}</td>
                    <td className="p-2 text-center text-text-muted">{company.work_manager_email || '-'}</td>
                    <td className="p-2 text-center font-mono">{company.transaction_count}</td>
                    <td className="p-2 text-text-muted whitespace-nowrap overflow-hidden text-ellipsis" title={company.special_notes}>{company.special_notes || '-'}</td>
                    <td className="p-2 text-text-muted whitespace-nowrap overflow-hidden text-ellipsis" title={company.remarks}>{company.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;