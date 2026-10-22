/**
 * GET /api/cron/daily (WEBSITE.md §9.3): Vercel's daily cron (vercel.json) sends `Authorization: Bearer
 * $CRON_SECRET`. Rolls up yesterday's counts and deletes old views, salts, and rate-limit rows.
 */
import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { CRON_SECRET, DISCORD_WEBHOOK_URL } from 'astro:env/server';
import { db } from '../../../server/db/http';
import { sendAlert } from '../../../server/alerts';
import { dailyHousekeeping } from '../../../server/track';

export const prerender = false;

function authorized(header: string | null): boolean {
  if (!CRON_SECRET || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${CRON_SECRET}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const GET: APIRoute = async ({ request }) => {
  if (!authorized(request.headers.get('authorization'))) return new Response('Unauthorized', { status: 401 });
  try {
    const out = await dailyHousekeeping(db());
    return Response.json({ ok: true, ...out }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    await sendAlert(DISCORD_WEBHOOK_URL, `Himawari site: the daily cron failed: ${(e as Error).message}`);
    return Response.json({ ok: false }, { status: 500 });
  }
};
