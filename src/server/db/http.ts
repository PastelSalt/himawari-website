/** The production database: Neon over HTTP, one statement per request (WEBSITE.md §9.3). */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { DATABASE_URL } from 'astro:env/server';
import * as schema from './schema';
import type { DB } from './types';

let instance: DB | null = null;
export function db(): DB {
  if (!instance) {
    if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');
    instance = drizzle({ client: neon(DATABASE_URL), schema }) as unknown as DB;
  }
  return instance;
}
