import { describe, expect, it } from 'vitest';
import release from '../../src/data/release.json';
import { atTag, installerSize, releaseDate } from '../../src/lib/site';

describe('the release shown on the download button', () => {
  it('has a version, an installer, and a SHA-256', () => {
    expect(release.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(release.installer.url).toMatch(
      /^https:\/\/github\.com\/PastelSalt\/himawari-c\/releases\/download\//,
    );
    expect(release.installer.sha256 ?? '').toMatch(/^[0-9a-f]{64}$/);
  });
  it('formats the size as Windows does and the date in both languages', () => {
    expect(installerSize()).toMatch(/^\d+ MB$/);
    expect(releaseDate('en')).toMatch(/^\d{1,2} [A-Z][a-z]+ \d{4}$/);
    expect(releaseDate('ja')).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日$/);
  });
  it('links docs at the released tag', () => {
    expect(atTag('docs/index.md')).toBe(
      `https://github.com/PastelSalt/himawari-c/blob/${release.tag}/docs/index.md`,
    );
  });
});
