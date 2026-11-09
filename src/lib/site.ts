/** Site-wide constants and the latest release (read at build by scripts/sync-release.ts). */
import release from '../data/release.json';

export const SITE_NAME = 'Himawari';
export const REPO = 'https://github.com/PastelSalt/himawari-c';
export const CONTACT_URL = 'https://moekoworks.vercel.app/contact';
export const PORTFOLIO = { name: 'Moeko Works', url: 'https://moekoworks.vercel.app' };
/**
 * The maker, for search engines. The @id is the one the Moeko Works portfolio publishes in its own JSON-LD, so
 * this site, the portfolio and the fan sites all join to one creator. Keep them in step if the portfolio changes.
 */
export const AUTHOR = {
  id: 'https://moekoworks.vercel.app/#person',
  name: 'Kyle Zoleta',
  brand: PORTFOLIO.name,
  url: PORTFOLIO.url,
  sameAs: ['https://github.com/PastelSalt', 'https://web.facebook.com/moemorimoeko/'],
};
/** Terms people search for Himawari by; used for meta keywords and the WebSite node. */
export const KEYWORDS = [
  'Himawari',
  'Himawari Studio',
  'visual novel engine',
  'visual novel maker',
  'free visual novel maker',
  'open source visual novel engine',
  'ノベルゲーム制作ツール',
  'ビジュアルノベル エンジン',
  'ノベルゲーム 作り方',
  'Windows',
  'Moeko Works',
  'Kyle Zoleta',
];

export const RELEASE = release;
export const RELEASES_URL = `${REPO}/releases`;
/** A file in the engine repository at the released tag, so links match the version people download. */
export const atTag = (path: string) => `${REPO}/blob/${release.tag}/${path}`;

export type Lang = 'en' | 'ja';

/** The page's language, from its path: /ja and everything under it is Japanese. */
export const langOf = (url: URL): Lang => (/^\/ja(\/|$)/.test(url.pathname) ? 'ja' : 'en');
/** A site path in a language: path('/download', 'ja') is /ja/download. */
export const path = (p: string, lang: Lang) => (lang === 'ja' ? (p === '/' ? '/ja' : `/ja${p}`) : p);

/** "22 October 2026" / "2026年10月22日", in Moeko Works' time zone (Manila), as on the portfolio. */
export function releaseDate(lang: Lang): string {
  const d = new Date(release.publishedAt);
  return lang === 'ja'
    ? d.toLocaleDateString('ja-JP', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : d.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
}

/** Installer size as Windows shows it (1 MB = 1024 × 1024 bytes). */
export function installerSize(): string {
  return `${Math.round(release.installer.bytes / 1024 / 1024)} MB`;
}
