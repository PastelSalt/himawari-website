/**
 * Cookieless visit counting (WEBSITE.md §9.3, the portfolio's /api/track). A visitor is counted with a hash of a
 * daily random salt, the IP, the user agent, and the host. The salt changes every day and is deleted after two,
 * so visitors can't be followed across days. IPs and full user agents are never stored. /privacy describes this;
 * keep the two in step.
 */
import { createHmac, randomBytes } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { z } from 'astro/zod';
import * as schema from './db/schema';
import type { DB } from './db/types';
import { isBot, parseUA } from './ua';

export const TZ = 'Asia/Manila';

/** What the page sends: its path, its language, and the referring site's host name (never the full address). */
export const PageView = z.object({
  p: z
    .string()
    .max(200)
    .regex(/^\/[\w\-./]*$/),
  l: z.enum(['en', 'ja']),
  r: z
    .string()
    .max(253)
    .regex(/^[a-z0-9.-]+$/i)
    .optional(),
});
export type PageView = z.infer<typeof PageView>;

export type RequestContext = {
  ip: string;
  ua: string;
  host: string;
  country: string | null;
  environment: 'production' | 'preview' | 'development';
  now?: Date;
};

/** The calendar day in Manila, as YYYY-MM-DD. */
export const dayOf = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);

/** Today's salt, created on first use. */
export async function saltFor(db: DB, day: string): Promise<string> {
  await db
    .insert(schema.analyticsSalts)
    .values({ day, salt: randomBytes(32).toString('hex') })
    .onConflictDoNothing();
  const [row] = await db
    .select()
    .from(schema.analyticsSalts)
    .where(eq(schema.analyticsSalts.day, day))
    .limit(1);
  if (!row) throw new Error(`no salt for ${day}`);
  return row.salt;
}

export const hmac = (key: string, value: string) =>
  createHmac('sha256', key).update(value).digest('base64url').slice(0, 22);

/** Counts a hit for `keyHash` in the current window; true when it's over `limit`. */
export async function overLimit(
  db: DB,
  bucket: string,
  keyHash: string,
  limit: number,
  windowMs: number,
  now = new Date(),
): Promise<boolean> {
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  const [row] = await db
    .insert(schema.rateLimits)
    .values({ bucket, keyHash, windowStart, hits: 1 })
    .onConflictDoUpdate({
      target: [schema.rateLimits.bucket, schema.rateLimits.keyHash, schema.rateLimits.windowStart],
      set: { hits: sql`${schema.rateLimits.hits} + 1` },
    })
    .returning({ hits: schema.rateLimits.hits });
  return (row?.hits ?? 0) > limit;
}

/** 60 page views a minute from one connection is more than any person reads. */
export const TRACK_LIMIT = { perWindow: 60, windowMs: 60_000 };

export type TrackResult = 'counted' | 'bot' | 'limited';

export async function recordPageView(db: DB, view: PageView, ctx: RequestContext): Promise<TrackResult> {
  if (isBot(ctx.ua)) return 'bot';
  const now = ctx.now ?? new Date();
  const salt = await saltFor(db, dayOf(now));
  const limited = await overLimit(
    db,
    'track',
    hmac(salt, `rl|${ctx.ip}`),
    TRACK_LIMIT.perWindow,
    TRACK_LIMIT.windowMs,
    now,
  );
  if (limited) return 'limited';
  const { browser, deviceType } = parseUA(ctx.ua);
  await db.insert(schema.pageViews).values({
    occurredAt: now,
    path: view.p,
    lang: view.l,
    // a link from this same site isn't a referral
    referrerHost: view.r && view.r !== ctx.host ? view.r.toLowerCase() : null,
    deviceType,
    browser,
    country: ctx.country && /^[A-Z]{2}$/.test(ctx.country) ? ctx.country : null,
    visitorHash: hmac(salt, `${ctx.ip}|${ctx.ua}|${ctx.host}`),
    environment: ctx.environment,
  });
  return 'counted';
}

/**
 * The daily cron: rolls the last three Manila days of production views into daily totals (idempotent, so late or
 * repeated runs are fine), then deletes single views after 90 days, salts after 2 days, rate-limit rows after
 * 2 days, admin sign-in attempts after 30 days, and ended admin sessions after a week.
 */
export async function dailyHousekeeping(db: DB, now = new Date()) {
  const days = [1, 2, 3].map((i) => dayOf(new Date(now.getTime() - i * 86_400_000)));
  for (const day of days) {
    await db.delete(schema.dailyPageViews).where(eq(schema.dailyPageViews.day, day));
    await db.execute(sql`
      insert into daily_page_views (day, path, views, visitors)
      select ${day}::date, path, count(*)::int, count(distinct visitor_hash)::int
      from page_views
      where environment = 'production' and (occurred_at at time zone ${TZ})::date = ${day}::date
      group by path
      union all
      select ${day}::date, '*', count(*)::int, count(distinct visitor_hash)::int
      from page_views
      where environment = 'production' and (occurred_at at time zone ${TZ})::date = ${day}::date
      having count(*) > 0
    `);
  }
  const cutoff = (n: number) => new Date(now.getTime() - n * 86_400_000);
  await db.delete(schema.pageViews).where(sql`${schema.pageViews.occurredAt} < ${cutoff(90).toISOString()}`);
  await db.delete(schema.analyticsSalts).where(sql`${schema.analyticsSalts.day} < ${dayOf(cutoff(2))}::date`);
  await db
    .delete(schema.rateLimits)
    .where(sql`${schema.rateLimits.windowStart} < ${cutoff(2).toISOString()}`);
  // the admin panel: sign-in attempts after 30 days, sessions a week after they ended
  await db
    .delete(schema.loginAttempts)
    .where(sql`${schema.loginAttempts.attemptedAt} < ${cutoff(30).toISOString()}`);
  await db
    .delete(schema.adminSessions)
    .where(
      sql`${schema.adminSessions.expiresAt} < ${cutoff(7).toISOString()} or ${schema.adminSessions.revokedAt} < ${cutoff(7).toISOString()}`,
    );
  return { rolledUp: days };
}

/** For tests and the cron's summary: a day's totals. */
export async function totalsFor(db: DB, day: string) {
  return db.select().from(schema.dailyPageViews).where(eq(schema.dailyPageViews.day, day));
}
