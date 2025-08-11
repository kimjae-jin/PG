import React, { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';

const FileUploadModal = ({ isOpen, onClose, onUpload, revisionId }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("파일을 선택해주세요.");
            return;
        }
        setIsUploading(true);
        await onUpload(revisionId, file);
        setIsUploading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-card-bg rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-separator">
                    <h2 className="text-lg font-bold">증빙서류 첨부</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-tab-hover"><X size={20} /></button>
                </header>
                <div className="p-6">
                    <p className="text-sm text-text-muted mb-4">이력 ID: {revisionId}에 대한 증빙서류를 첨부합니다.</p>
                    <input id="file-upload-input" type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/80 file:text-white hover:file:bg-accent"/>
                    {file && <p className="mt-2 text-xs text-accent">{file.name}</p>}
                </div>
                <footer className="flex justify-end items-center p-4 border-t border-separator">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 font-bold py-2 px-4 rounded mr-2">취소</button>
                    <button onClick={handleUpload} disabled={isUploading || !file} className="flex items-center bg-accent hover:bg-accent-hover font-bold py-2 px-4 rounded disabled:opacity-50">
                        <UploadCloud size={16} className="mr-1" /> {isUploading ? '업로드 중...' : '업로드'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default FileUploadModal;