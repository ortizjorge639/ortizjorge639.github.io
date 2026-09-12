import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ink = (page: Page) => page.locator('#page-ink-canvas');
const snapshot = (page: Page) => ink(page).evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
const pixels = (page: Page, x: number, y: number, width = 1, height = 1) =>
  ink(page).evaluate((canvas: HTMLCanvasElement, rect) =>
    Array.from(canvas.getContext('2d')!.getImageData(rect.x, rect.y, rect.width, rect.height).data),
  { x: Math.round(x), y: Math.round(y), width, height });

async function drawingPoint(page: Page) {
  const box = (await page.locator('.title-screen').boundingBox())!;
  return { x: Math.round(box.x + 30), y: Math.round(box.y + 45) };
}

async function stroke(page: Page, x: number, y: number) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 80, y + 30, { steps: 10 });
  await page.mouse.up();
}

async function tools(page: Page) {
  if (await page.locator('#ink-panel').isHidden()) await page.locator('#ink-tools-toggle').click();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
});

test('Ink is opt-in, paints page content, survives toggling, and undoes exactly', async ({ page }) => {
  const point = await drawingPoint(page);
  const blank = await snapshot(page);
  await stroke(page, point.x, point.y);
  expect(await snapshot(page)).toBe(blank);
  await page.getByRole('button', { name: 'Enable page ink', exact: true }).click();
  await stroke(page, point.x, point.y);
  await expect(ink(page)).toHaveAttribute('data-action-count', '1');
  expect(await pixels(page, point.x, point.y)).toEqual([49, 87, 188, 255]);
  const marked = await snapshot(page);
  expect(marked).not.toBe(blank);
  await page.getByRole('button', { name: 'Disable page ink', exact: true }).click();
  await stroke(page, point.x, point.y + 80);
  expect(await snapshot(page)).toBe(marked);
  await page.getByRole('button', { name: 'Enable page ink', exact: true }).click();
  await page.getByRole('button', { name: 'Undo last ink action' }).click();
  expect(await snapshot(page)).toBe(blank);
  await expect(page.locator('#ink-undo')).toBeDisabled();
});

test('dithered paint, ink color, eraser, and undoable clear change actual pixels', async ({ page }) => {
  const point = await drawingPoint(page);
  const blank = await snapshot(page);
  await page.locator('#ink-toggle').click();
  await tools(page);
  await page.getByRole('button', { name: 'Paint', exact: true }).click();
  await page.getByRole('button', { name: 'Red ink' }).click();
  await page.mouse.click(point.x, point.y);
  const sample = await pixels(page, point.x - 4, point.y - 4, 8, 8);
  expect(sample.filter((_, i) => i % 4 === 3 && sample[i] === 255)).toHaveLength(32);
  expect(sample.filter((_, i) => i % 4 === 3 && sample[i] === 0)).toHaveLength(32);
  const firstOpaque = sample.findIndex((value, i) => i % 4 === 3 && value === 255);
  expect(sample.slice(firstOpaque - 3, firstOpaque + 1)).toEqual([212, 72, 54, 255]);
  const painted = await snapshot(page);
  await tools(page);
  await page.getByRole('button', { name: 'Eraser', exact: true }).click();
  await page.mouse.click(point.x, point.y);
  expect(await snapshot(page)).toBe(blank);
  await page.locator('#ink-undo').click();
  expect(await snapshot(page)).toBe(painted);
  await tools(page);
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  expect(await snapshot(page)).toBe(blank);
  await page.locator('#ink-undo').click();
  expect(await snapshot(page)).toBe(painted);
});

test('keyboard tools, star stamp, transparent PNG export and Escape work', async ({ page }, testInfo) => {
  await page.locator('#ink-toggle').focus();
  await page.keyboard.press('Enter');
  await page.locator('#ink-tools-toggle').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Pen', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Broad nib' }).click();
  await expect(page.getByRole('button', { name: 'Broad nib' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Star stamp' }).focus();
  await page.keyboard.press('Enter');
  await expect(ink(page)).toHaveAttribute('data-action-count', '1');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save ink' }).click();
  const exported = await download;
  expect(exported.suggestedFilename()).toBe('joji-page-ink.png');
  const stream = await exported.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const bytes = Buffer.concat(chunks);
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(bytes.readUInt32BE(16)).toBe(await ink(page).evaluate((canvas: HTMLCanvasElement) => canvas.width));
  expect(await pixels(page, 0, 0)).toEqual([0, 0, 0, 0]);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-ink-tools.png` });
  await page.keyboard.press('Escape');
  await expect(page.locator('#ink-panel')).toBeHidden();
  await expect(page.locator('#ink-tools-toggle')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#ink-toggle')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#ink-toggle')).toBeFocused();
});

test('hover is optional and never paints controls, drags from controls, or dialogs', async ({ page }) => {
  const point = await drawingPoint(page);
  const blank = await snapshot(page);
  await page.locator('#ink-toggle').click();
  await page.mouse.move(point.x, point.y);
  await page.mouse.move(point.x + 80, point.y + 30, { steps: 10 });
  expect(await snapshot(page)).toBe(blank);
  await tools(page);
  await page.getByRole('switch', { name: /Paint on hover/ }).check();
  await page.mouse.move(point.x, point.y);
  await page.mouse.move(point.x + 80, point.y + 30, { steps: 10 });
  await page.locator('#ink-tools-toggle').hover();
  expect(await snapshot(page)).not.toBe(blank);
  await tools(page);
  await page.getByRole('switch', { name: /Paint on hover/ }).uncheck();
  await page.locator('#ink-close-panel').click();
  const marks = await ink(page).getAttribute('data-action-count');
  await page.locator('#next').scrollIntoViewIfNeeded();
  const next = (await page.locator('#next').boundingBox())!;
  await page.mouse.move(next.x + next.width / 2, next.y + next.height / 2);
  await page.mouse.down();
  await page.mouse.move(5, 120, { steps: 5 });
  await page.mouse.up();
  await expect(ink(page)).toHaveAttribute('data-action-count', marks!);
  await page.locator('#next').click();
  await expect(page.locator('.feature-caption h2')).toHaveText('After the meeting');
  await page.getByRole('button', { name: 'Read about After the meeting' }).click();
  await expect(page.locator('#project-dialog')).toBeVisible();
  const beforeDialog = await snapshot(page);
  const dialog = (await page.locator('#project-dialog').boundingBox())!;
  await stroke(page, dialog.x + 20, dialog.y + 80);
  expect(await snapshot(page)).toBe(beforeDialog);
  await page.keyboard.press('Escape');
  await expect(page.locator('#ink-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Gaming', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await expect(ink(page)).toHaveAttribute('data-action-count', marks!);
});

test('ink stays in document coordinates after scroll, reflow and resize without growing the page', async ({ page }) => {
  const point = await drawingPoint(page);
  await page.locator('#ink-toggle').click();
  await stroke(page, point.x, point.y);
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
  expect(await pixels(page, point.x, point.y)).toEqual([49, 87, 188, 255]);
  expect(await ink(page).evaluate((canvas) => canvas.getBoundingClientRect().top)).toBe(-300);
  await page.setViewportSize({ width: 375, height: 900 });
  await expect.poll(() => ink(page).evaluate((canvas: HTMLCanvasElement) => canvas.width)).toBe(375);
  expect(await pixels(page, point.x, point.y)).toEqual([49, 87, 188, 255]);
  await page.getByRole('button', { name: 'Gaming', exact: true }).click();
  await expect.poll(() => page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#page-ink-canvas')!;
    const app = document.querySelector<HTMLElement>('#app')!;
    return canvas.height === Math.ceil(Math.max(innerHeight, app.getBoundingClientRect().bottom + scrollY));
  })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= Math.ceil(document.querySelector('#app')!.getBoundingClientRect().bottom + scrollY) + 1)).toBe(true);
  await page.locator('#ink-undo').click();
  expect(await pixels(page, point.x, point.y)).toEqual([0, 0, 0, 0]);
});

test('drawing creates real audio nodes after a gesture and explicit mute survives Ink toggles', async ({ page }) => {
  await page.evaluate(() => {
    const original = AudioContext.prototype.createBufferSource;
    document.documentElement.dataset.drawingSounds = '0';
    AudioContext.prototype.createBufferSource = function () {
      document.documentElement.dataset.drawingSounds = String(Number(document.documentElement.dataset.drawingSounds) + 1);
      return original.call(this);
    };
  });
  const point = await drawingPoint(page);
  expect(await page.locator('html').getAttribute('data-drawing-sounds')).toBe('0');
  await page.locator('#ink-toggle').click();
  await expect(page.locator('#ink-sound')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'true');
  await stroke(page, point.x, point.y);
  await expect.poll(() => page.locator('html').getAttribute('data-drawing-sounds')).not.toBe('0');
  await page.locator('#ink-sound').click();
  const count = await page.locator('html').getAttribute('data-drawing-sounds');
  await page.locator('#ink-toggle').click();
  await page.locator('#ink-toggle').click();
  await stroke(page, point.x, point.y + 70);
  expect(await page.locator('html').getAttribute('data-drawing-sounds')).toBe(count);
  await expect(page.locator('#ink-sound')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('touch drag paints without scrolling, and Ink off restores touch scrolling', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Requires a real touch-enabled browser context.');
  await page.locator('#ink-toggle').tap();
  const point = await drawingPoint(page);
  const session = await context.newCDPSession(page);
  await session.send('Input.synthesizeScrollGesture', {
    x: point.x, y: point.y + 80, yDistance: -60, speed: 500, gestureSourceType: 'touch',
  });
  await expect(ink(page)).toHaveAttribute('data-action-count', '1');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await pixels(page, point.x, point.y + 80)).toEqual([49, 87, 188, 255]);
  expect(await page.locator('body').evaluate((body) => getComputedStyle(body).touchAction)).toBe('pinch-zoom');
  await page.locator('#ink-toggle').tap();
  await expect(page.locator('#ink-toggle')).toHaveAttribute('aria-pressed', 'false');
  expect(await page.locator('body').evaluate((body) => getComputedStyle(body).touchAction)).toBe('auto');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  const before = await snapshot(page);
  await page.evaluate(() => {
    const events: object[] = [];
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend']) {
      document.addEventListener(type, (event) => {
        if (events.length < 30) events.push({
          type, prevented: event.defaultPrevented, target: (event.target as HTMLElement).tagName,
          x: event instanceof PointerEvent ? event.clientX : null,
          y: event instanceof PointerEvent ? event.clientY : null,
        });
        document.documentElement.dataset.gestureEvents = JSON.stringify(events);
      }, { capture: true, passive: true });
    }
  });
  await session.send('Input.synthesizeScrollGesture', { x: 150, y: 350, yDistance: -170, speed: 500, gestureSourceType: 'touch' });
  console.log('[DEBUG-ink-touch]', await page.evaluate(() => {
    const chain = [];
    for (let el = document.elementFromPoint(150, 350); el; el = el.parentElement) {
      const css = getComputedStyle(el);
      chain.push({ tag: el.tagName, class: el.className, touch: css.touchAction, overflow: css.overflowY, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, scrollTop: el.scrollTop });
    }
    return {
      chain, scrollY, innerHeight, scale: visualViewport?.scale, userAgent: navigator.userAgent,
      events: document.documentElement.dataset.gestureEvents,
      title: document.querySelector('.title-screen')!.getBoundingClientRect().toJSON(),
      ink: document.querySelector('#ink-toggle')!.getAttribute('aria-pressed'),
    };
  }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  expect(await snapshot(page)).toBe(before);
  await page.locator('#ink-toggle').tap();
  await session.send('Input.synthesizePinchGesture', { x: 150, y: 220, scaleFactor: 1.5, gestureSourceType: 'touch' });
  await expect.poll(() => page.evaluate(() => visualViewport!.scale)).toBeGreaterThan(1.1);
});

test('open Ink controls are accessible and fit narrow viewports', async ({ page }) => {
  await page.locator('#ink-toggle').click();
  await tools(page);
  await page.getByRole('button', { name: 'Pen', exact: true }).hover();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    const box = (await page.locator('#ink-panel').boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 844, height: 390 });
  const landscape = (await page.locator('#ink-panel').boundingBox())!;
  expect(landscape.y).toBeGreaterThanOrEqual(0);
  expect(landscape.y + landscape.height).toBeLessThan(390);
});

test('sound failures are visible without breaking drawing or reporting sound enabled', async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: class { constructor() { throw new Error('Audio unavailable in this test'); } },
    });
  });
  await page.locator('#ink-toggle').click();
  await expect(page.locator('#ink-status')).toContainText('Sound is unavailable');
  await expect(page.locator('#ink-sound')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'false');
  const point = await drawingPoint(page);
  await stroke(page, point.x, point.y);
  expect(await pixels(page, point.x, point.y)).toEqual([49, 87, 188, 255]);
});

test('scrolling and pointer cancellation break strokes without long connecting lines', async ({ page }) => {
  await page.locator('#ink-toggle').click();
  const point = await drawingPoint(page);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 10, point.y + 10);
  await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'instant' }));
  await expect(ink(page)).toHaveAttribute('data-action-count', '1');
  const before = await snapshot(page);
  await page.mouse.move(10, 100, { steps: 5 });
  await page.mouse.up();
  expect(await snapshot(page)).toBe(before);
  await page.mouse.move(10, 100);
  await page.mouse.down();
  await page.locator('body').dispatchEvent('pointercancel', { pointerId: 1, isPrimary: true });
  const cancelled = await snapshot(page);
  await page.mouse.move(10, 180, { steps: 5 });
  await page.mouse.up();
  expect(await snapshot(page)).toBe(cancelled);
  await expect(ink(page)).toHaveAttribute('data-action-count', '2');
});
