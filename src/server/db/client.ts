import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema.ts';
import { logger } from '../logger.ts';

declare global {
  var _neonPool: Pool | undefined;
}

export const isSqlConfigured = (): boolean => {
  if (process.env.MY_DATABASE_URL && process.env.MY_DATABASE_URL.trim() !== '') return true;
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') return true;
  if (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME && process.env.SQL_HOST.trim() !== '') return true;
  return false;
};

export const getConnectionString = (): string | null => {
  if (process.env.MY_DATABASE_URL && process.env.MY_DATABASE_URL.trim() !== '') {
    return process.env.MY_DATABASE_URL;
  }
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return process.env.DATABASE_URL;
  }
  if (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME && process.env.SQL_HOST.trim() !== '') {
    const port = process.env.SQL_PORT || '5432';
    const password = process.env.SQL_PASSWORD || '';
    return `postgresql://${encodeURIComponent(process.env.SQL_USER)}:${encodeURIComponent(password)}@${process.env.SQL_HOST}:${port}/${process.env.SQL_DB_NAME}?sslmode=require`;
  }
  return null;
};

export const createPool = (): Pool | null => {
  const connStr = getConnectionString();
  if (!connStr) {
    return null;
  }
  if (!global._neonPool) {
    global._neonPool = new Pool({
      connectionString: connStr,
      max: 10,
      connectionTimeoutMillis: 10000,
    });
    global._neonPool.on('error', (err: Error) => {
      logger.warn('Neon pool connection notice:', undefined, err);
    });
  }
  return global._neonPool;
};

const pool = isSqlConfigured() ? createPool() : null;

export const db = pool
  ? drizzle(pool, { schema })
  : (drizzle(new Pool({ connectionString: 'postgresql://dummy:dummy@127.0.0.1:5432/dummy' }), { schema }));
