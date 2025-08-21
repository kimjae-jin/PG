import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const FormInput = ({ label, name, value, onChange, type = 'text', as = 'input', options = [], required = false }) => { const commonProps = { id: name, name: name, value: value || '', onChange: onChange, className: "mt-1 block w-full bg-input-bg border border-separator rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm", required }; if (as === 'select') { return (<div><label htmlFor={name} className="block text-sm font-medium text-text-muted">{label}</label><select {...commonProps}>{options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>); } if (as === 'textarea') { return (<div><label htmlFor={name} className="block text-sm font-medium text-text-muted">{label}</label><textarea {...commonProps} rows="3" /></div>); } return (<div><label htmlFor={name} className="block text-sm font-medium text-text-muted">{label}</label><input type={type} {...commonProps} /></div>);};

const AddRevisionModal = ({ isOpen, onClose, onSave }) => {
  const [revision, setRevision] = useState({});
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    if (isOpen) {
        setRevision({ revision_type: '중지', status_change_date: new Date().toISOString().split('T')[0], reason: '', contract_date: '', start_date: '', end_date: '', total_equity_amount: 0, });
        setAttachment(null);
        const fileInput = document.getElementById('new-revision-attachment-input');
        if(fileInput) fileInput.value = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => { const { name, value, type } = e.target; setRevision(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value })); };
  const handleFileChange = (e) => { setAttachment(e.target.files[0]); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(revision).forEach(key => { if (revision[key] !== null && revision[key] !== undefined) { formData.append(key, revision[key]); }});
    if (attachment) { formData.append('attachment', attachment); }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card-bg rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-separator flex-shrink-0"><h2 className="text-lg font-bold">프로젝트 이력 추가</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-tab-hover"><X size={20} /></button></header>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2"><FormInput label="이력 구분" name="revision_type" as="select" value={revision.revision_type} onChange={handleChange} options={[{value: '중지', label: '중지'},{value: '재개', label: '재개'},{value: '차수변경', label: '차수변경'},]}/></div>
            <FormInput label="적용일" name="status_change_date" type="date" value={revision.status_change_date} onChange={handleChange} required/>
            <div className="md:col-span-2"><FormInput label="사유 / 주요 변경사항" name="reason" as="textarea" value={revision.reason} onChange={handleChange} /></div>
            <div className="md:col-span-2">
                <label htmlFor="new-revision-attachment-input" className="block text-sm font-medium text-text-muted">증빙 서류 (선택)</label>
                <input id="new-revision-attachment-input" type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/80 file:text-white hover:file:bg-accent"/>
            </div>
            {revision.revision_type === '차수변경' && (
              <>
                <div className="md:col-span-2 mt-4 border-t border-separator pt-6"><h3 className="font-semibold text-text-color">계약 변경 정보 (선택사항)</h3></div>
                <FormInput label="변경 계약일" name="contract_date" type="date" value={revision.contract_date} onChange={handleChange} />
                <FormInput label="변경 착수일" name="start_date" type="date" value={revision.start_date} onChange={handleChange} />
                <FormInput label="변경 완료예정일" name="end_date" type="date" value={revision.end_date} onChange={handleChange} />
                <FormInput label="변경 총 지분금액" name="total_equity_amount" type="number" value={revision.total_equity_amount} onChange={handleChange} />
              </>
            )}
          </div>
        </form>
        <footer className="flex justify-end items-center p-4 border-t border-separator bg-card-bg flex-shrink-0"><button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 font-bold py-2 px-4 rounded mr-2">취소</button><button type="submit" onClick={handleSubmit} className="flex items-center bg-accent hover:bg-accent-hover font-bold py-2 px-4 rounded"><Save size={16} className="mr-1" /> 저장</button></footer>
      </div>
    </div>
  );
};
export default AddRevisionModal;