/**
 * The site's little database (WEBSITE.md §9.3): cookieless visit counts and rate limits. Nothing here can identify
 * a visitor: no IP addresses, no full user agents, and visitor codes that can't be linked across days.
 */
import { bigint, date, index, integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

/** One random value per day (Asia/Manila). Visitor codes and rate-limit keys are hashed with it; the daily cron
 *  deletes it after two days, so codes from different days can't be matched or reversed. */
export const analyticsSalts = pgTable('analytics_salts', {
  day: date('day').primaryKey(),
  salt: text('salt').notNull(),
});

/** One row per page view, kept for 90 days. */
export const pageViews = pgTable(
  'page_views',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    path: text('path').notNull(),
    lang: text('lang').notNull(),
    referrerHost: text('referrer_host'),
    deviceType: text('device_type').notNull(),
    browser: text('browser').notNull(),
    country: text('country'),
    visitorHash: text('visitor_hash').notNull(),
    environment: text('environment').notNull(),
  },
  (t) => [index('page_views_occurred_at').on(t.occurredAt)],
);

/** Daily totals per page, kept after the single views are deleted. path '*' is the whole site. */
export const dailyPageViews = pgTable(
  'daily_page_views',
  {
    day: date('day').notNull(),
    path: text('path').notNull(),
    views: integer('views').notNull(),
    visitors: integer('visitors').notNull(),
  },
  (t) => [primaryKey({ columns: [t.day, t.path] })],
);

/** Hits per key and window for every POST route (the portfolio's rate_limits). Keys are HMAC hashes. */
export const rateLimits = pgTable(
  'rate_limits',
  {
    bucket: text('bucket').notNull(),
    keyHash: text('key_hash').notNull(),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
    hits: integer('hits').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.bucket, t.keyHash, t.windowStart] })],
);
