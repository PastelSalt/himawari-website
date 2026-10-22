/**
 * The download button stays current by itself (WEBSITE.md §9.4). Reads the latest release of the engine and
 * writes src/data/release.json (version, date, installer URL, size, SHA-256, download count), then copies the
 * screenshots from that release's tagged source into src/assets/shots. Runs before every build.
 *
 * If GitHub can't be reached, the committed files stay as they are and the build goes on with the last known
 * values. GITHUB_TOKEN is optional; it only raises the API rate limit on shared build machines.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const REPO = 'PastelSalt/himawari-c';
const OUT = 'src/data/release.json';
const SHOTS_DIR = 'src/assets/shots';
const SHOTS = ['studio.png', 'ui-designer.png', 'welcome.png'];
const INSTALLER = /^Himawari-Studio-Setup-.*\.exe$/;

type Asset = {
  name: string;
  size: number;
  digest?: string | null;
  download_count: number;
  browser_download_url: string;
};
type Release = { tag_name: string; name: string; html_url: string; published_at: string; assets: Asset[] };

const headers: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'himawari-website-build',
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function get(url: string): Promise<Response> {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res;
}

async function main() {
  const r = (await (await get(`https://api.github.com/repos/${REPO}/releases/latest`)).json()) as Release;
  const exe = r.assets.find((a) => INSTALLER.test(a.name));
  if (!exe) throw new Error(`release ${r.tag_name} has no installer asset`);
  const sha256 = exe.digest?.startsWith('sha256:') ? exe.digest.slice(7) : null;
  const release = {
    tag: r.tag_name,
    version: r.tag_name.replace(/^v/, ''),
    name: r.name,
    publishedAt: r.published_at,
    notesUrl: r.html_url,
    installer: {
      name: exe.name,
      url: exe.browser_download_url,
      bytes: exe.size,
      sha256,
      downloads: exe.download_count,
    },
  };

  mkdirSync(SHOTS_DIR, { recursive: true });
  for (const f of SHOTS) {
    const res = await get(`https://raw.githubusercontent.com/${REPO}/${r.tag_name}/docs/images/${f}`);
    writeFileSync(`${SHOTS_DIR}/${f}`, Buffer.from(await res.arrayBuffer()));
  }

  const before = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  const after = JSON.stringify(release, null, 2) + '\n';
  if (before !== after) writeFileSync(OUT, after);
  console.log(
    `release: ${release.version} (${release.publishedAt.slice(0, 10)}), ${SHOTS.length} screenshots`,
  );
}

main().catch((e: unknown) => {
  if (!existsSync(OUT)) {
    console.error('release: GitHub unreachable and no last known release; cannot build', e);
    process.exit(1);
  }
  console.warn(`release: GitHub unreachable, keeping the last known values (${String(e)})`);
});
