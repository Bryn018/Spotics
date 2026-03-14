import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LASTFM_API_KEY: z.string().min(1, "LASTFM_API_KEY is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  AUTH_TRUST_HOST: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required for the production foundation"),
  NEXTAUTH_DEBUG: z.string().optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  LASTFM_API_KEY: process.env.LASTFM_API_KEY,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_DEBUG: process.env.NEXTAUTH_DEBUG,
});
