import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import * as schema from '../../src/server/db/schema';
import type { DB } from '../../src/server/db/types';
import {
  PageView,
  TRACK_LIMIT,
  dailyHousekeeping,
  dayOf,
  recordPageView,
  totalsFor,
  type RequestContext,
} from '../../src/server/track';
import { freshDb } from './helpers';

const FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0';
const NOON = new Date('2026-10-22T04:00:00Z'); // 12:00 in Manila
const ctx = (over: Partial<RequestContext> = {}): RequestContext => ({
  ip: '203.0.113.7',
  ua: FIREFOX,
  host: 'himawari.example',
  country: 'PH',
  environment: 'production',
  now: NOON,
  ...over,
});
const view = { p: '/download', l: 'en' as const, r: 'github.com' };

let db: DB;
let pg: PGlite;
beforeEach(async () => ({ db, pg } = await freshDb()));
afterEach(async () => pg.close());

describe('the page view payload', () => {
  it('takes a path, a language, and a host name only', () => {
    expect(PageView.safeParse(view).success).toBe(true);
    expect(PageView.safeParse({ ...view, p: 'https://evil.example/' }).success).toBe(false);
    expect(PageView.safeParse({ ...view, r: 'github.com/some/path?q=1' }).success).toBe(false);
    expect(PageView.safeParse({ ...view, l: 'fr' }).success).toBe(false);
  });
});

describe('recordPageView', () => {
  it('stores no IP address or user agent, and keeps the referrer to its host', async () => {
    expect(await recordPageView(db, view, ctx())).toBe('counted');
    const [row] = await db.select().from(schema.pageViews);
    expect(row).toMatchObject({
      path: '/download',
      lang: 'en',
      referrerHost: 'github.com',
      browser: 'Firefox',
    });
    expect(row!.deviceType).toBe('desktop');
    expect(JSON.stringify(row)).not.toContain('203.0.113.7');
    expect(JSON.stringify(row)).not.toContain('Gecko');
  });

  it('gives one visitor the same code all day, and a different one the next day', async () => {
    await recordPageView(db, view, ctx());
    await recordPageView(db, { ...view, p: '/' }, ctx({ now: new Date(NOON.getTime() + 3_600_000) }));
    await recordPageView(db, view, ctx({ now: new Date(NOON.getTime() + 86_400_000) }));
    const codes = (await db.select().from(schema.pageViews)).map((r) => r.visitorHash);
    expect(codes[0]).toBe(codes[1]);
    expect(codes[2]).not.toBe(codes[0]);
  });

  it("doesn't count crawlers", async () => {
    expect(await recordPageView(db, view, ctx({ ua: 'Googlebot/2.1' }))).toBe('bot');
    expect(await recordPageView(db, view, ctx({ ua: '' }))).toBe('bot');
    expect(await db.select().from(schema.pageViews)).toHaveLength(0);
  });

  it('rate-limits one connection', async () => {
    for (let i = 0; i < TRACK_LIMIT.perWindow; i++) await recordPageView(db, view, ctx());
    expect(await recordPageView(db, view, ctx())).toBe('limited');
    expect(await recordPageView(db, view, ctx({ ip: '198.51.100.2' }))).toBe('counted');
  });

  it('drops a referrer from this same site and a malformed country', async () => {
    await recordPageView(db, { ...view, r: 'himawari.example' }, ctx({ country: 'not a country' }));
    const [row] = await db.select().from(schema.pageViews);
    expect(row!.referrerHost).toBeNull();
    expect(row!.country).toBeNull();
  });
});

describe('dailyHousekeeping', () => {
  it('rolls up production views per page and for the whole site', async () => {
    await recordPageView(db, view, ctx());
    await recordPageView(db, { ...view, p: '/' }, ctx());
    await recordPageView(db, view, ctx({ ip: '198.51.100.2' }));
    await recordPageView(db, view, ctx({ environment: 'preview' }));
    await dailyHousekeeping(db, new Date(NOON.getTime() + 86_400_000));
    const totals = Object.fromEntries((await totalsFor(db, dayOf(NOON))).map((t) => [t.path, t]));
    expect(totals['/download']).toMatchObject({ views: 2, visitors: 2 });
    expect(totals['/']).toMatchObject({ views: 1, visitors: 1 });
    expect(totals['*']).toMatchObject({ views: 3, visitors: 2 });
  });

  it('is safe to run twice', async () => {
    await recordPageView(db, view, ctx());
    const later = new Date(NOON.getTime() + 86_400_000);
    await dailyHousekeeping(db, later);
    await dailyHousekeeping(db, later);
    expect(await totalsFor(db, dayOf(NOON))).toHaveLength(2);
  });

  it('deletes salts after two days, rate limits after two days, and views after 90', async () => {
    await recordPageView(db, view, ctx());
    await dailyHousekeeping(db, new Date(NOON.getTime() + 3 * 86_400_000));
    expect(await db.select().from(schema.analyticsSalts)).toHaveLength(0);
    expect(await db.select().from(schema.rateLimits)).toHaveLength(0);
    expect(await db.select().from(schema.pageViews)).toHaveLength(1);
    await dailyHousekeeping(db, new Date(NOON.getTime() + 91 * 86_400_000));
    expect(await db.select().from(schema.pageViews)).toHaveLength(0);
  });
});
