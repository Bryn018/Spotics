import postgres from 'postgres';

export const pool = postgres({
  connectionString: import.meta.env.DATABASE_URL || process.env.DATABASE_URL,
  ssl: import.meta.env.NODE_ENV === 'production',
});
