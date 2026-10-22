/**
 * Discord webhook alerts (Aqua's alerts.ts): errors and cron failures. Best effort, and never with visitor data:
 * Discord is a third party.
 */
export async function sendAlert(webhook: string | undefined, content: string): Promise<void> {
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.slice(0, 1900), allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* alerts are best-effort */
  }
}
