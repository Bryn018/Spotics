import { Pool } from 'pg';
import { env } from '../config/env';

// Strip sslmode query param from DATABASE_URL to silence pg-connection-string
// deprecation warning — we set ssl explicitly below.
function cleanConnectionString(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete('sslmode');
    return u.toString();
  } catch {
    return url;
  }
}

export const pool = new Pool({
  connectionString: cleanConnectionString(env.databaseUrl),
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error', err);
});
