const { Pool } = require('pg');
const pool = new Pool({ user: 'geenie.', host: 'localhost', database: 'pg_shipyard_db', password: '', port: 5432 });
module.exports = pool;
