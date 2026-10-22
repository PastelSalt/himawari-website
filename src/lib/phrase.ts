/**
 * Japanese line breaks (WEBSITE.md §6.3): BudouX splits a headline into phrases at build time, and each phrase
 * becomes a span that doesn't wrap (.ph in base.css). Lines then break between phrases, never inside a word.
 * (`<wbr>` with `word-break: keep-all` broke inside words in Chrome where a phrase met a tag such as <mark>.)
 * `html` is our own copy and may hold tags (<mark>, <code>); only the text between tags is split.
 */
import { loadDefaultJapaneseParser } from 'budoux';
import type { Lang } from './site';

const parser = loadDefaultJapaneseParser();

export function phrase(html: string, lang: Lang): string {
  if (lang !== 'ja') return html;
  return html
    .split(/(<[^>]+>)/)
    .map((part) =>
      part.startsWith('<') || !part
        ? part
        : parser
            .parse(part)
            .map((p) => `<span class="ph">${p}</span>`)
            .join(''),
    )
    .join('');
}
