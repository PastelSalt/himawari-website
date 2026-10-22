/**
 * The hero's Studio window (WEBSITE.md §7.2): a line types itself into the screenplay row, the game's textbox
 * follows letter by letter, then the expression changes and the next line starts. Three lines loop.
 *
 * The page arrives with the first line finished, which is what Motion OFF shows. The loop stops while the window
 * is off screen or the tab is hidden, and Motion OFF puts the first line back, finished and still.
 */
type Line = { text: string; mood: string; face: string };

const root = document.querySelector<HTMLElement>('[data-studio]');
if (root) {
  const html = document.documentElement;
  const lines = JSON.parse(root.dataset.lines ?? '[]') as Line[];
  const speaker = root.dataset.speaker ?? '';
  const el = (k: string) => root.querySelector<HTMLElement>(`[data-${k}]`)!;
  const [typed, said, chip, face, tag, char] = ['typed', 'said', 'chip', 'face', 'tag', 'char'].map(el) as [
    HTMLElement,
    HTMLElement,
    HTMLElement,
    HTMLElement,
    HTMLElement,
    HTMLElement,
  ];
  const TYPE_MS = 42;
  const HOLD_MS = 1700;

  let li = 0;
  let n = lines[0]?.text.length ?? 0;
  let timer = 0;
  let visible = true;
  const running = () => html.dataset.motion === 'on' && visible && !document.hidden;

  const show = () => {
    const t = [...lines[li]!.text].slice(0, n).join('');
    typed.textContent = t;
    said.textContent = t;
  };
  const setMood = (bump: boolean) => {
    const l = lines[li]!;
    chip.textContent = l.mood;
    face.textContent = l.face;
    tag.textContent = `${speaker} · ${l.mood}`;
    if (bump)
      char.animate([{ transform: 'translateY(-6px)' }, { transform: 'none' }], {
        duration: 220,
        easing: 'ease-out',
      });
  };

  function tick() {
    timer = 0;
    if (!running()) return;
    const len = [...lines[li]!.text].length;
    if (n < len) {
      n++;
      show();
      timer = window.setTimeout(tick, TYPE_MS);
      return;
    }
    timer = window.setTimeout(() => {
      timer = 0;
      if (!running()) return;
      li = (li + 1) % lines.length;
      n = 0;
      setMood(true);
      show();
      tick();
    }, HOLD_MS);
  }
  const start = () => {
    if (!timer && running()) tick();
  };
  const stop = () => {
    clearTimeout(timer);
    timer = 0;
  };

  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) start();
    else stop();
  }).observe(root);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  window.addEventListener('hws:motion', (e) => {
    stop();
    if ((e as CustomEvent).detail === 'on') return start();
    li = 0;
    n = [...lines[0]!.text].length;
    setMood(false);
    show();
  });
}
