import React from 'react';

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-surface p-6 rounded-lg shadow-md flex items-center">
      <div className="bg-primary/10 p-3 rounded-full">
        {React.cloneElement(icon, { className: "h-6 w-6 text-primary" })}
      </div>
      <div className="ml-4">
        <p className="text-sm text-text-secondary font-medium">{title}</p>
        <p className="text-2xl font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
