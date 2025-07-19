import { drizzle } from 'drizzle-orm/d1';
import { reports } from './schema';

export function getDb(env?: { DB?: D1Database }) {
  if (!env?.DB) {
    throw new Error('D1 database binding not found');
  }
  return drizzle(env.DB, { schema: { reports } });
}