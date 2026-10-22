/**
 * POST /api/track: one page view, sent by the page with navigator.sendBeacon (src/scripts/global.ts).
 * Always answers 204 with no body, so it tells a caller nothing; bad input and errors simply aren't counted.
 */
import type { APIRoute } from 'astro';
import { DATABASE_URL, DISCORD_WEBHOOK_URL } from 'astro:env/server';
import { db } from '../../server/db/http';
import { sendAlert } from '../../server/alerts';
import { PageView, recordPageView } from '../../server/track';

export const prerender = false;

const none = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!DATABASE_URL) return none();
  const text = await request.text();
  if (text.length > 1024) return none();
  let view: PageView;
  try {
    const parsed = PageView.safeParse(JSON.parse(text));
    if (!parsed.success) return none();
    view = parsed.data;
  } catch {
    return none();
  }
  const h = request.headers;
  const env = process.env.VERCEL_ENV;
  try {
    await recordPageView(db(), view, {
      ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || clientAddress || '0.0.0.0',
      ua: h.get('user-agent') ?? '',
      host: h.get('host') ?? '',
      country: h.get('x-vercel-ip-country'),
      environment: env === 'production' ? 'production' : env === 'preview' ? 'preview' : 'development',
    });
  } catch (e) {
    await sendAlert(DISCORD_WEBHOOK_URL, `Himawari site: /api/track failed: ${(e as Error).message}`);
  }
  return none();
};
