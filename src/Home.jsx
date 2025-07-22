// PG/src/Home.jsx 또는 PG/src/components/Home.jsx
import React from 'react';

const Home = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 'calc(100vh - 60px)', // 헤더 높이 등을 고려하여 조정
      fontSize: '2em',
      fontWeight: 'bold',
      color: '#333',
      backgroundColor: '#f0f2f5'
    }}>
      추후 구현예정
    </div>
  );
};

export default Home;