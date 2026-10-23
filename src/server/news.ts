/**
 * News posts, edited in the admin panel. The site stays static: published posts are read when the site is built
 * (src/lib/news-loader.ts), and every change to what's public asks Vercel to rebuild through a deploy hook.
 */
import { desc, eq } from 'drizzle-orm';
import { z } from 'astro/zod';
import * as schema from './db/schema';
import type { DB } from './db/types';
import { logActivity } from './auth';

export type NewsPost = typeof schema.newsPosts.$inferSelect;

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((s) => s || null);

/** The editor form. Japanese is optional as a whole: give its title, summary, and text together, or none. */
export const NewsForm = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(80)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and single hyphens'),
    postedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'),
    category: z.enum(['Release', 'Announcement']),
    link: z
      .string()
      .trim()
      .max(300)
      .refine((s) => !s || /^https:\/\/[^\s]+$/.test(s), 'Use a full https:// address')
      .transform((s) => s || null),
    titleEn: z.string().trim().min(1, 'Required').max(140),
    summaryEn: z.string().trim().min(1, 'Required').max(200),
    bodyEn: z.string().trim().min(1, 'Required').max(20_000),
    titleJa: optional(140),
    summaryJa: optional(200),
    bodyJa: optional(20_000),
  })
  .superRefine((v, ctx) => {
    const ja = [v.titleJa, v.summaryJa, v.bodyJa];
    if (ja.some(Boolean) && !ja.every(Boolean))
      for (const [k, val] of [
        ['titleJa', v.titleJa],
        ['summaryJa', v.summaryJa],
        ['bodyJa', v.bodyJa],
      ] as const)
        if (!val)
          ctx.addIssue({ code: 'custom', path: [k], message: 'Fill in all three in Japanese, or none' });
  });
export type NewsInput = z.infer<typeof NewsForm>;

/** Form fields → { data } or { errors: { field: message } }. */
export function parseNewsForm(form: FormData): { data: NewsInput } | { errors: Record<string, string> } {
  const raw = Object.fromEntries(
    [
      'slug',
      'postedOn',
      'category',
      'link',
      'titleEn',
      'summaryEn',
      'bodyEn',
      'titleJa',
      'summaryJa',
      'bodyJa',
    ].map((k) => [k, String(form.get(k) ?? '')]),
  );
  const parsed = NewsForm.safeParse(raw);
  if (parsed.success) return { data: parsed.data };
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
  return { errors };
}

export const listPosts = (db: DB) =>
  db.select().from(schema.newsPosts).orderBy(desc(schema.newsPosts.postedOn), desc(schema.newsPosts.id));

export async function getPost(db: DB, id: number): Promise<NewsPost | undefined> {
  const [row] = await db.select().from(schema.newsPosts).where(eq(schema.newsPosts.id, id));
  return row;
}

export async function slugTaken(db: DB, slug: string, exceptId?: number): Promise<boolean> {
  const [row] = await db
    .select({ id: schema.newsPosts.id })
    .from(schema.newsPosts)
    .where(eq(schema.newsPosts.slug, slug));
  return !!row && row.id !== exceptId;
}

/** Creates or updates a post and sets its status. Returns the saved post. */
export async function savePost(
  db: DB,
  username: string,
  input: NewsInput,
  publish: boolean,
  id?: number,
): Promise<NewsPost> {
  const now = new Date();
  const status = publish ? 'published' : 'draft';
  let post: NewsPost | undefined;
  if (id) {
    const before = await getPost(db, id);
    [post] = await db
      .update(schema.newsPosts)
      .set({
        ...input,
        status,
        publishedAt: publish ? (before?.publishedAt ?? now) : null,
        updatedAt: now,
      })
      .where(eq(schema.newsPosts.id, id))
      .returning();
  } else {
    [post] = await db
      .insert(schema.newsPosts)
      .values({ ...input, status, publishedAt: publish ? now : null })
      .returning();
  }
  if (!post) throw new Error('the post was not saved');
  await logActivity(db, username, publish ? 'news.publish' : 'news.save_draft', { slug: post.slug });
  return post;
}

export async function deletePost(db: DB, username: string, id: number): Promise<NewsPost | undefined> {
  const [post] = await db.delete(schema.newsPosts).where(eq(schema.newsPosts.id, id)).returning();
  if (post) await logActivity(db, username, 'news.delete', { slug: post.slug });
  return post;
}

export type RebuildResult = 'started' | 'no_hook' | 'failed';

/** Asks Vercel to rebuild the site, so a change to the news goes live. */
export async function triggerRebuild(
  hookUrl: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<RebuildResult> {
  if (!hookUrl) return 'no_hook';
  try {
    const res = await fetchImpl(hookUrl, { method: 'POST', signal: AbortSignal.timeout(8000) });
    return res.ok ? 'started' : 'failed';
  } catch {
    return 'failed';
  }
}
