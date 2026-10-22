import { describe, expect, it } from 'vitest';
import { adaptDoc, docUrl, resolveDocHref } from '../../src/lib/doc-links';
import { phrase } from '../../src/lib/phrase';

const BLOB = 'https://github.com/PastelSalt/himawari-c/blob/v0.4.1';

describe('docs links', () => {
  it('maps docs files to site URLs', () => {
    expect(docUrl('docs/index.md')).toBe('/docs');
    expect(docUrl('docs/how-to/export-a-game.md')).toBe('/docs/how-to/export-a-game');
    expect(docUrl('docs/reference/index.md')).toBe('/docs/reference');
    expect(docUrl('docs/ja/index.md')).toBe('/ja/docs');
    expect(docUrl('docs/ja/tutorials/first-game.md')).toBe('/ja/docs/tutorials/first-game');
  });

  it('resolves relative links from where the file is', () => {
    expect(resolveDocHref('../how-to/x.md#step-2', 'docs/ja/index.md', BLOB)).toBe('/docs/how-to/x#step-2');
    expect(resolveDocHref('../../how-to/x.md', 'docs/ja/tutorials/first-game.md', BLOB)).toBe(
      '/docs/how-to/x',
    );
    expect(resolveDocHref('../spec/language.md', 'docs/ai-setup.md', BLOB)).toBe(`${BLOB}/spec/language.md`);
    expect(resolveDocHref('https://diataxis.fr/', 'docs/index.md', BLOB)).toBe('https://diataxis.fr/');
    expect(resolveDocHref('#top', 'docs/index.md', BLOB)).toBe('#top');
  });

  it('drops emoji but leaves code alone', () => {
    const md = '### 🌱 Tutorials\nSee [this](../index.md) 🛠️ and `[raw](x.md) 🌻`\n```\n[code](y.md) 🌻\n```';
    expect(adaptDoc(md, 'docs/how-to/a.md', BLOB)).toBe(
      '### Tutorials\nSee [this](/docs)  and `[raw](x.md) 🌻`\n```\n[code](y.md) 🌻\n```',
    );
  });
});

describe('Japanese headline phrases', () => {
  it('wraps BudouX phrases, inside tags too, and leaves English alone', () => {
    const html = phrase('物語を書いたそばから、<mark>ゲームで遊べる。</mark>', 'ja');
    expect(html).toContain('<mark><span class="ph">');
    expect(html.replace(/<[^>]+>/g, '')).toBe('物語を書いたそばから、ゲームで遊べる。');
    expect(phrase('Play it <mark>as you type.</mark>', 'en')).toBe('Play it <mark>as you type.</mark>');
  });
});
