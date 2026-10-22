/**
 * Site-wide behaviour, loaded once per page: the Motion switch, the phone menu, and the Japanese font stylesheet.
 * The pre-paint script in Base.astro has already set html[data-motion]; this keeps the button in step with it.
 */
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

// ---- Zen Maru Gothic: loaded without blocking the first paint
for (const l of document.querySelectorAll<HTMLLinkElement>('link[data-jp-fonts]')) l.media = 'all';
