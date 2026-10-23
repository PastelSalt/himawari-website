/**
 * Site-wide behaviour, loaded once per page: the Motion switch, the phone menu, the Japanese font stylesheet,
 * reveals, off-screen pausing, the download confetti, and the cookieless visit count.
 * The pre-paint script in Base.astro has already set html[data-motion]; this keeps the button in step with it.
 */
import './reveal';
import './offscreen';
import './confetti';

const KEY = 'hws:prefs';
const html = document.documentElement;

function readPrefs(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}
function savePrefs(patch: Record<string, unknown>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readPrefs(), ...patch }));
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
}

// ---- Motion ON / OFF (WEBSITE.md §7.1)
const toggle = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
const text = toggle?.querySelector<HTMLElement>('[data-motion-text]');
function showMotion() {
  const on = html.dataset.motion === 'on';
  toggle?.setAttribute('aria-pressed', String(on));
  if (toggle && text) text.textContent = (on ? toggle.dataset.on : toggle.dataset.off) ?? '';
}
showMotion();
toggle?.addEventListener('click', () => {
  const next = html.dataset.motion === 'on' ? 'off' : 'on';
  html.dataset.motion = next;
  savePrefs({ motion: next });
  showMotion();
  window.dispatchEvent(new CustomEvent('hws:motion', { detail: next }));
});

// ---- the phone menu closes when a section is chosen
const menu = document.getElementById('menu');
for (const a of document.querySelectorAll('[data-menu-link]'))
  a.addEventListener('click', () => menu?.hidePopover?.());

// ---- the panels under the navigation (NavPanel.astro): CSS opens them on hover and focus. Escape closes the one
// that's open (content shown on hover must be dismissible, WCAG 1.4.13), and so does choosing a link in it. It can
// open again once the pointer or focus has left.
const items = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-item]'));
const dismiss = (item: HTMLElement, refocus: boolean) => {
  item.classList.add('is-dismissed');
  if (refocus && item.contains(document.activeElement))
    item.querySelector<HTMLElement>('.nav__link')?.focus();
};
for (const item of items) {
  const reset = () => item.classList.remove('is-dismissed');
  item.addEventListener('pointerleave', reset);
  item.addEventListener('focusout', (e) => {
    if (!item.contains(e.relatedTarget as Node | null)) reset();
  });
  for (const a of item.querySelectorAll('[data-panel-link]'))
    a.addEventListener('click', () => {
      dismiss(item, false);
      (document.activeElement as HTMLElement | null)?.blur();
    });
}
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  // the one keyboard focus is in, else the one under the pointer
  const open =
    items.find((i) => i.contains(document.activeElement)) ?? items.find((i) => i.matches(':hover'));
  if (open) dismiss(open, true);
});

// ---- a link to one question (#faq-3) opens it
const openAsked = () => {
  const el = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  if (el instanceof HTMLDetailsElement) el.open = true;
};
openAsked();
window.addEventListener('hashchange', openAsked);

// ---- Zen Maru Gothic: loaded without blocking the first paint
for (const l of document.querySelectorAll<HTMLLinkElement>('link[data-jp-fonts]')) l.media = 'all';

// ---- Cookieless visit count (WEBSITE.md §9.3, described on /privacy): the page's path and language, and the
// referring site's host name only. Nothing is sent when the browser asks not to be tracked, or off HTTPS (local
// builds and tests).
const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
if (location.protocol === 'https:' && !nav.globalPrivacyControl && nav.doNotTrack !== '1') {
  let r: string | undefined;
  try {
    const h = document.referrer ? new URL(document.referrer).hostname : '';
    if (h && h !== location.hostname) r = h;
  } catch {
    /* no usable referrer */
  }
  const l = html.lang === 'ja' ? 'ja' : 'en';
  navigator.sendBeacon?.('/api/track', JSON.stringify({ p: location.pathname, l, r }));
}
