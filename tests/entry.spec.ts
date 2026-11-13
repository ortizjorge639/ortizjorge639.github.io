import { test, expect, type Page } from '@playwright/test';

async function instrumentSound(page: Page, blocked = false) {
  await page.addInitScript(({ blocked }) => {
    const notes: { type: string; start: number; stop?: number; frequencies: number[] }[] = [];
    const gains: number[] = [];
    Object.assign(window, { entryAudio: { notes, gains, resumes: 0 } });
    class Param {
      constructor(private values: number[] = []) {}
      setValueAtTime(value: number) { this.values.push(value); }
      linearRampToValueAtTime(value: number) { this.values.push(value); }
      exponentialRampToValueAtTime(value: number) { this.values.push(value); }
    }
    let resumed = !blocked;
    let activated = false;
    for (const name of ['pointerdown', 'keydown']) document.addEventListener(name, (event) => {
      if (event.isTrusted) activated = true;
    }, { capture: true });
    class TestContext extends EventTarget {
      private epoch = performance.now();
      get currentTime() { return resumed ? (performance.now() - this.epoch) / 1000 : 0; }
      destination = {};
      get state() { return resumed ? 'running' : 'suspended'; }
      resume() {
        if (blocked && !activated) return new Promise<void>(() => {});
        if (!resumed) this.epoch = performance.now();
        resumed = true;
        this.dispatchEvent(new Event('statechange'));
        return Promise.resolve();
      }
      createGain() {
        return { gain: new Param(gains), connect() { return this; }, disconnect() {} };
      }
      createOscillator() {
        const note = { type: '', start: -1, stop: undefined as number | undefined, frequencies: [] as number[] };
        const oscillator = { type: '', frequency: new Param(note.frequencies),
          connect(node: unknown) { return node; }, disconnect() {}, onended: null,
          start(time: number) { note.type = this.type; note.start = time; notes.push(note); },
          stop(time = 0) { note.stop = time; },
        };
        return oscillator;
      }
    }
    Object.defineProperty(window, 'AudioContext', { value: TestContext, configurable: true });
  }, { blocked });
}
const sound = (page: Page) => page.evaluate(() =>
  (window as unknown as { entryAudio: { notes: { type: string; start: number; stop: number; frequencies: number[] }[]; gains: number[] } }).entryAudio);

test('button-free spinning splash reveals before any audio and repeats on home reload', async ({ page }) => {
  await instrumentSound(page);
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto('/');
  await page.clock.runFor(100);
  await expect(page.locator('#entry-screen')).toHaveAttribute('data-phase', 'holding');
  await expect(page.locator('#entry-screen')).toBeVisible();
  expect(await page.locator('#entry-screen').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(49, 87, 188)');
  await expect(page.locator('#entry-screen button')).toHaveCount(0);
  await expect(page.locator('.entry-frog')).toHaveCSS('animation-name', 'entry-spin');
  expect((await sound(page)).notes).toHaveLength(0);
  await page.clock.runFor(800);
  await expect(page.locator('#entry-screen')).toBeVisible();
  expect((await sound(page)).notes).toHaveLength(0);
  await page.clock.runFor(400);
  await expect(page.locator('#entry-screen')).toHaveAttribute('data-phase', 'revealing');
  expect((await sound(page)).notes).toHaveLength(0);
  await page.clock.runFor(400);
  await expect(page.locator('#entry-screen')).toBeHidden();
  await expect(page.locator('.studio-app')).toHaveAttribute('data-screen', 'home');
  await page.reload();
  await page.clock.runFor(100);
  await expect(page.locator('#entry-screen')).toBeVisible();
  expect((await sound(page)).notes).toHaveLength(0);
  await page.clock.runFor(1600);
  await expect(page.locator('#entry-screen')).toBeHidden();
});

test('entry jingle has four square notes followed by two stepped ribbit syllables, once only', async ({ page }) => {
  await instrumentSound(page);
  await page.goto('/');
  await expect(page.locator('#entry-screen')).toBeHidden();
  const { notes } = await sound(page);
  expect(notes).toHaveLength(6);
  expect(notes.every(note => note.type === 'square')).toBe(true);
  expect(notes.slice(0, 4).map(note => note.frequencies[0])).toEqual([523.25, 659.25, 783.99, 1046.5]);
  expect(notes.slice(4).map(note => note.frequencies.length)).toEqual([9, 9]);
  expect(notes.slice(4).map(note => note.frequencies[0])).toEqual([460, 350]);
  expect(notes[4].start - notes[3].stop).toBeGreaterThanOrEqual(.25);
  expect(notes[5].start).toBeGreaterThan(notes[4].stop);
  expect(notes[5].stop).toBeLessThan(1.01);
  await page.locator('.launcher[href="#projects"]').click();
  expect((await sound(page)).notes.filter(note => note.type === 'square')).toHaveLength(6);
  await page.reload();
  expect((await sound(page)).notes.filter(note => note.type === 'square')).toHaveLength(0);
  await page.goto('/#home');
  await page.reload();
  await expect(page.locator('#entry-screen')).toBeHidden();
  expect((await sound(page)).notes.filter(note => note.type === 'square')).toHaveLength(6);
});

test('blocked autoplay waits for interaction without blocking entry or queuing duplicate jingles', async ({ page }) => {
  await instrumentSound(page, true);
  await page.goto('/');
  await expect(page.locator('#entry-screen')).toBeHidden();
  expect((await sound(page)).notes).toHaveLength(0);
  await expect(page.locator('#sound-toggle')).toHaveAttribute('title', /first interaction/);
  await page.locator('.launcher[href="#projects"]').click();
  expect((await sound(page)).notes.filter(note => note.type === 'square')).toHaveLength(6);
  await page.locator('#home-button').click();
  expect((await sound(page)).notes.filter(note => note.type === 'square')).toHaveLength(6);
});

test('muting before unlock cancels the entry sound and mute silences scheduled audio', async ({ page }) => {
  await instrumentSound(page, true);
  await page.goto('/');
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.locator('#sound-toggle').click();
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('.launcher[href="#projects"]').click();
  expect((await sound(page)).notes).toHaveLength(0);
  await page.locator('#sound-toggle').click();
  expect((await sound(page)).notes.filter(note => note.type === 'square')).toHaveLength(0);
  await page.goto('/');
  await page.reload();
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.locator('.launcher[href="#projects"]').click();
  await page.locator('#sound-toggle').click();
  expect((await sound(page)).notes.filter(note => note.type === 'square').every(note => note.stop === 0)).toBe(true);
  expect((await sound(page)).gains.at(-1)).toBe(0);
});

test('blue is styled before JavaScript and remains until CSS and fonts settle', async ({ page }) => {
  let release: (() => void) | undefined;
  const hold = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/assets/*.js', async (route) => { await hold; await route.continue(); });
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#entry-screen')).toBeVisible();
  expect(await page.locator('#entry-screen').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(49, 87, 188)');
  await expect(page.locator('#app')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('#entry-reload')).toBeHidden();
  release!();
  await expect(page.locator('#entry-screen')).toBeHidden({ timeout: 7000 });
  await expect(page.locator('#app')).toHaveCSS('visibility', 'visible');
});

test('late web fonts use a stable fallback instead of swapping after reveal', async ({ page }) => {
  let release: (() => void) | undefined;
  const hold = new Promise<void>((resolve) => { release = resolve; });
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({
    contentType: 'text/css', body: "@font-face {font-family: 'VT323'; src: url('https://fonts.gstatic.com/entry-test.woff2') format('woff2'); font-display: swap;}",
  }));
  await page.route('https://fonts.gstatic.com/**', async (route) => { await hold; await route.abort(); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#entry-screen')).toBeHidden({ timeout: 7000 });
  await expect(page.locator('html')).toHaveAttribute('data-font-fallback', 'true');
  const font = await page.locator('.studio-logo').evaluate(el => getComputedStyle(el).fontFamily);
  release!();
  await expect(page.locator('.studio-logo')).toHaveCSS('font-family', font);
});

test('reduced motion skips the blue delay while sound remains an independent preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await instrumentSound(page);
  await page.goto('/');
  await expect(page.locator('#entry-screen')).toBeHidden();
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'true');
  expect((await sound(page)).notes).toHaveLength(6);
});

test('greeting starts at the audio-clock ribbit, not while the jingle plays', async ({ page }) => {
  await instrumentSound(page);
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto('/');
  await page.clock.runFor(1600);
  await expect(page.locator('#entry-screen')).toBeHidden();
  const notes = (await sound(page)).notes;
  expect(notes).toHaveLength(6);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'rest');
  await page.clock.runFor(400);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'rest');
  await page.clock.runFor(300);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', /crouch|leap/);
  await page.clock.runFor(300);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'wave');
});

test('autoplay-delayed ribbit carries its greeting across navigation and mute cancels the cue', async ({ page }) => {
  await instrumentSound(page, true);
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto('/');
  await page.clock.runFor(1600);
  expect((await sound(page)).notes).toHaveLength(0);
  await page.locator('.launcher[href="#projects"]').click();
  await page.clock.runFor(450);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'rest');
  await page.clock.runFor(250);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', /crouch|leap/);
  await page.clock.runFor(650);
  await page.goto('/');
  await page.reload();
  await page.clock.runFor(1600);
  await page.locator('.launcher[href="#projects"]').click();
  await page.locator('#sound-toggle').click();
  await page.clock.runFor(750);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'rest');
});
