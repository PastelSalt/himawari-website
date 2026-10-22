/** News posts (WEBSITE.md §4): Markdown in the repo, one folder per language. */
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
    /** until the post pages exist (W3), rows link here */
    link: z.url().optional(),
  }),
});

export const collections = { news };
