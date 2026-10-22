import { fileURLToPath } from 'node:url';
import { defineConfig, envField, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

const SITE = process.env.SITE_URL ?? 'https://himawari-moekoworks.vercel.app';

export default defineConfig({
  site: SITE,
  output: 'static', // everything prerendered unless a route sets prerender = false
  adapter: vercel({
    // Vercel image optimizer stays OFF. Astro + sharp handle images at build.
    maxDuration: 30,
  }),
  integrations: [
    preact(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
      i18n: { defaultLocale: 'en', locales: { en: 'en', ja: 'ja' } },
    }),
  ],
  trailingSlash: 'never',
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  security: { checkOrigin: true },
  image: { responsiveStyles: true },
  // docs code blocks stay plain: ink on white passes contrast; the default dark theme's colors don't
  markdown: { syntaxHighlight: false },
  // Fredoka is inlined + preloaded by <Font>. Zen Maru Gothic ships ~120 unicode-range slices per weight, so its
  // @font-face CSS is served once from /fonts/jp.css (cached, loaded without blocking render) instead of being
  // inlined into every page. Weights are trimmed to what the design uses.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Fredoka',
      cssVariable: '--font-fredoka',
      weights: [400, 500, 600, 700],
    },
    {
      provider: fontProviders.google(),
      name: 'Zen Maru Gothic',
      cssVariable: '--font-maru',
      weights: [500, 700],
      subsets: ['latin', 'japanese'],
    },
  ],
  env: {
    schema: {
      DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      DATABASE_URL_UNPOOLED: envField.string({ context: 'server', access: 'secret', optional: true }),
      CRON_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      DISCORD_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: {
    build: { cssMinify: 'lightningcss' },
    // see src/stubs/empty.js: keeps the build-only bundler out of the serverless function (as in Aqua)
    resolve: { alias: { rolldown: fileURLToPath(new URL('./src/stubs/empty.js', import.meta.url)) } },
  },
});
