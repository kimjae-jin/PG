const { Pool } = require('pg');

// 데이터베이스 연결 풀 생성
// 선장님의 PostgreSQL 설정에 맞춰주세요.
const pool = new Pool({
  user: 'geenie.',          // PostgreSQL 사용자 이름
  host: 'localhost',
  database: 'pg_shipyard_db', // 사용할 데이터베이스 이름
  password: '',             // PostgreSQL 사용자 비밀번호
  port: 5432,
});

module.exports = pool;
