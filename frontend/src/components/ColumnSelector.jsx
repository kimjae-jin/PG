import React, { useState, useEffect, useRef } from 'react';

const ColumnSelector = ({ allColumns, visibleColumns, setVisibleColumns, fixedColumns = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const toggleColumn = (col) => { if (!fixedColumns.includes(col)) setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] })); };
  const handleSelectAll = (select) => {
    setVisibleColumns(prev => {
      const newVisible = { ...prev };
      Object.keys(allColumns).forEach(col => { if (!fixedColumns.includes(col)) newVisible[col] = select; });
      return newVisible;
    });
  };
  useEffect(() => {
    const handleClickOutside = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  return (
    <div className="relative" ref={wrapperRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 border border-separator rounded-md text-sm text-text-muted hover:bg-tab-hover">
        <span className="mr-2">⚙️</span> 표시 필드 설정
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card-bg border border-separator rounded-md shadow-lg z-50">
          <div className="flex justify-between p-2 border-b border-separator">
            <button onClick={() => handleSelectAll(true)} className="text-xs px-2 py-1 rounded bg-accent/20 text-accent hover:bg-accent/40">전체 선택</button>
            <button onClick={() => handleSelectAll(false)} className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400 hover:bg-gray-500/40">전체 해제</button>
          </div>
          <ul className="p-2 max-h-72 overflow-y-auto">
            {Object.keys(allColumns).map((col) => (
              <li key={col} className="flex items-center p-2 rounded-md hover:bg-tab-hover">
                <input type="checkbox" id={`col-${col}`} checked={!!visibleColumns[col]} onChange={() => toggleColumn(col)} disabled={fixedColumns.includes(col)} className="mr-3 h-4 w-4 rounded text-accent focus:ring-accent disabled:opacity-50"/>
                <label htmlFor={`col-${col}`} className={`flex-1 text-sm ${fixedColumns.includes(col) ? 'text-text-muted cursor-not-allowed' : 'cursor-pointer'}`}>{allColumns[col].header}</label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default ColumnSelector;
