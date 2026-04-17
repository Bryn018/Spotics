import * as pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production');
}

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});
