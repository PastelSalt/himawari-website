/**
 * The engine's docs as site pages (WEBSITE.md §9.5). scripts/sync-release.ts copies docs/ from the released tag and
 * adapts each file once with adaptDoc():
 * - relative links to other docs pages become site URLs (docs/how-to/x.md → /docs/how-to/x, docs/ja/… → /ja/docs/…);
 * - links to anything else in the engine repository (the spec, the policies) point at GitHub at the released tag;
 * - emoji are dropped, since the site never shows them (WEBSITE.md §6.4).
 */
import { posix } from 'node:path';

/** pictographs and their variation selector, but not ©, ®, ™ */
export const EMOJI = /(?![©®™])\p{Extended_Pictographic}️?/gu;

/** docs/how-to/x.md → /docs/how-to/x; docs/ja/index.md → /ja/docs */
export function docUrl(repoPath: string): string {
  let p = repoPath.replace(/^docs\//, '').replace(/\.md$/, '');
  p = p.replace(/(^|\/)index$/, '');
  const ja = p === 'ja' || p.startsWith('ja/');
  if (ja) p = p.replace(/^ja\/?/, '');
  return `${ja ? '/ja' : ''}/docs${p ? `/${p}` : ''}`;
}

/** A link in the docs file at `from` (a repo path such as docs/how-to/x.md), as the site should show it. */
export function resolveDocHref(href: string, from: string, blob: string): string {
  if (/^([a-z]+:|#|\/)/i.test(href)) return href;
  const [target = '', hash] = href.split('#');
  const resolved = posix.normalize(posix.join(posix.dirname(from), target));
  const tail = hash ? `#${hash}` : '';
  if (resolved.startsWith('docs/') && resolved.endsWith('.md')) return docUrl(resolved) + tail;
  return `${blob}/${resolved}${tail}`;
}

/** Rewrites the inline links and drops the emoji of one docs file. Code spans and blocks are left alone. */
export function adaptDoc(markdown: string, from: string, blob: string): string {
  let fenced = false;
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return line;
      }
      if (fenced) return line;
      // split around inline code so `examples` keep their exact text
      return line
        .split(/(`[^`]*`)/)
        .map((part) =>
          part.startsWith('`')
            ? part
            : part
                .replace(/\]\(([^)\s]+)\)/g, (_, href: string) => `](${resolveDocHref(href, from, blob)})`)
                .replace(EMOJI, '')
                .replace(/^(#+) +/, '$1 '),
        )
        .join('');
    })
    .join('\n');
}
