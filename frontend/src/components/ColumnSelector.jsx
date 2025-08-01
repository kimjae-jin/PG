import React, { useState, useEffect, useRef } from 'react';

const ColumnSelector = ({ allColumns, visibleColumns, setVisibleColumns, fixedColumns = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const toggleColumn = (col) => {
    if (fixedColumns.includes(col)) return; // 고정 컬럼은 변경 불가
    const newVisibleColumns = { ...visibleColumns, [col]: !visibleColumns[col] };
    setVisibleColumns(newVisibleColumns);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 border border-separator rounded-md text-sm text-text-muted hover:bg-tab-hover hover:text-text-color"
      >
        <span className="mr-2">⚙️</span>
        표시 필드 설정
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card-bg border border-separator rounded-md shadow-lg z-10">
          <ul className="p-2 max-h-80 overflow-y-auto">
            {Object.keys(allColumns).map((col) => (
              <li key={col} className="flex items-center p-2 rounded-md hover:bg-tab-hover">
                <input
                  type="checkbox"
                  id={`col-${col}`}
                  checked={visibleColumns[col]}
                  onChange={() => toggleColumn(col)}
                  disabled={fixedColumns.includes(col)}
                  className="mr-3 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent disabled:opacity-50"
                />
                <label
                  htmlFor={`col-${col}`}
                  className={`flex-1 text-sm ${fixedColumns.includes(col) ? 'text-text-muted cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {allColumns[col].header}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;