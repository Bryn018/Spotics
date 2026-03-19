import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const NODE_ENV = process.env.NODE_ENV || 'development';
const cwd = process.cwd();
const candidates = [
  `.env.${NODE_ENV}.local`,
  `.env.${NODE_ENV}`,
  `.env.local`,
  `.env`,
];

for (const file of candidates) {
  const fullPath = path.join(cwd, file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: true });
  }
}

type RequiredEnv =
  | 'PORT'
  | 'APP_URL'
  | 'API_URL'
  | 'CLIENT_URL'
  | 'SUPABASE_URL'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'SUPABASE_ANON_KEY'
  | 'SPOTIFY_CLIENT_ID'
  | 'SPOTIFY_CLIENT_SECRET'
  | 'SPOTIFY_REDIRECT_URI'
  | 'JWT_SECRET'
  | 'SESSION_COOKIE_NAME'
  | 'COOKIE_SECRET';

const requiredKeys: RequiredEnv[] = [
  'PORT',
  'APP_URL',
  'API_URL',
  'CLIENT_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'SPOTIFY_REDIRECT_URI',
  'JWT_SECRET',
  'SESSION_COOKIE_NAME',
  'COOKIE_SECRET',
];

const missing = requiredKeys.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

export const env = {
  nodeEnv: NODE_ENV,
  port: Number(process.env.PORT) || 4000,
  appUrl: process.env.APP_URL!,
  apiUrl: process.env.API_URL!,
  clientUrl: process.env.CLIENT_URL!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID!,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
  spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  sessionCookieName: process.env.SESSION_COOKIE_NAME!,
  cookieSecret: process.env.COOKIE_SECRET!,
};
