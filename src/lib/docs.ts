/** The engine's docs as site pages (WEBSITE.md §9.5): URLs, titles, and the sidebar groups. */
import type { CollectionEntry } from 'astro:content';
import { docUrl } from './doc-links';
import type { Lang } from './site';

type Doc = CollectionEntry<'docs'>;

export const isJa = (d: Doc) => d.id === 'ja' || d.id.startsWith('ja/');
export const docLang = (d: Doc): Lang => (isJa(d) ? 'ja' : 'en');
export const docRepoPath = (d: Doc) =>
  `docs/${d.filePath?.replace(/^.*src\/content\/docs\//, '') ?? `${d.id}.md`}`;
export const docHref = (d: Doc) => docUrl(docRepoPath(d));
/** the route's [...slug] param: undefined for the docs home */
export const docSlug = (d: Doc) => docHref(d).replace(/^(\/ja)?\/docs\/?/, '') || undefined;

/** The page's first "# " heading, without Markdown marks (emoji are already gone: doc-links.ts). */
export function docTitle(d: Doc): string {
  const h = /^#\s+(.+)$/m.exec(d.body ?? '')?.[1] ?? d.id;
  return h.replace(/[*_`]/g, '').trim();
}

const GROUPS = [
  { key: 'tutorials', en: 'Tutorials', ja: 'チュートリアル' },
  { key: 'how-to', en: 'How-to guides', ja: 'ハウツー' },
  { key: 'reference', en: 'Reference', ja: 'リファレンス' },
  { key: 'explanation', en: 'Explanation', ja: '解説' },
] as const;

/** Sidebar groups for a language: its own pages first; Japanese pages then list the English ones, marked. */
export function docGroups(all: Doc[], lang: Lang) {
  const sorted = [...all].sort((a, b) => a.id.localeCompare(b.id));
  const group = (docs: Doc[], label: string, english = false) => ({
    label,
    english,
    items: docs.map((d) => ({ href: docHref(d), title: docTitle(d) })),
  });
  const own = sorted.filter((d) => docLang(d) === lang);
  const key = (d: Doc) => d.id.replace(/^ja\/?/, '').split('/')[0] ?? '';
  const start = own.filter((d) => !GROUPS.some((g) => g.key === key(d)));
  const out = [group(start, lang === 'ja' ? 'はじめに' : 'Start')];
  for (const g of GROUPS) {
    const docs = own.filter((d) => key(d) === g.key);
    if (docs.length) out.push(group(docs, g[lang]));
  }
  if (lang === 'ja')
    out.push(
      group(
        sorted.filter((d) => !isJa(d)),
        '英語のページ',
        true,
      ),
    );
  return out;
}
