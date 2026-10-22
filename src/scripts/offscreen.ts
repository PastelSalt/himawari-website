/**
 * Looping decoration pauses while its zone is scrolled out of view (Aqua's offscreen.ts): zones get
 * [data-offscreen] and motion.css pauses every loop inside. Nothing visible changes.
 */
const ZONES = '.hero, .news, .ornament, .soon, .foot-zone, .page-head, .lost';

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) delete el.dataset.offscreen;
        else el.dataset.offscreen = '';
      }
    },
    { rootMargin: '120px 0px' },
  );
  document.querySelectorAll<HTMLElement>(ZONES).forEach((z) => io.observe(z));
}
