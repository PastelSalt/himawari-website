# Himawari website

The public website for [Himawari](https://github.com/PastelSalt/himawari-c), the free, open-source visual novel engine and editor by Moeko Works, in English (`/`) and Japanese (`/ja`). The plan is `planning/WEBSITE.md` in the engine repository, and the look is its approved mockup in `planning/website-mockup/`.

Astro, static first, with plain CSS, on Vercel (`sin1`), with a Neon database for cookieless visit counts. It sets no cookies and makes no third-party requests.

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

`build` does five things:

1. Reads the engine's latest release into `src/data/release.json`: the version, date, installer size, SHA-256, and every earlier version.
2. Copies that release's screenshots into `src/assets/shots` and its `docs/` folder into `src/content/docs`, with the docs' links turned into site URLs. If GitHub can't be reached, the last known files stay.
3. Applies the database migrations, when `DATABASE_URL_UNPOOLED` is set. On Vercel each preview has its own Neon branch.
4. Type-checks and builds.
5. Writes the hashes of the inline scripts into the content security policy in `vercel.json`.

| Command               | What it does                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`        | ESLint and Prettier                                                                                                                                                            |
| `npm run contrast`    | Checks every text color pair in `src/styles/tokens.css` against WCAG AA                                                                                                        |
| `npm test`            | Unit tests, and the visit counter against PGlite with the real migrations                                                                                                      |
| `npm run budget`      | Checks each page loads under 40 KB of JavaScript (gzip), after a build                                                                                                         |
| `npm run test:e2e`    | Playwright with axe on every page of the built site, served with the `vercel.json` headers: no errors, no CSP violations, no third-party requests, no cookies, no broken links |
| `npm run preview`     | Serves the built site the same way, at http://localhost:4321                                                                                                                   |
| `npm run og`          | Remakes the share images and icons in `public/`; commit what it writes                                                                                                         |
| `npm run db:generate` | Writes a migration after a change to `src/server/db/schema.ts`                                                                                                                 |

## Where things are

| Path                     | What's there                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `src/pages/`             | Pages; `ja/` holds the Japanese ones. `api/` is the visit counter and the daily cron   |
| `src/components/home/`   | The home page's sections                                                               |
| `src/components/pages/`  | Download, news, privacy, about, and docs pages, shared by both languages               |
| `src/components/chrome/` | Header, navigation, news bar, footer, and the icon sprite                              |
| `src/components/ui/`     | Buttons, window frames, pill titles, flowers, icons                                    |
| `src/i18n/`              | The words, one file per language                                                       |
| `src/content/`           | News posts and the privacy and about pages in Markdown; `docs/` is copied by the build |
| `src/scripts/`           | The Motion switch, the typing hero, reveals, confetti, and the visit count             |
| `src/server/`            | The database schema, the cookieless counter, rate limits, and the daily housekeeping   |
| `src/styles/`            | Tokens, base, components, sections, and motion                                         |
| `db/migrations/`         | Database migrations (Drizzle)                                                          |
| `scripts/`               | The release reader, the migrations runner, the share images, and the checks            |

Work on `dev`; `main` deploys production. Secrets live only in Vercel and `.env.local` (see `.env.example`).

## Licenses

The Himawari and Moeko Works names and logos in `src/assets/brand/` and `public/` belong to Moeko Works and are not covered by an open license.
