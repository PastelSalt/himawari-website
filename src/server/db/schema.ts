/**
 * The site's little database (WEBSITE.md §9.3): cookieless visit counts, rate limits, the news, and the admin
 * panel's account and sessions. Nothing here can identify a visitor: no IP addresses, no full user agents, and
 * visitor codes that can't be linked across days.
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

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

/* ------------------------------------------------------------------ the admin panel (Kotoha's pattern) */

/** The owner's account. Created at the first sign-in from ADMIN_USERNAME / ADMIN_TEMP_PASSWORD, which must then
 *  be changed; after that those env values are ignored. */
export const adminUsers = pgTable(
  'admin_users',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    mustChangePassword: boolean('must_change_password').notNull().default(true),
    passwordChangedAt: timestamp('password_changed_at', { withTimezone: true }),
    failedLoginCount: integer('failed_login_count').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check('admin_users_username', sql`${t.username} ~ '^[a-z0-9_.-]{3,40}$'`)],
);

/** Signed-in browsers. Only a SHA-256 of the cookie's token is stored. */
export const adminSessions = pgTable(
  'admin_sessions',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    adminUserId: bigint('admin_user_id', { mode: 'number' })
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (t) => [index('admin_sessions_user').on(t.adminUserId)],
);

/** Sign-in attempts, for the lockout. The IP is kept only as a hash with the day's salt. */
export const loginAttempts = pgTable(
  'login_attempts',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    attemptedAt: timestamp('attempted_at', { withTimezone: true }).notNull().defaultNow(),
    ipHash: text('ip_hash').notNull(),
    usernameAttempted: text('username_attempted').notNull(),
    succeeded: boolean('succeeded').notNull(),
  },
  (t) => [index('login_attempts_ip').on(t.ipHash, t.attemptedAt)],
);

/** What was done in the admin panel, and when. */
export const activityLog = pgTable('activity_log', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
  username: text('username').notNull(),
  action: text('action').notNull(),
  details: jsonb('details').notNull().default({}),
});

/** News posts in both languages. Published posts are read at build time (src/lib/news-loader.ts); saving one
 *  triggers a rebuild through the deploy hook. A post with no Japanese title appears on the English site only. */
export const newsPosts = pgTable(
  'news_posts',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    slug: text('slug').notNull().unique(),
    postedOn: date('posted_on').notNull(),
    category: text('category').notNull().default('Announcement'),
    link: text('link'),
    titleEn: text('title_en').notNull(),
    summaryEn: text('summary_en').notNull(),
    bodyEn: text('body_en').notNull(),
    titleJa: text('title_ja'),
    summaryJa: text('summary_ja'),
    bodyJa: text('body_ja'),
    status: text('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('news_posts_slug', sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check('news_posts_category', sql`${t.category} in ('Release', 'Announcement')`),
    check('news_posts_status', sql`${t.status} in ('draft', 'published')`),
    check('news_posts_link', sql`${t.link} is null or ${t.link} ~ '^https://'`),
    index('news_posts_public').on(t.status, t.postedOn),
  ],
);
