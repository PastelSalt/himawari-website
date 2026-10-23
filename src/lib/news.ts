/** News posts for one language, newest first, with their page URL (src/content/news/<lang>/<slug>.md). */
import type { CollectionEntry } from 'astro:content';
import { path, type Lang } from './site';

export type Post = CollectionEntry<'news'>['data'] & {
  slug: string;
  href: string;
  entry: CollectionEntry<'news'>;
};

export function newsPosts(all: CollectionEntry<'news'>[], lang: Lang): Post[] {
  return all
    .filter((p) => p.id.startsWith(`${lang}/`))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || (b.data.seq ?? 0) - (a.data.seq ?? 0))
    .map((p) => {
      const slug = p.id.slice(lang.length + 1);
      return { ...p.data, slug, href: path(`/news/${slug}`, lang), entry: p };
    });
}

/** "22 Oct 2026" / "2026年10月22日" */
export function postDate(d: Date, lang: Lang, month: 'short' | 'long' = 'short'): string {
  return d.toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-GB', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: lang === 'ja' ? 'long' : month,
    day: 'numeric',
  });
}
