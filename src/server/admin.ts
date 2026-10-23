/**
 * What every admin page needs: the database, the signed-in owner, and the session cookie. Admin pages are rendered
 * on demand (prerender = false), use plain HTML forms, and run no scripts; Astro's checkOrigin guards their POSTs.
 */
import type { AstroGlobal } from 'astro';
import { DATABASE_URL } from 'astro:env/server';
import { ABSOLUTE_DAYS, cookieName, getSession, type Session } from './auth';
import { db } from './db/http';
import type { DB } from './db/types';

const isHttps = (url: URL) => url.protocol === 'https:';

export function setSessionCookie(Astro: Pick<AstroGlobal, 'cookies' | 'url'>, token: string) {
  Astro.cookies.set(cookieName(isHttps(Astro.url)), token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: isHttps(Astro.url),
    maxAge: ABSOLUTE_DAYS * 86_400,
  });
}

export function clearSessionCookie(Astro: Pick<AstroGlobal, 'cookies' | 'url'>) {
  Astro.cookies.delete(cookieName(isHttps(Astro.url)), { path: '/' });
}

export const sessionToken = (Astro: Pick<AstroGlobal, 'cookies' | 'url'>) =>
  Astro.cookies.get(cookieName(isHttps(Astro.url)))?.value;

export const databaseReady = () => !!DATABASE_URL;

/** The client's IP, from Vercel's header (only ever stored hashed). */
export const clientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  request.headers.get('x-real-ip') ||
  '0.0.0.0';

export type AdminContext = { db: DB; session: Session };

/**
 * The signed-in owner, or a redirect: to the sign-in page when signed out, and to the password page while the
 * temporary password is still in use (unless this is the password page).
 */
export async function requireAdmin(
  Astro: AstroGlobal,
  { allowPasswordChange = false } = {},
): Promise<AdminContext | Response> {
  if (!databaseReady()) return Astro.redirect('/admin/login');
  const session = await getSession(db(), sessionToken(Astro));
  if (!session) return Astro.redirect('/admin/login');
  if (session.user.mustChangePassword && !allowPasswordChange) return Astro.redirect('/admin/password');
  return { db: db(), session };
}

/** "22 Oct 2026, 14:05" in Manila time. */
export const when = (d: Date | string | null) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        timeZone: 'Asia/Manila',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

export const REBUILD_NOTE = {
  started: 'The site is rebuilding. The change is live in about two minutes.',
  no_hook: 'Saved, but the site can’t rebuild by itself yet: VERCEL_DEPLOY_HOOK_URL isn’t set in Vercel.',
  failed: 'Saved, but the rebuild didn’t start. Try again, or redeploy in Vercel.',
} as const;
