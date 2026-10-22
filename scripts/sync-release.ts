/**
 * The download button stays current by itself (WEBSITE.md §9.4). Reads the latest release of the engine and
 * writes src/data/release.json (version, date, installer URL, size, SHA-256, download count), then copies the
 * screenshots from that release's tagged source into src/assets/shots and its docs/ folder into src/content/docs
 * (WEBSITE.md §9.5), so the site always shows the docs of the released version. The docs' links are adapted to
 * site URLs on the way in (src/lib/doc-links.ts). Runs before every build.
 *
 * If GitHub can't be reached, the committed files stay as they are and the build goes on with the last known
 * values. GITHUB_TOKEN is optional; it only raises the API rate limit on shared build machines.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { adaptDoc } from '../src/lib/doc-links';

const REPO = 'PastelSalt/himawari-c';
const OUT = 'src/data/release.json';
const SHOTS_DIR = 'src/assets/shots';
const SHOTS = ['studio.png', 'ui-designer.png', 'welcome.png'];
const INSTALLER = /^Himawari-Studio-Setup-.*\.exe$/;
const DOCS_DIR = 'src/content/docs';

type Asset = {
  name: string;
  size: number;
  digest?: string | null;
  download_count: number;
  browser_download_url: string;
};
type Release = {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
  assets: Asset[];
};

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
  const all = (await (
    await get(`https://api.github.com/repos/${REPO}/releases?per_page=100`)
  ).json()) as Release[];
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
    /** every published release with an installer, newest first (the download page's version list) */
    history: all
      .filter((x) => !x.draft && !x.prerelease)
      .flatMap((x) => {
        const a = x.assets.find((y) => INSTALLER.test(y.name));
        return a
          ? [
              {
                version: x.tag_name.replace(/^v/, ''),
                publishedAt: x.published_at,
                notesUrl: x.html_url,
                bytes: a.size,
                url: a.browser_download_url,
              },
            ]
          : [];
      }),
  };

  const raw = (p: string) => get(`https://raw.githubusercontent.com/${REPO}/${r.tag_name}/${p}`);

  // Everything is downloaded first and written only once it has all arrived, so a failure halfway leaves the
  // last known files as they were.
  const shots = await Promise.all(
    SHOTS.map(async (f) => [f, Buffer.from(await (await raw(`docs/images/${f}`)).arrayBuffer())] as const),
  );
  // the docs at the released tag (Markdown only; they reference no images)
  const tree = (await (
    await get(`https://api.github.com/repos/${REPO}/git/trees/${r.tag_name}?recursive=1`)
  ).json()) as { tree: { path: string; type: string }[] };
  const docPaths = tree.tree.filter((t) => t.type === 'blob' && /^docs\/.+\.md$/.test(t.path));
  if (!docPaths.length) throw new Error(`no docs at ${r.tag_name}`);
  const docs = await Promise.all(
    docPaths.map(async (d) => [d.path, await (await raw(d.path)).text()] as const),
  );

  mkdirSync(SHOTS_DIR, { recursive: true });
  for (const [f, buf] of shots) writeFileSync(join(SHOTS_DIR, f), buf);
  rmSync(DOCS_DIR, { recursive: true, force: true });
  for (const [p, text] of docs) {
    const out = join(DOCS_DIR, p.slice('docs/'.length));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, adaptDoc(text, p, `https://github.com/${REPO}/blob/${r.tag_name}`));
  }

  const before = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  const after = JSON.stringify(release, null, 2) + '\n';
  if (before !== after) writeFileSync(OUT, after);
  console.log(
    `release: ${release.version} (${release.publishedAt.slice(0, 10)}), ${release.history.length} versions, ${SHOTS.length} screenshots, ${docs.length} docs`,
  );
}

main().catch((e: unknown) => {
  if (!existsSync(OUT)) {
    console.error('release: could not read the latest release, and there is no last known one', e);
    process.exit(1);
  }
  console.warn(`release: could not read the latest release, keeping the last known values (${String(e)})`);
});
