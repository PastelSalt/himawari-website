/**
 * Reveals (WEBSITE.md §7.2, Aqua's reveal.ts pattern): cards and feature rows rise into place and section titles
 * pop in letter by letter as they arrive. Anything already on screen when the page loads stays put, so nothing
 * flashes. Motion ON only; the hooks come off once each has played.
 */
const html = document.documentElement;

if (html.dataset.motion === 'on' && 'IntersectionObserver' in window) {
  const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal, .sec-title'));
  // No getBoundingClientRect at load: the observer's first report says whether each element is on screen.
  const seen = new WeakSet<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        const title = el.classList.contains('sec-title');
        if (!seen.has(el)) {
          seen.add(el);
          if (e.isIntersecting) io.unobserve(el);
          else el.dataset[title ? 'pop' : 'reveal'] = '';
          continue;
        }
        if (!e.isIntersecting) continue;
        io.unobserve(el);
        el.classList.add(title ? 'is-pop' : 'is-in');
        const last = title ? el.querySelector('.sec-title__l:last-child') : el;
        last?.addEventListener(
          'animationend',
          () => {
            delete el.dataset.reveal;
            delete el.dataset.pop;
            el.classList.remove('is-in', 'is-pop');
          },
          { once: true },
        );
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  els.forEach((el) => io.observe(el));
  // switching Motion off shows everything at once
  window.addEventListener('hws:motion', (e) => {
    if ((e as CustomEvent).detail !== 'off') return;
    io.disconnect();
    for (const el of els) {
      delete el.dataset.reveal;
      delete el.dataset.pop;
    }
  });
}
