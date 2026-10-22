/** Site-wide constants and the latest release (read at build by scripts/sync-release.ts). */
import release from '../data/release.json';

export const SITE_NAME = 'Himawari';
export const REPO = 'https://github.com/PastelSalt/himawari-c';
export const CONTACT_URL = 'https://moekoworks.vercel.app/contact';
export const PORTFOLIO = { name: 'Moeko Works', url: 'https://moekoworks.vercel.app' };

export const RELEASE = release;
export const RELEASES_URL = `${REPO}/releases`;
/** A file in the engine repository at the released tag, so links match the version people download. */
export const atTag = (path: string) => `${REPO}/blob/${release.tag}/${path}`;

export type Lang = 'en' | 'ja';

/** "22 October 2026" / "2026年10月22日", in Japan time (the owner's releases and readers are in Asia). */
export function releaseDate(lang: Lang): string {
  const d = new Date(release.publishedAt);
  return lang === 'ja'
    ? d.toLocaleDateString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : d.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
}

/** Installer size as Windows shows it (1 MB = 1024 × 1024 bytes). */
export function installerSize(): string {
  return `${Math.round(release.installer.bytes / 1024 / 1024)} MB`;
}
