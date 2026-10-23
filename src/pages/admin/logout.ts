/** POST /admin/logout: ends this browser's session. */
import type { APIRoute } from 'astro';
import { getSession, revokeSession } from '../../server/auth';
import { clearSessionCookie, databaseReady, sessionToken } from '../../server/admin';
import { db } from '../../server/db/http';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  if (databaseReady()) {
    const session = await getSession(db(), sessionToken(ctx));
    if (session) await revokeSession(db(), session.sessionId);
  }
  clearSessionCookie(ctx);
  return ctx.redirect('/admin/login', 303);
};
