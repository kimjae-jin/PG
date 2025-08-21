import React from 'react';

const PlaceholderPage = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-[--text-secondary]">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-lg">이 페이지는 현재 개발 중입니다.</p>
        </div>
    );
};

export default PlaceholderPage;