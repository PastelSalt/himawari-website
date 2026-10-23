/** Password hashing and policy, as on the Kotoha fan site (lib/password.js). */
import { createHash } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';

// OWASP baseline for Argon2id (the library's default algorithm): 19 MiB, 2 iterations, 1 lane.
const ARGON2_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(storedHash: string, plain: string): Promise<boolean> {
  try {
    return await verify(storedHash, plain);
  } catch {
    return false;
  }
}

// Used for unknown usernames so the response time doesn't reveal whether an account exists.
let dummyHash: Promise<string> | undefined;
export async function burnVerifyTime(plain: string): Promise<void> {
  dummyHash ??= hashPassword('dummy-password-for-timing-only');
  await verifyPassword(await dummyHash, plain);
}

// Words that make a password guessable for this site. A password is rejected when its letters consist ONLY of
// these words (e.g. "HimawariStudio2026!"), not when it merely contains one.
const GUESSABLE_WORDS = [
  'himawari',
  'studio',
  'sunflower',
  'moeko',
  'works',
  'moekoworks',
  'pastel',
  'salt',
  'pastelsalt',
  'hana',
  'novel',
  'visual',
  'password',
  'passwd',
  'admin',
  'owner',
  'qwerty',
  'letmein',
  'welcome',
  'iloveyou',
  'abc',
  'love',
  'pass',
  'secret',
  'login',
];

function onlyGuessableWords(letters: string): boolean {
  if (!letters) return true;
  // word-break DP: can `letters` be split entirely into GUESSABLE_WORDS?
  const ok = new Array<boolean>(letters.length + 1).fill(false);
  ok[0] = true;
  for (let i = 1; i <= letters.length; i++) {
    for (const w of GUESSABLE_WORDS) {
      if (w.length <= i && ok[i - w.length] && letters.slice(i - w.length, i) === w) {
        ok[i] = true;
        break;
      }
    }
  }
  return ok[letters.length]!;
}

export type PolicyRule =
  'min_length' | 'max_length' | 'contains_username' | 'same_as_current' | 'guessable' | 'leaked';

/** The rules a new password fails; empty when it's acceptable. */
export function checkPasswordPolicy(
  plain: string,
  { username = '', currentPassword = '' }: { username?: string; currentPassword?: string } = {},
): PolicyRule[] {
  const failed: PolicyRule[] = [];
  const pw = String(plain ?? '');
  if (pw.length < PASSWORD_MIN) failed.push('min_length');
  if (pw.length > PASSWORD_MAX) failed.push('max_length');
  const lower = pw.toLowerCase();
  if (username && lower.includes(username.toLowerCase())) failed.push('contains_username');
  if (currentPassword && pw === currentPassword) failed.push('same_as_current');
  if (onlyGuessableWords(lower.replace(/[^a-z]/g, ''))) failed.push('guessable');
  return failed;
}

/**
 * Have I Been Pwned's k-anonymity range check: only the first 5 hex characters of the SHA-1 leave the server.
 * true (leaked), false (not found), or null (service unreachable: the caller doesn't block on it).
 */
export async function isLeakedPassword(
  plain: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean | null> {
  const sha1 = createHash('sha1').update(String(plain)).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);
  try {
    const res = await fetchImpl(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true', 'User-Agent': 'himawari-website' },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const body = await res.text();
    return body.split('\n').some((line) => {
      const [hashSuffix, count] = line.trim().split(':');
      return hashSuffix === suffix && Number(count) > 0;
    });
  } catch {
    return null;
  }
}
