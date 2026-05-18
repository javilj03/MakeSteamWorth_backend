const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function close() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  close,
};
