/**
 * The admin panel's statistics, as on the Kotoha fan site: visits per day, week, and month, and breakdowns for a
 * chosen range. Only production traffic counts. Days are Manila days, as the counter keeps them (track.ts).
 *
 * Recent days come straight from page_views, which are kept 90 days; older days come from the daily totals the
 * cron keeps (daily_page_views, path '*'). A visitor is counted once per day: visitor codes change daily, so one
 * person on two days counts as two visitors.
 */
import { sql } from 'drizzle-orm';
import { rows, type DB } from './db/types';
import { TZ, dayOf } from './track';

/** Days kept as single views, minus a margin so the cron's 90-day deletion never cuts a day in half. */
const RAW_DAYS = 88;

export const addDays = (day: string, n: number) =>
  new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
/** The start of a Manila day as an instant. */
const startOf = (day: string) => new Date(`${day}T00:00:00+08:00`).toISOString();

export type Point = { key: string; views: number; visitors: number };

/** Views and visitors for every day in [from, to], zero-filled. */
export async function dailySeries(db: DB, from: string, to: string, now = new Date()): Promise<Point[]> {
  const rawFrom = addDays(dayOf(now), -RAW_DAYS);
  const byDay = new Map<string, Point>();
  if (from < rawFrom) {
    const rolled = rows<{ day: string; views: number; visitors: number }>(
      await db.execute(sql`
        select to_char(day, 'YYYY-MM-DD') as day, views, visitors from daily_page_views
        where path = '*' and day >= ${from}::date and day < ${rawFrom}::date`),
    );
    for (const r of rolled)
      byDay.set(r.day, { key: r.day, views: Number(r.views), visitors: Number(r.visitors) });
  }
  const live = rows<{ day: string; views: number; visitors: number }>(
    await db.execute(sql`
      select to_char((occurred_at at time zone ${TZ})::date, 'YYYY-MM-DD') as day,
             count(*)::int as views, count(distinct visitor_hash)::int as visitors
      from page_views
      where environment = 'production' and occurred_at >= ${startOf(from < rawFrom ? rawFrom : from)}
        and occurred_at < ${startOf(addDays(to, 1))}
      group by 1`),
  );
  for (const r of live)
    byDay.set(r.day, { key: r.day, views: Number(r.views), visitors: Number(r.visitors) });
  const out: Point[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(byDay.get(d) ?? { key: d, views: 0, visitors: 0 });
  return out;
}

const mondayOf = (day: string) => addDays(day, -((new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7));

/** Visits per day (30 days), per week from Monday (12 weeks), and per month (12 months). */
export async function visitCharts(db: DB, now = new Date()) {
  const today = dayOf(now);
  const monthStart = `${today.slice(0, 7)}-01`;
  const yearFrom = (() => {
    const [y, m] = monthStart.split('-').map(Number) as [number, number];
    const d = new Date(Date.UTC(y, m - 1 - 11, 1));
    return d.toISOString().slice(0, 10);
  })();
  const series = await dailySeries(db, yearFrom, today, now);
  const at = new Map(series.map((p) => [p.key, p]));
  const sum = (from: string, days: number, key: string): Point => {
    const p: Point = { key, views: 0, visitors: 0 };
    for (let i = 0; i < days; i++) {
      const v = at.get(addDays(from, i));
      if (v) {
        p.views += v.views;
        p.visitors += v.visitors;
      }
    }
    return p;
  };
  const daily = series.slice(-30);
  const thisMonday = mondayOf(today);
  const weekly = Array.from({ length: 12 }, (_, i) => {
    const start = addDays(thisMonday, -7 * (11 - i));
    return sum(start, 7, start);
  });
  const monthly = series.reduce<Point[]>((acc, p) => {
    const key = p.key.slice(0, 7);
    const last = acc.at(-1);
    if (last?.key === key) {
      last.views += p.views;
      last.visitors += p.visitors;
    } else acc.push({ key, views: p.views, visitors: p.visitors });
    return acc;
  }, []);
  return { daily, weekly, monthly };
}

export type Row = { key: string; value: number };
export type Breakdowns = {
  views: number;
  visitors: number;
  pages: Row[];
  sources: Row[];
  countries: Row[];
  devices: Row[];
  browsers: Row[];
  languages: Row[];
  hours: Row[];
};

/** Totals and top tens for the last `days` days (today included). Uses single views, so at most 88 days. */
export async function breakdowns(db: DB, days: number, now = new Date()): Promise<Breakdowns> {
  const today = dayOf(now);
  const from = addDays(today, -(Math.min(days, RAW_DAYS) - 1));
  const r = rows<{ metric: string; key: string; value: number }>(
    await db.execute(sql`
      with pv as (
        select * from page_views
        where environment = 'production' and occurred_at >= ${startOf(from)} and occurred_at < ${startOf(addDays(today, 1))}
      )
      select 'views' as metric, '' as key, count(*)::int as value from pv
      union all select 'visitors', '', count(distinct (visitor_hash, (occurred_at at time zone ${TZ})::date))::int from pv
      union all select 'page', path, count(*)::int from pv group by path
      union all select 'source', coalesce(referrer_host, ''), count(*)::int from pv group by referrer_host
      union all select 'country', coalesce(country, ''), count(*)::int from pv group by country
      union all select 'device', device_type, count(*)::int from pv group by device_type
      union all select 'browser', browser, count(*)::int from pv group by browser
      union all select 'language', lang, count(*)::int from pv group by lang
      union all select 'hour', extract(hour from occurred_at at time zone ${TZ})::int::text, count(*)::int from pv group by 2`),
  );
  const pick = (metric: string, n = 10) =>
    r
      .filter((x) => x.metric === metric)
      .map((x) => ({ key: x.key, value: Number(x.value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, n);
  const hours = new Map(pick('hour', 24).map((h) => [h.key, h.value]));
  return {
    views: Number(r.find((x) => x.metric === 'views')?.value ?? 0),
    visitors: Number(r.find((x) => x.metric === 'visitors')?.value ?? 0),
    pages: pick('page'),
    sources: pick('source'),
    countries: pick('country'),
    devices: pick('device'),
    browsers: pick('browser'),
    languages: pick('language'),
    hours: Array.from({ length: 24 }, (_, h) => ({ key: String(h), value: hours.get(String(h)) ?? 0 })),
  };
}

export type Download = { version: string; publishedAt: string; downloads: number };

/** Installer downloads per release, read live from GitHub's own counts (nothing is stored here). */
export async function releaseDownloads(fetchImpl: typeof fetch = fetch): Promise<Download[] | null> {
  try {
    const res = await fetchImpl('https://api.github.com/repos/PastelSalt/himawari-c/releases?per_page=30', {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'himawari-website' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const list = (await res.json()) as {
      tag_name: string;
      published_at: string;
      draft: boolean;
      assets: { name: string; download_count: number }[];
    }[];
    return list
      .filter((r) => !r.draft)
      .map((r) => ({
        version: r.tag_name.replace(/^v/, ''),
        publishedAt: r.published_at,
        downloads: r.assets
          .filter((a) => /^Himawari-Studio-Setup-.*\.exe$/.test(a.name))
          .reduce((s, a) => s + a.download_count, 0),
      }));
  } catch {
    return null;
  }
}
