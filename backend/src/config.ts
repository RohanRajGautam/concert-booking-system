import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[config] Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

export const config = {
  databaseUrl: requireEnv('DATABASE_URL'),
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
} as const;
