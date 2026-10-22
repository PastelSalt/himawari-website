# Himawari website

The public website for [Himawari](https://github.com/PastelSalt/himawari-c), the free, open-source visual novel engine and editor by Moeko Works. The plan is `planning/WEBSITE.md` in the engine repository, and the look is its approved mockup in `planning/website-mockup/`.

Astro, static first, with plain CSS, on Vercel (`sin1`). It sets no cookies and makes no third-party requests.

## Working on it

Node 24.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`build` reads the engine's latest release (version, date, installer size, SHA-256) into `src/data/release.json` and copies that release's screenshots into `src/assets/shots`. If GitHub can't be reached, it keeps the last known values. It then type-checks, builds, and writes the hashes of the inline scripts into the content security policy in `vercel.json`.

| Command            | What it checks                                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`     | ESLint and Prettier                                                                                                                                  |
| `npm run contrast` | Every text color pair in `src/styles/tokens.css` meets WCAG AA                                                                                       |
| `npm test`         | Unit tests (Vitest)                                                                                                                                  |
| `npm run budget`   | Under 40 KB of JavaScript (gzip) per page, after a build                                                                                             |
| `npm run test:e2e` | Playwright with axe against the built site, served with the `vercel.json` headers: no errors, no CSP violations, no third-party requests, no cookies |
| `npm run preview`  | Serves the built site the same way, at http://localhost:4321                                                                                         |

## Where things are

| Path                     | What's there                                              |
| ------------------------ | --------------------------------------------------------- |
| `src/pages/`             | Pages. `index.astro` is the English home page             |
| `src/components/home/`   | The home page's sections                                  |
| `src/components/chrome/` | Header, navigation, news bar, footer, and the icon sprite |
| `src/components/ui/`     | Buttons, window frames, pill titles, flowers, icons       |
| `src/i18n/`              | The words, one file per language                          |
| `src/content/news/`      | News posts, in Markdown                                   |
| `src/styles/`            | Tokens, base, components, sections, and motion            |
| `scripts/`               | The release reader and the checks                         |

Work on `dev`; `main` deploys production. Secrets live only in Vercel and `.env.local` (see `.env.example`).

## Licenses

The Himawari and Moeko Works names and logos in `src/assets/brand/` belong to Moeko Works and are not covered by an open license.
