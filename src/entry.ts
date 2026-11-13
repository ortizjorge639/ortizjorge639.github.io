export const ENTRY_HOLD_MS = 1100;
export const ENTRY_REVEAL_MS = 320;
const FONT_BUDGET_MS = 1600;

export function setupEntry(options: {
  home: boolean;
  reducedMotion: MediaQueryList;
  onReveal: () => void;
  onComplete: () => void;
}) {
  const cover = document.querySelector<HTMLElement>('#entry-screen')!;
  const app = document.querySelector<HTMLElement>('#app')!;
  let ready = false;
  let revealing = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let fade: Animation | undefined;
  const painted = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

  async function reveal(immediate = false) {
    if (revealing || !ready) return;
    revealing = true;
    clearTimeout(timer);
    options.onReveal();
    await painted();
    document.documentElement.dataset.appReady = 'true';
    cover.dataset.phase = 'revealing';
    if (!immediate && !options.reducedMotion.matches) {
      fade = cover.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: ENTRY_REVEAL_MS, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards',
      });
      await fade.finished.catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) throw error;
      });
    }
    cover.hidden = true;
    cover.dataset.phase = 'done';
    document.documentElement.dataset.entryComplete = 'true';
    app.inert = false;
    fade?.cancel();
    options.onComplete();
  }

  async function prepare() {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const fontsReady = document.fonts.ready.then(() => true);
    const loaded = await Promise.race([
      fontsReady,
      new Promise<false>((resolve) => { timeout = setTimeout(() => resolve(false), FONT_BUDGET_MS); }),
    ]);
    clearTimeout(timeout);
    if (!loaded) {
      // Keep the chosen fallback for this document so late web fonts cannot reflow it.
      document.documentElement.dataset.fontFallback = 'true';
      console.warn('Studio fonts exceeded the entry budget; using stable system fallbacks.');
    }
    await painted();
    ready = true;
    document.querySelector('#entry-message')!.textContent = 'Opening studio…';
    document.querySelector<HTMLElement>('#entry-reload')!.hidden = true;
    cover.dataset.phase = 'holding';
    if (!options.home || options.reducedMotion.matches) void reveal(true);
    else timer = setTimeout(() => void reveal(), ENTRY_HOLD_MS);
  }

  options.reducedMotion.addEventListener('change', () => {
    if (!options.reducedMotion.matches) return;
    fade?.cancel();
    void reveal(true);
  });
  void prepare();
}
