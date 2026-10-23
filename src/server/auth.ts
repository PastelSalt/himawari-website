/**
 * The admin panel's sign-in, sessions, and lockout, as on the Kotoha fan site (lib/auth.js, api/auth.js).
 *
 * The owner account doesn't exist until the first sign-in: when there is no account yet and the username and
 * password match ADMIN_USERNAME / ADMIN_TEMP_PASSWORD, the account is created from them and must change its password
 * before doing anything else. Once an account exists those env values are ignored, so the temporary password stops
 * working the moment it's replaced.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { and, count, eq, gt, isNull, ne, sql } from 'drizzle-orm';
import * as schema from './db/schema';
import type { DB } from './db/types';
import { dayOf, hmac, saltFor } from './track';
import {
  PASSWORD_MAX,
  burnVerifyTime,
  checkPasswordPolicy,
  hashPassword,
  isLeakedPassword,
  verifyPassword,
  type PolicyRule,
} from './password';

export const IDLE_MINUTES = 120; // signed out after 2 hours without activity
export const ABSOLUTE_DAYS = 7; // a session never outlives 7 days
const TOUCH_EVERY_MS = 5 * 60 * 1000; // last_seen_at is refreshed at most every 5 minutes
const WINDOW_MINUTES = 15;
const MAX_FAILS_PER_USER_AND_IP = 5;
const MAX_FAILS_PER_IP = 20;
const LOCK_AFTER_FAILS = 5;

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const sameSecret = (a: string, b: string) => timingSafeEqual(Buffer.from(sha256(a)), Buffer.from(sha256(b)));

/** `__Host-` cookies need HTTPS; plain-http local development gets another name. */
export const cookieName = (https: boolean) => (https ? '__Host-hws_admin' : 'hws_admin_dev');

export type AdminUser = typeof schema.adminUsers.$inferSelect;

export async function logActivity(
  db: DB,
  username: string,
  action: string,
  details: Record<string, unknown> = {},
) {
  await db.insert(schema.activityLog).values({ username, action, details });
}

async function createSession(db: DB, userId: number, now: Date): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await db.insert(schema.adminSessions).values({
    adminUserId: userId,
    tokenHash: sha256(token),
    createdAt: now,
    lastSeenAt: now,
    expiresAt: new Date(now.getTime() + ABSOLUTE_DAYS * 86_400_000),
  });
  return token;
}

export type LoginResult =
  { ok: true; token: string; user: AdminUser } | { ok: false; error: 'invalid' | 'too_many' };

export async function login(
  db: DB,
  input: {
    username: string;
    password: string;
    ip: string;
    bootstrap: { username?: string; tempPassword?: string };
    now?: Date;
  },
): Promise<LoginResult> {
  const now = input.now ?? new Date();
  const username = input.username.trim().toLowerCase().slice(0, 64);
  const password = input.password;
  if (!username || !password || password.length > PASSWORD_MAX) return { ok: false, error: 'invalid' };

  const ipHash = hmac(await saltFor(db, dayOf(now)), `login|${input.ip}`);
  const since = new Date(now.getTime() - WINDOW_MINUTES * 60_000);
  const [counts] = await db
    .select({
      userIp: sql<number>`count(*) filter (where ${schema.loginAttempts.usernameAttempted} = ${username})::int`,
      ip: sql<number>`count(*)::int`,
    })
    .from(schema.loginAttempts)
    .where(
      and(
        eq(schema.loginAttempts.ipHash, ipHash),
        eq(schema.loginAttempts.succeeded, false),
        gt(schema.loginAttempts.attemptedAt, since),
      ),
    );
  if ((counts?.userIp ?? 0) >= MAX_FAILS_PER_USER_AND_IP || (counts?.ip ?? 0) >= MAX_FAILS_PER_IP)
    return { ok: false, error: 'too_many' };

  const attempt = (succeeded: boolean) =>
    db
      .insert(schema.loginAttempts)
      .values({ attemptedAt: now, ipHash, usernameAttempted: username, succeeded });

  let [user] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.username, username));

  if (!user) {
    // the first sign-in: create the owner from the env values, once
    const [{ n } = { n: 0 }] = await db.select({ n: count() }).from(schema.adminUsers);
    const b = input.bootstrap;
    const bootUser = (b.username ?? '').trim().toLowerCase();
    if (
      n === 0 &&
      bootUser &&
      b.tempPassword &&
      /^[a-z0-9_.-]{3,40}$/.test(bootUser) &&
      sameSecret(username, bootUser) &&
      sameSecret(password, b.tempPassword)
    ) {
      [user] = await db
        .insert(schema.adminUsers)
        .values({ username: bootUser, passwordHash: await hashPassword(password), mustChangePassword: true })
        .returning();
      await logActivity(db, bootUser, 'account.created_from_env');
    } else {
      await burnVerifyTime(password);
      await attempt(false);
      return { ok: false, error: 'invalid' };
    }
  } else {
    if (user.lockedUntil && user.lockedUntil > now) return { ok: false, error: 'too_many' };
    if (!(await verifyPassword(user.passwordHash, password))) {
      const fails = user.failedLoginCount + 1;
      await db
        .update(schema.adminUsers)
        .set(
          fails >= LOCK_AFTER_FAILS
            ? { failedLoginCount: 0, lockedUntil: new Date(now.getTime() + WINDOW_MINUTES * 60_000) }
            : { failedLoginCount: fails },
        )
        .where(eq(schema.adminUsers.id, user.id));
      await attempt(false);
      return { ok: false, error: 'invalid' };
    }
  }

  const [fresh] = await db
    .update(schema.adminUsers)
    .set({ failedLoginCount: 0, lockedUntil: null, lastLoginAt: now })
    .where(eq(schema.adminUsers.id, user!.id))
    .returning();
  await attempt(true);
  const token = await createSession(db, fresh!.id, now);
  await logActivity(db, fresh!.username, 'auth.login');
  return { ok: true, token, user: fresh! };
}

export type Session = { sessionId: number; user: AdminUser };

/** The signed-in owner for a cookie token, or null. */
export async function getSession(
  db: DB,
  token: string | undefined,
  now = new Date(),
): Promise<Session | null> {
  if (!token || token.length > 100) return null;
  const [row] = await db
    .select({ session: schema.adminSessions, user: schema.adminUsers })
    .from(schema.adminSessions)
    .innerJoin(schema.adminUsers, eq(schema.adminUsers.id, schema.adminSessions.adminUserId))
    .where(
      and(
        eq(schema.adminSessions.tokenHash, sha256(token)),
        isNull(schema.adminSessions.revokedAt),
        gt(schema.adminSessions.expiresAt, now),
        gt(schema.adminSessions.lastSeenAt, new Date(now.getTime() - IDLE_MINUTES * 60_000)),
      ),
    );
  if (!row) return null;
  if (now.getTime() - row.session.lastSeenAt.getTime() > TOUCH_EVERY_MS)
    await db
      .update(schema.adminSessions)
      .set({ lastSeenAt: now })
      .where(eq(schema.adminSessions.id, row.session.id));
  return { sessionId: row.session.id, user: row.user };
}

export async function revokeSession(db: DB, sessionId: number) {
  await db
    .update(schema.adminSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(schema.adminSessions.id, sessionId), isNull(schema.adminSessions.revokedAt)));
}

/** Signs out every browser, or every other one. */
export async function revokeAllSessions(db: DB, userId: number, exceptSessionId?: number) {
  await db
    .update(schema.adminSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(schema.adminSessions.adminUserId, userId),
        isNull(schema.adminSessions.revokedAt),
        exceptSessionId ? ne(schema.adminSessions.id, exceptSessionId) : undefined,
      ),
    );
}

export type ChangePasswordResult =
  { ok: true; token: string } | { ok: false; current?: 'wrong'; next?: PolicyRule[]; confirm?: 'mismatch' };

/** Replaces the password, signs out everywhere, and returns a fresh session for this browser. */
export async function changePassword(
  db: DB,
  user: AdminUser,
  input: { current: string; next: string; confirm: string; leakCheck?: typeof isLeakedPassword },
): Promise<ChangePasswordResult> {
  if (!input.current || !(await verifyPassword(user.passwordHash, input.current)))
    return { ok: false, current: 'wrong' };
  if (input.next !== input.confirm) return { ok: false, confirm: 'mismatch' };
  const failed = checkPasswordPolicy(input.next, { username: user.username, currentPassword: input.current });
  if (!failed.length && (await (input.leakCheck ?? isLeakedPassword)(input.next)) === true)
    failed.push('leaked');
  if (failed.length) return { ok: false, next: failed };

  const now = new Date();
  await db
    .update(schema.adminUsers)
    .set({
      passwordHash: await hashPassword(input.next),
      mustChangePassword: false,
      passwordChangedAt: now,
      failedLoginCount: 0,
      lockedUntil: null,
    })
    .where(eq(schema.adminUsers.id, user.id));
  await revokeAllSessions(db, user.id);
  await logActivity(db, user.username, 'auth.password_change');
  return { ok: true, token: await createSession(db, user.id, now) };
}
