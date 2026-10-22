/**
 * Share images and icons (WEBSITE.md §6.6), the way Aqua's make-og.ts works: run by hand after the art or the
 * tagline changes, and commit what it writes.
 *
 * - public/og/home-en.png, home-ja.png (1200 × 630): the logo, the tagline, and a real Studio screenshot in a window
 *   frame, on warm paper.
 * - public/favicon.svg (the code-drawn flower), favicon-32.png, apple-touch-icon.png, icon-512.png (the logo flowers).
 *
 * Fredoka and Zen Maru Gothic (OFL) are fetched once as TTF from Google Fonts' repository into
 * node_modules/.cache/og-fonts: sharp's text renderer can't read the woff2 files the site serves.
 */
import sharp from 'sharp';
import { loadDefaultJapaneseParser } from 'budoux';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { en } from '../src/i18n/en';
import { ja } from '../src/i18n/ja';

const FONTS = 'node_modules/.cache/og-fonts';
const FONT_URLS = {
  fredoka: 'https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/Fredoka%5Bwdth,wght%5D.ttf',
  maru: 'https://raw.githubusercontent.com/google/fonts/main/ofl/zenmarugothic/ZenMaruGothic-Bold.ttf',
};
const C = {
  paper: '#fffcf2',
  sun: '#f5d57c',
  wash: '#fdf3d4',
  ink: '#2e2a33',
  gray: '#5d5869',
  black: '#1e1a24',
};

async function font(name: keyof typeof FONT_URLS): Promise<string> {
  const file = `${FONTS}/${name}.ttf`;
  if (!existsSync(file)) {
    mkdirSync(FONTS, { recursive: true });
    const res = await fetch(FONT_URLS[name]);
    if (!res.ok) throw new Error(`${res.status} for ${FONT_URLS[name]}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return file;
}

/** Japanese lines broken between BudouX phrases (as on the page), at most `max` characters each. */
const budoux = loadDefaultJapaneseParser();
function jaLines(text: string, max: number): string {
  const lines: string[] = [''];
  for (const p of budoux.parse(text)) {
    if (lines.at(-1)!.length && lines.at(-1)!.length + p.length > max) lines.push('');
    lines[lines.length - 1] += p;
  }
  return lines.join('\n');
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const flower = (fill: string, center: string) =>
  `<g stroke="${C.black}" stroke-width="5" fill="${fill}"><circle cx="50" cy="22" r="20"/><circle cx="77" cy="42" r="20"/><circle cx="67" cy="74" r="20"/><circle cx="33" cy="74" r="20"/><circle cx="23" cy="42" r="20"/></g><circle cx="50" cy="50" r="22" fill="${fill}"/><circle cx="50" cy="50" r="13" fill="${center}" stroke="${C.black}" stroke-width="5"/>`;

async function og(lang: 'en' | 'ja') {
  const copy = lang === 'ja' ? ja : en;
  const W = 1200;
  const H = 630;
  // the window frame on the right, with the screenshot inside (1584 × 921 → 520 wide)
  const win = { x: 620, y: 150, w: 528, bar: 34 };
  const shotW = win.w - 8;
  const shotH = Math.round((shotW * 921) / 1584);
  const winH = win.bar + shotH + 6;
  const frame = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${win.x + 12}" y="${win.y + 14}" width="${win.w}" height="${winH}" rx="18" fill="${C.sun}"/>
    <rect x="${win.x}" y="${win.y}" width="${win.w}" height="${winH}" rx="18" fill="#fff" stroke="${C.black}" stroke-width="4"/>
    <path d="M${win.x + 2} ${win.y + win.bar}h${win.w - 4}" stroke="${C.black}" stroke-width="3"/>
    <path d="M${win.x + 18} ${win.y + 2}h${win.w - 36}a16 16 0 0 1 16 16v${win.bar - 18}h-${win.w - 4}v-${win.bar - 18}a16 16 0 0 1 16-16z" fill="${C.wash}"/>
    ${[0, 1, 2].map((i) => `<circle cx="${win.x + 22 + i * 18}" cy="${win.y + win.bar / 2 + 1}" r="6" fill="${i ? '#fff' : C.sun}" stroke="${C.black}" stroke-width="2"/>`).join('')}
    <g transform="translate(1080 60) scale(0.7)">${flower(C.sun, '#5a5a5a')}</g>
    <g transform="translate(1040 100) scale(0.42) rotate(18 50 50)">${flower('#fff', C.sun)}</g>
    <g transform="translate(560 520) scale(0.5)">${flower('#fff', C.sun)}</g>
    <rect x="0" y="${H - 18}" width="${W}" height="18" fill="${C.black}"/>
  </svg>`;

  const shot = await sharp('src/assets/shots/studio.png').resize(shotW, shotH).png().toBuffer();
  const logo = await sharp('src/assets/brand/himawari-studio.png').resize({ width: 470 }).png().toBuffer();
  const plain = copy.hero.title.replace(/<[^>]+>/g, '');
  const fontfile = await font(lang === 'ja' ? 'maru' : 'fredoka');
  const family = lang === 'ja' ? 'Zen Maru Gothic Bold' : 'Fredoka SemiBold';
  const title = await sharp({
    text: {
      text: `<span foreground="${C.ink}">${esc(lang === 'ja' ? jaLines(plain, 9) : plain)}</span>`,
      font: `${family} 54`,
      fontfile,
      width: 520,
      spacing: lang === 'ja' ? -4 : 4,
      rgba: true,
      dpi: 72,
    },
  })
    .png()
    .toBuffer();
  // Japanese runs longer: the image keeps the lead's first sentence
  const leadText = lang === 'ja' ? jaLines(copy.hero.lead.split('。')[0] + '。', 20) : copy.hero.lead;
  const lead = await sharp({
    text: {
      text: `<span foreground="${C.gray}">${esc(leadText)}</span>`,
      font: `${family} 24`,
      fontfile,
      width: 500,
      spacing: 8,
      rgba: true,
      dpi: 72,
    },
  })
    .png()
    .toBuffer();
  const titleH = (await sharp(title).metadata()).height ?? 0;

  mkdirSync('public/og', { recursive: true });
  await sharp({ create: { width: W, height: H, channels: 4, background: C.paper } })
    .composite([
      { input: Buffer.from(frame), top: 0, left: 0 },
      { input: shot, top: win.y + win.bar + 2, left: win.x + 4 },
      { input: logo, top: 56, left: 56 },
      { input: title, top: 230, left: 60 },
      { input: lead, top: 230 + titleH + 26, left: 60 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(`public/og/home-${lang}.png`);
}

async function icons() {
  // the logo flowers, from the engine's branding at the released tag (1000 × 1000)
  const { tag } = JSON.parse(readFileSync('src/data/release.json', 'utf8')) as { tag: string };
  const res = await fetch(
    `https://raw.githubusercontent.com/PastelSalt/himawari-c/${tag}/branding/himawari-flowers.png`,
  );
  if (!res.ok) throw new Error(`${res.status} for the flowers`);
  const flowers = Buffer.from(await res.arrayBuffer());
  await sharp(flowers).resize(32, 32).png().toFile('public/favicon-32.png');
  await sharp(flowers).resize(512, 512).png({ compressionLevel: 9 }).toFile('public/icon-512.png');
  // iOS shows the icon on a square: the flowers on warm paper with a margin
  const inner = await sharp(flowers).resize(150, 150).png().toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: C.paper } })
    .composite([{ input: inner, top: 15, left: 15 }])
    .png()
    .toFile('public/apple-touch-icon.png');
  writeFileSync(
    'public/favicon.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 104 104">${flower(C.sun, '#5a5a5a')}</svg>\n`,
  );
}

await og('en');
await og('ja');
await icons();
console.log('make-og: public/og/home-en.png, home-ja.png, and the icons');
