import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import * as schema from '../../src/server/db/schema';
import type { DB } from '../../src/server/db/types';
import { recordPageView, type RequestContext } from '../../src/server/track';
import { breakdowns, dailySeries, releaseDownloads, visitCharts } from '../../src/server/stats';
import { freshDb } from './helpers';

const FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0';
const PHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1';
// 2026-10-23, 10:00 in Manila
const NOW = new Date('2026-10-23T02:00:00Z');
const ctx = (over: Partial<RequestContext> = {}): RequestContext => ({
  ip: '203.0.113.7',
  ua: FIREFOX,
  host: 'himawari.example',
  country: 'PH',
  environment: 'production',
  now: NOW,
  ...over,
});
const at = (iso: string) => new Date(iso);

let db: DB;
let pg: PGlite;
beforeEach(async () => {
  ({ db, pg } = await freshDb());
  // today: one person reads two pages, another reads one on a phone from Japan; a preview visit doesn't count
  await recordPageView(db, { p: '/', l: 'en', r: 'github.com' }, ctx());
  await recordPageView(db, { p: '/download', l: 'en' }, ctx({ now: at('2026-10-23T03:00:00Z') }));
  await recordPageView(db, { p: '/ja', l: 'ja' }, ctx({ ip: '198.51.100.2', ua: PHONE, country: 'JP' }));
  await recordPageView(db, { p: '/', l: 'en' }, ctx({ environment: 'preview' }));
  // 23:30 on 22 Oct in Manila is 15:30 UTC: it belongs to the 22nd
  await recordPageView(db, { p: '/', l: 'en' }, ctx({ now: at('2026-10-22T15:30:00Z') }));
});
afterEach(async () => pg.close());

describe('statistics', () => {
  it('count days in Manila time, and each visitor once per day', async () => {
    const s = await dailySeries(db, '2026-10-21', '2026-10-23', NOW);
    expect(s).toEqual([
      { key: '2026-10-21', views: 0, visitors: 0 },
      { key: '2026-10-22', views: 1, visitors: 1 },
      { key: '2026-10-23', views: 3, visitors: 2 },
    ]);
  });

  it('take days older than the single views from the daily totals', async () => {
    await db.insert(schema.dailyPageViews).values({ day: '2026-05-01', path: '*', views: 40, visitors: 12 });
    const s = await dailySeries(db, '2026-05-01', '2026-05-01', NOW);
    expect(s).toEqual([{ key: '2026-05-01', views: 40, visitors: 12 }]);
  });

  it('chart 30 days, 12 weeks from Monday, and 12 months', async () => {
    const c = await visitCharts(db, NOW);
    expect(c.daily).toHaveLength(30);
    expect(c.daily.at(-1)).toEqual({ key: '2026-10-23', views: 3, visitors: 2 });
    expect(c.weekly).toHaveLength(12);
    expect(c.weekly.at(-1)).toEqual({ key: '2026-10-19', views: 4, visitors: 3 });
    expect(c.monthly).toHaveLength(12);
    expect(c.monthly.at(-1)).toEqual({ key: '2026-10', views: 4, visitors: 3 });
  });

  it('break the range down by page, source, country, device, browser, language, and hour', async () => {
    const b = await breakdowns(db, 7, NOW);
    expect(b).toMatchObject({ views: 4, visitors: 3 });
    // most read first; ties in any order
    expect(b.pages[0]).toEqual({ key: '/', value: 2 });
    expect(b.pages.slice(1)).toHaveLength(2);
    expect(b.pages.slice(1)).toEqual(
      expect.arrayContaining([
        { key: '/download', value: 1 },
        { key: '/ja', value: 1 },
      ]),
    );
    expect(b.sources).toContainEqual({ key: 'github.com', value: 1 });
    expect(b.countries).toEqual([
      { key: 'PH', value: 3 },
      { key: 'JP', value: 1 },
    ]);
    expect(b.devices).toContainEqual({ key: 'mobile', value: 1 });
    expect(b.languages).toContainEqual({ key: 'ja', value: 1 });
    expect(b.hours).toHaveLength(24);
    expect(b.hours[10]).toEqual({ key: '10', value: 2 });
  });

  it('read installer downloads from GitHub, and say when it is unreachable', async () => {
    const gh = async () =>
      Response.json([
        {
          tag_name: 'v0.4.1',
          published_at: '2026-10-22T04:47:38Z',
          draft: false,
          assets: [
            { name: 'Himawari-Studio-Setup-0.4.1.exe', download_count: 12 },
            { name: 'something-else.zip', download_count: 99 },
          ],
        },
      ]);
    expect(await releaseDownloads(gh as typeof fetch)).toEqual([
      { version: '0.4.1', publishedAt: '2026-10-22T04:47:38Z', downloads: 12 },
    ]);
    expect(
      await releaseDownloads((async () => new Response('', { status: 500 })) as typeof fetch),
    ).toBeNull();
  });
});
