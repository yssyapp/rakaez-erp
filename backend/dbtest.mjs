import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  const res = await pool.query('SELECT count(*) FROM organizations');
  console.log('CONNECTED OK. organizations count:', res.rows[0].count);
} catch (e) {
  console.log('CONNECTION FAILED:', e.message);
}
process.exit(0);
