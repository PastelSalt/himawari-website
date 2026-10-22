import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';

/** Every built page, from dist (the site is static). */
const DIST = existsSync('dist/client') ? 'dist/client' : 'dist';
function pages(dir = DIST): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === '_astro' ? [] : pages(p);
    if (!f.endsWith('.html') || f === '404.html') return [];
    const route = p
      .slice(DIST.length)
      .replace(/\\/g, '/')
      .replace(/\/?index\.html$/, '');
    return [route || '/'];
  });
}
const ROUTES = pages();

test('the site has every page in both languages', () => {
  for (const r of ['/', '/download', '/news', '/privacy', '/about', '/docs', '/docs/tutorials/first-game'])
    expect(ROUTES, r).toContain(r);
  for (const r of ['/ja', '/ja/download', '/ja/news', '/ja/privacy', '/ja/about', '/ja/docs'])
    expect(ROUTES).toContain(r);
});

for (const route of ROUTES) {
  test(`${route}: no serious accessibility problems, and every link on the site works`, async ({
    page,
    request,
    errors,
  }) => {
    void errors;
    await page.goto(`${route}?still`);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.locator('html').getAttribute('lang')).toBe(route.startsWith('/ja') ? 'ja' : 'en');
    const sideways = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(sideways, 'no sideways scrolling').toBeLessThanOrEqual(1);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`).join('\n'),
    ).toEqual([]);

    const hrefs = await page.$$eval('a[href^="/"]', (as) => [
      ...new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!.split('#')[0]!)),
    ]);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.status(), `${route} links to ${href}`).toBe(200);
    }
  });
}

// (no error check here: the browser itself logs the 404 status)
test('an unknown address shows the 404 page', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Page not found');
});
