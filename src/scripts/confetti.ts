/**
 * The download button bursts into yellow, white, and black confetti (WEBSITE.md §7.2). canvas-confetti loads on
 * the first click, so it costs nothing until then. It draws on the main thread: its default worker would need a
 * blob: URL, which the CSP doesn't allow.
 */
import type confettiType from 'canvas-confetti';

let fire: confettiType.CreateTypes | null = null;

document.addEventListener('click', async (e) => {
  const btn = (e.target as Element | null)?.closest<HTMLElement>('[data-confetti]');
  if (!btn || document.documentElement.dataset.motion !== 'on') return;
  const r = btn.getBoundingClientRect();
  if (!fire) {
    const { default: confetti } = await import('canvas-confetti');
    fire = confetti.create(undefined, { resize: true, useWorker: false });
  }
  void fire({
    particleCount: 70,
    spread: 70,
    startVelocity: 32,
    scalar: 0.9,
    ticks: 160,
    colors: ['#f5d57c', '#ffffff', '#1e1a24', '#f1cb60'],
    origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight },
  });
});
