/** Asserts every text pair in WEBSITE.md §6.2 meets WCAG AA (4.5:1 text, 3:1 large text and UI). */
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/tokens.css', 'utf8');
const token = (name: string): string => {
  const m = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6}|var\\(--([\\w-]+)\\))`).exec(css);
  if (!m) throw new Error(`token --${name} not found`);
  return m[2] ? token(m[2]) : m[1]!;
};
const lum = (hex: string) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};
const PAIRS: [string, string, number, string][] = [
  ['ink', 'paper', 4.5, 'headings'],
  ['text', 'paper', 4.5, 'body text'],
  ['gray-600', 'paper', 4.5, 'secondary text, navigation'],
  ['gray-500', 'paper', 4.5, 'dates and captions'],
  ['ink', 'white', 4.5, 'card headings'],
  ['text', 'white', 4.5, 'card text'],
  ['gray-600', 'white', 4.5, 'table headers, code strings'],
  ['gray-500', 'white', 4.5, 'captions on cards'],
  ['gray-600', 'sun-wash', 4.5, 'window title bars'],
  ['ink', 'sun-wash', 4.5, 'inline code, the active screenplay row'],
  ['black', 'sun', 4.5, 'buttons and the news bar'],
  ['black', 'sun-deep', 4.5, 'buttons on hover'],
  ['black', 'sun-wash', 4.5, 'wide pale buttons'],
  ['sun', 'black', 4.5, 'the coming-soon headline and pill'],
  ['band-text', 'black', 4.5, 'coming-soon text'],
  ['band-strong', 'black', 4.5, 'coming-soon strong text'],
  ['line-strong', 'paper', 3, 'pill outlines and thin control borders (UI)'],
];
let bad = 0;
for (const [fg, bg, min, use] of PAIRS) {
  const r = ratio(token(fg), token(bg));
  const ok = r >= min;
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} ${fg} on ${bg}: ${r.toFixed(2)} (min ${min}): ${use}`);
}
if (bad) process.exit(1);
