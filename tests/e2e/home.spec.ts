import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';

test.describe('home', () => {
  test('says what Himawari is and offers the current installer', async ({ page, errors }) => {
    void errors;
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('play it as you type');
    const dl = page.getByRole('link', { name: 'Download for Windows' }).first();
    await expect(dl).toHaveAttribute(
      'href',
      /releases\/download\/v[\d.]+\/Himawari-Studio-Setup-[\d.]+\.exe$/,
    );
    await expect(page.locator('#hero-meta')).toContainText(/\d+\.\d+\.\d+.*\d{4}.*MB/);
  });

  test('has no serious accessibility problems', async ({ page, errors }) => {
    void errors;
    await page.goto('/');
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`).join('\n'),
    ).toEqual([]);
  });

  test('sets no cookies', async ({ page, context, errors }) => {
    void errors;
    await page.goto('/');
    await page.getByRole('button', { name: /MOTION/ }).click();
    expect(await context.cookies()).toEqual([]);
  });

  test('Motion follows the system, and the switch is saved', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
    const sw = page.getByRole('button', { name: /MOTION/ });
    await expect(sw).toHaveAttribute('aria-pressed', 'false');
    await sw.click();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
    await ctx.close();
  });

  test('fits a phone with no sideways scrolling', async ({ page, errors }) => {
    void errors;
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe('motion', () => {
  test('the hero types the next line with Motion on, and holds still with it off', async ({
    page,
    errors,
  }) => {
    void errors;
    await page.goto('/');
    const typed = page.locator('[data-typed]');
    const first = await typed.textContent();
    await expect(typed).not.toHaveText(first!, { timeout: 6000 });
    await page.getByRole('button', { name: /MOTION/ }).click();
    await expect(typed).toHaveText(first!);
  });

  test('the Japanese home page says what Himawari is, in Japanese', async ({ page, errors }) => {
    void errors;
    await page.goto('/ja');
    await expect(page.locator('h1')).toContainText('ゲームで遊べる');
    await expect(page.getByRole('link', { name: 'Windows 版をダウンロード' }).first()).toHaveAttribute(
      'href',
      /Himawari-Studio-Setup-[\d.]+\.exe$/,
    );
  });
});
