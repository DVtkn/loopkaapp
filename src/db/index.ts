import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import { logger } from '../server/logger.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_U8YAVhgIb2NJ@ep-winter-moon-b1gv1vb3-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require';

export const isSqlConfigured = (): boolean => {
  if (process.env.NEON_DATABASE_URL && process.env.NEON_DATABASE_URL.trim() !== '') return true;
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') return true;
  if (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME && process.env.SQL_HOST.trim() !== '') return true;
  return Boolean(DEFAULT_NEON_URL);
};

export const getConnectionString = (): string | null => {
  if (process.env.NEON_DATABASE_URL && process.env.NEON_DATABASE_URL.trim() !== '') {
    return process.env.NEON_DATABASE_URL;
  }
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return process.env.DATABASE_URL;
  }
  if (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME && process.env.SQL_HOST.trim() !== '') {
    const port = process.env.SQL_PORT || '5432';
    const password = process.env.SQL_PASSWORD || '';
    return `postgresql://${encodeURIComponent(process.env.SQL_USER)}:${encodeURIComponent(password)}@${process.env.SQL_HOST}:${port}/${process.env.SQL_DB_NAME}?sslmode=require`;
  }
  return DEFAULT_NEON_URL || null;
};

export const createPool = (): Pool | null => {
  const connStr = getConnectionString();
  if (!connStr) {
    return null;
  }
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }, // Required for Neon and Cloud SQL managed DBs
      max: 10,
      connectionTimeoutMillis: 10000,
    });

    global._postgresPool.on('error', (err) => {
      logger.warn('PostgreSQL pool connection notice:', undefined, err);
    });
  }
  return global._postgresPool;
};

const pool = isSqlConfigured() ? createPool() : null;

export const db = pool
  ? drizzle(pool, { schema })
  : (drizzle(new Pool({ host: '127.0.0.1', port: 5432, max: 0, idleTimeoutMillis: 1000 }), { schema }));

