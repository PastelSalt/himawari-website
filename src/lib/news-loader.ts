/**
 * The news collection's loader. With DATABASE_URL (every Vercel build) the published posts come from the database,
 * where the admin panel edits them; each language with a title becomes its own entry (en/<slug>, ja/<slug>).
 * Without it (local builds, CI) the Markdown files in src/content/news stand in.
 *
 * If the database is configured but can't be read, the build fails rather than publishing out-of-date news;
 * Vercel then keeps the last good deployment live.
 */
import { neon } from '@neondatabase/serverless';
import { glob, type Loader } from 'astro/loaders';

type Row = {
  id: number | string;
  slug: string;
  posted_on: string;
  category: string;
  link: string | null;
  title_en: string;
  summary_en: string;
  body_en: string;
  title_ja: string | null;
  summary_ja: string | null;
  body_ja: string | null;
};

const markdown = glob({ pattern: '**/*.md', base: './src/content/news' });

export function newsLoader(): Loader {
  return {
    name: 'himawari-news',
    load: async (ctx) => {
      const url = process.env.DATABASE_URL;
      if (!url) {
        ctx.logger.info('no DATABASE_URL: news from src/content/news');
        return markdown.load(ctx);
      }
      const rows = (await neon(url)`
        select id, slug, posted_on::text, category, link, title_en, summary_en, body_en, title_ja, summary_ja, body_ja
        from news_posts where status = 'published'`) as Row[];
      ctx.store.clear();
      for (const r of rows) {
        for (const lang of ['en', 'ja'] as const) {
          const title = lang === 'en' ? r.title_en : r.title_ja;
          const summary = lang === 'en' ? r.summary_en : r.summary_ja;
          const body = lang === 'en' ? r.body_en : r.body_ja;
          if (!title || !summary || !body) continue;
          const id = `${lang}/${r.slug}`;
          const data = await ctx.parseData({
            id,
            data: {
              title,
              summary,
              date: r.posted_on,
              category: r.category,
              link: r.link ?? undefined,
              seq: Number(r.id), // bigint arrives as a string
            },
          });
          ctx.store.set({
            id,
            data,
            body,
            rendered: await ctx.renderMarkdown(body),
            digest: ctx.generateDigest({ data, body }),
          });
        }
      }
      ctx.logger.info(`${rows.length} published posts from the database`);
    },
  };
}
