/** Content: news posts (one folder per language), the privacy and about pages, and the engine's released docs. */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['Release', 'Announcement']),
    /** one line for the news bar and the news list */
    summary: z.string(),
    /** the release on GitHub, for release posts */
    link: z.url().optional(),
  }),
});

/** /privacy and /about, as Markdown in each language (src/content/pages/<lang>/<page>.md) */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({ updated: z.coerce.date() }),
});

/** copied from the engine's docs/ folder at the released tag, links adapted, by scripts/sync-release.ts; never edited here */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
});

export const collections = { news, pages, docs };
