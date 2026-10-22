/**
 * Applies db/migrations when a database is configured (WEBSITE.md §9.3). Runs in every build: with the Neon
 * integration each Vercel preview has its own database branch, so previews migrate their branch and production
 * migrates production. Without DATABASE_URL_UNPOOLED (local builds, CI) it does nothing.
 */
import { execSync } from 'node:child_process';

if (!process.env.DATABASE_URL_UNPOOLED) {
  console.log('migrate: no DATABASE_URL_UNPOOLED, skipped');
} else {
  execSync('npx drizzle-kit migrate', { stdio: 'inherit' });
}
