import React, { useState } from 'react';
import { Settings } from 'lucide-react';

const ColumnSelector = ({ allColumns, visibleColumns, setVisibleColumns, fixedColumns = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (key) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = () => {
    const newVisibleColumns = {};
    Object.keys(allColumns).forEach(key => {
      newVisibleColumns[key] = true;
    });
    setVisibleColumns(newVisibleColumns);
    setIsOpen(false); // [지침 2] 전체 선택 후 팝업 자동 닫힘
  };

  const handleDeselectAll = () => {
    const newVisibleColumns = {};
    Object.keys(allColumns).forEach(key => {
      // [지침 1] 고정 컬럼은 선택 해제하지 않음 (always true)
      newVisibleColumns[key] = fixedColumns.includes(key);
    });
    setVisibleColumns(newVisibleColumns);
    setIsOpen(false); // [지침 2] 전체 해제 후 팝업 자동 닫힘
  };

  // 컬럼을 그룹별로 정리
  const groupedColumns = Object.entries(allColumns).reduce((acc, [key, value]) => {
    const group = value.group || '기타';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push({ key, ...value });
    return acc;
  }, {});

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center bg-input-bg border border-separator font-bold py-2 px-4 rounded">
        <Settings size={16} className="mr-1" /> 필드 설정
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-card-bg border border-separator rounded-lg shadow-xl z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">표시할 필드 선택</h4>
            <div className="space-x-2">
              <button onClick={handleSelectAll} className="text-xs text-accent hover:underline">전체 선택</button>
              <button onClick={handleDeselectAll} className="text-xs text-accent hover:underline">전체 해제</button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto pr-2">
            {Object.entries(groupedColumns).map(([groupName, columns]) => (
              <div key={groupName} className="mb-3">
                <h5 className="font-semibold text-sm text-text-muted mb-2">{groupName}</h5>
                <div className="grid grid-cols-2 gap-2">
                  {columns.map(({ key, header }) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!visibleColumns[key]}
                        onChange={() => handleToggle(key)}
                        // [지침 1] 고정 컬럼 비활성화
                        disabled={fixedColumns.includes(key)}
                        className="h-4 w-4 rounded bg-input-bg border-separator disabled:opacity-50"
                      />
                      <span className={`text-sm ${fixedColumns.includes(key) ? 'text-text-muted' : 'text-text-color'}`}>{header}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;