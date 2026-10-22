import { test as base, expect } from '@playwright/test';

/**
 * Every test fails on uncaught errors, CSP violations, or any request that leaves the site
 * (WEBSITE.md §10: no third-party requests).
 */
export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page, baseURL }, use) => {
    const errors: string[] = [];
    const origin = new URL(baseURL!).origin;
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      const t = m.text();
      if (m.type() === 'error') errors.push(`console: ${t}`);
      if (/Content Security Policy|Refused to (execute|load|apply)/i.test(t)) errors.push(`csp: ${t}`);
    });
    page.on('request', (r) => {
      const u = r.url();
      if (!u.startsWith(origin) && !u.startsWith('data:')) errors.push(`third-party request: ${u}`);
    });
    await use(errors);
    expect(errors, errors.join('\n')).toEqual([]);
  },
});
export { expect };
