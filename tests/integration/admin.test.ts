import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import * as schema from '../../src/server/db/schema';
import type { DB } from '../../src/server/db/types';
import { changePassword, getSession, login, revokeSession } from '../../src/server/auth';
import { checkPasswordPolicy } from '../../src/server/password';
import {
  deletePost,
  listPosts,
  parseNewsForm,
  savePost,
  slugTaken,
  triggerRebuild,
} from '../../src/server/news';
import { freshDb } from './helpers';

const BOOT = { username: 'moeko', tempPassword: 'Temporary-From-Vercel-7' };
const STRONG = 'lantern river teacup 42';
const noLeak = async () => false;

let db: DB;
let pg: PGlite;
beforeEach(async () => ({ db, pg } = await freshDb()));
afterEach(async () => pg.close());

const signIn = (username: string, password: string, ip = '203.0.113.7') =>
  login(db, { username, password, ip, bootstrap: BOOT });

describe('the first sign-in', () => {
  it('creates the owner from the env values, who must then change the password', async () => {
    const r = await signIn('Moeko', BOOT.tempPassword);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.user).toMatchObject({ username: 'moeko', mustChangePassword: true });
    expect(r.user.passwordHash).not.toContain(BOOT.tempPassword);
  });

  it('refuses a wrong temporary password, and creates nothing', async () => {
    expect(await signIn('moeko', 'not-the-one')).toEqual({ ok: false, error: 'invalid' });
    expect(await db.select().from(schema.adminUsers)).toHaveLength(0);
  });

  it('does nothing without env values', async () => {
    const r = await login(db, { username: 'moeko', password: 'x', ip: '1.1.1.1', bootstrap: {} });
    expect(r).toEqual({ ok: false, error: 'invalid' });
  });

  it('stops accepting the temporary password once it has been changed', async () => {
    const first = await signIn('moeko', BOOT.tempPassword);
    if (!first.ok) throw new Error('first sign-in failed');
    const changed = await changePassword(db, first.user, {
      current: BOOT.tempPassword,
      next: STRONG,
      confirm: STRONG,
      leakCheck: noLeak,
    });
    expect(changed.ok).toBe(true);
    expect(await signIn('moeko', BOOT.tempPassword)).toEqual({ ok: false, error: 'invalid' });
    const again = await signIn('moeko', STRONG);
    expect(again.ok && again.user.mustChangePassword).toBe(false);
  });

  it('never creates a second account from the env values', async () => {
    await signIn('moeko', BOOT.tempPassword);
    const other = await login(db, {
      username: 'someone',
      password: 'x'.repeat(12),
      ip: '1.1.1.1',
      bootstrap: { username: 'someone', tempPassword: 'x'.repeat(12) },
    });
    expect(other.ok).toBe(false);
    expect(await db.select().from(schema.adminUsers)).toHaveLength(1);
  });
});

describe('sessions', () => {
  it('a token signs in until it is revoked; old ones end on a password change', async () => {
    const r = await signIn('moeko', BOOT.tempPassword);
    if (!r.ok) throw new Error('sign-in failed');
    const s = await getSession(db, r.token);
    expect(s?.user.username).toBe('moeko');
    expect(await getSession(db, 'not-a-token')).toBeNull();

    const changed = await changePassword(db, r.user, {
      current: BOOT.tempPassword,
      next: STRONG,
      confirm: STRONG,
      leakCheck: noLeak,
    });
    expect(await getSession(db, r.token)).toBeNull();
    if (!changed.ok) throw new Error('change failed');
    const fresh = await getSession(db, changed.token);
    expect(fresh).not.toBeNull();
    await revokeSession(db, fresh!.sessionId);
    expect(await getSession(db, changed.token)).toBeNull();
  });

  it('ends after two idle hours', async () => {
    const r = await signIn('moeko', BOOT.tempPassword);
    if (!r.ok) throw new Error('sign-in failed');
    expect(await getSession(db, r.token, new Date(Date.now() + 3 * 3_600_000))).toBeNull();
  });
});

describe('the lockout', () => {
  it('stops after five wrong passwords from one place', async () => {
    await signIn('moeko', BOOT.tempPassword);
    for (let i = 0; i < 5; i++) await signIn('moeko', 'wrong password here');
    expect(await signIn('moeko', BOOT.tempPassword)).toEqual({ ok: false, error: 'too_many' });
  });
});

describe('the password rules', () => {
  it('turn down short, guessable, and same-as-username passwords', () => {
    expect(checkPasswordPolicy('short')).toContain('min_length');
    expect(checkPasswordPolicy('HimawariStudio2026!')).toContain('guessable');
    expect(checkPasswordPolicy('moeko-and-more-words', { username: 'moeko' })).toContain('contains_username');
    expect(checkPasswordPolicy(STRONG)).toEqual([]);
  });

  it('report a wrong current password and a mismatched confirmation', async () => {
    const r = await signIn('moeko', BOOT.tempPassword);
    if (!r.ok) throw new Error('sign-in failed');
    expect(
      await changePassword(db, r.user, { current: 'nope', next: STRONG, confirm: STRONG, leakCheck: noLeak }),
    ).toMatchObject({ ok: false, current: 'wrong' });
    expect(
      await changePassword(db, r.user, {
        current: BOOT.tempPassword,
        next: STRONG,
        confirm: 'different',
        leakCheck: noLeak,
      }),
    ).toMatchObject({ ok: false, confirm: 'mismatch' });
    expect(
      await changePassword(db, r.user, {
        current: BOOT.tempPassword,
        next: STRONG,
        confirm: STRONG,
        leakCheck: async () => true,
      }),
    ).toMatchObject({ ok: false, next: ['leaked'] });
  });
});

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const POST = {
  slug: 'site-is-live',
  postedOn: '2026-10-23',
  category: 'Announcement',
  link: '',
  titleEn: 'The website is live',
  summaryEn: 'Himawari has a home on the web.',
  bodyEn: 'Hello.',
  titleJa: '',
  summaryJa: '',
  bodyJa: '',
};

describe('news', () => {
  it('starts with the two release posts', async () => {
    const posts = await listPosts(db);
    expect(posts.map((p) => p.slug)).toEqual([
      '2026-10-22-himawari-studio-0-4-1',
      '2026-10-22-himawari-studio-0-4-0',
    ]);
    expect(posts.every((p) => p.status === 'published' && p.titleJa)).toBe(true);
  });

  it('checks the form: Japanese all or nothing, a clean address, an https link', () => {
    expect('data' in parseNewsForm(form(POST))).toBe(true);
    const bad = parseNewsForm(form({ ...POST, slug: 'Not OK!', link: 'http://x', titleJa: 'タイトル' }));
    expect('errors' in bad && Object.keys(bad.errors).sort()).toEqual([
      'bodyJa',
      'link',
      'slug',
      'summaryJa',
    ]);
  });

  it('saves a draft, publishes it, and deletes it', async () => {
    const parsed = parseNewsForm(form(POST));
    if (!('data' in parsed)) throw new Error('form rejected');
    const draft = await savePost(db, 'moeko', parsed.data, false);
    expect(draft).toMatchObject({ status: 'draft', publishedAt: null });
    expect(await slugTaken(db, 'site-is-live')).toBe(true);
    expect(await slugTaken(db, 'site-is-live', draft.id)).toBe(false);
    const live = await savePost(db, 'moeko', parsed.data, true, draft.id);
    expect(live.status).toBe('published');
    expect(live.publishedAt).toBeInstanceOf(Date);
    await deletePost(db, 'moeko', draft.id);
    expect(await slugTaken(db, 'site-is-live')).toBe(false);
    const log = await db.select().from(schema.activityLog);
    expect(log.map((l) => l.action)).toEqual(['news.save_draft', 'news.publish', 'news.delete']);
  });

  it('rebuilds through the hook, and says so when there is none', async () => {
    expect(await triggerRebuild(undefined)).toBe('no_hook');
    expect(await triggerRebuild('https://hook', async () => new Response('', { status: 201 }))).toBe(
      'started',
    );
    expect(await triggerRebuild('https://hook', async () => new Response('', { status: 500 }))).toBe(
      'failed',
    );
  });
});
