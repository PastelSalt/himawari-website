/** In-process Postgres (PGlite) with the real migrations applied: stands in for a Neon branch. */
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../../src/server/db/schema';
import type { DB } from '../../src/server/db/types';

export async function freshDb(): Promise<{ db: DB; pg: PGlite }> {
  const pg = new PGlite();
  for (const f of readdirSync('db/migrations')
    .filter((x) => x.endsWith('.sql'))
    .sort()) {
    for (const stmt of readFileSync(`db/migrations/${f}`, 'utf8').split('--> statement-breakpoint'))
      if (stmt.trim()) await pg.exec(stmt);
  }
  return { db: drizzle(pg, { schema }) as unknown as DB, pg };
}
