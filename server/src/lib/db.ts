import postgres from 'postgres';

// Use constructor overload compatible with this project's TypeScript settings
// Accepts a connection URL string to avoid using import.meta.env at build time
const connectionString = process.env.DATABASE_URL || '';

export const pool = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production',
});
