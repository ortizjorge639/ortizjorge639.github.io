import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type Pane = 'upper' | 'lower';
const ink = (page: Page, pane: Pane = 'upper') => page.locator(`.screen-ink-canvas[data-pane="${pane}"]`);
const snapshot = (page: Page, pane: Pane = 'upper') => ink(page, pane).evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
const pixels = (page: Page, x: number, y: number, pane: Pane = 'upper', width = 1, height = 1) =>
  ink(page, pane).evaluate((canvas: HTMLCanvasElement, rect) =>
    Array.from(canvas.getContext('2d')!.getImageData(rect.x, rect.y, rect.width, rect.height).data),
  { x: Math.round(x), y: Math.round(y), width, height });

async function drawingPoint(page: Page, pane: Pane = 'upper', distance = 24) {
  return ink(page, pane).evaluate((canvas, distance) => {
    const root = canvas.parentElement!;
    const bounds = canvas.getBoundingClientRect();
    const viewport = root.parentElement!.getBoundingClientRect();
    const excluded = 'a,button,input,select,textarea,label,summary,[contenteditable],[role="button"],[data-ink-ui],dialog';
    for (let y = Math.max(bounds.top, viewport.top) + 8; y < Math.min(bounds.bottom, viewport.bottom) - distance - 8; y += 8) {
      for (let x = Math.max(bounds.left, viewport.left) + 8; x < Math.min(bounds.right, viewport.right) - distance - 8; x += 8) {
        if ([0, distance / 2, distance].every((offset) => {
          const target = document.elementFromPoint(x + offset, y + offset);
          return target && root.contains(target) && !target.closest(excluded);
        })) return { x, y, localX: Math.round(x - bounds.left), localY: Math.round(y - bounds.top) };
      }
    }
    throw new Error('No non-control drawing space in the visible screen');
  }, distance);
}

async function stroke(page: Page, x: number, y: number) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 24, y + 24, { steps: 6 });
  await page.mouse.up();
}

async function tools(page: Page) {
  if (await page.locator('#ink-panel').isHidden()) await page.locator('#ink-tools-toggle').click();
}

async function route(page: Page, hash: string) {
  await page.evaluate((value) => { location.hash = value; }, hash);
  await expect(page).toHaveURL(new RegExp(`${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
  await expect(ink(page)).toHaveCount(1);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function overflowLower(page: Page) {
  await route(page, '#about');
  await page.setViewportSize({ width: 390, height: 600 });
  await page.locator('#lower-content').evaluate((root) => {
    root.querySelectorAll<HTMLElement>('p, li').forEach((item) => {
      item.style.fontSize = '32px';
      item.style.lineHeight = '1.8';
    });
  });
  await expect.poll(() => page.locator('#lower-scroll').evaluate((node) => node.scrollHeight - node.clientHeight)).toBeGreaterThan(100);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#home');
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.evaluate(() => document.fonts.ready);
  await expect(ink(page)).toHaveCount(1);
});

test('Ink is opt-in and toggling preserves actual pixels', async ({ page }) => {
  const point = await drawingPoint(page);
  const blank = await snapshot(page);
  await stroke(page, point.x, point.y);
  expect(await snapshot(page)).toBe(blank);
  await page.locator('#ink-toggle').click();
  await stroke(page, point.x, point.y);
  await expect(ink(page)).toHaveAttribute('data-action-count', '1');
  expect(await pixels(page, point.localX, point.localY)).toEqual([49, 87, 188, 255]);
  const marked = await snapshot(page);
  await page.locator('#ink-toggle').click();
  await stroke(page, point.x, point.y);
  expect(await snapshot(page)).toBe(marked);
  await page.locator('#ink-toggle').click();
  await page.locator('#ink-undo').click();
  expect(await snapshot(page)).toBe(blank);
  await expect(page.locator('#ink-undo')).toBeDisabled();
});

test('destinations isolate history and undo follows upper/lower action ordering', async ({ page }) => {
  await page.locator('#ink-toggle').click();
  const upper = await drawingPoint(page);
  const lower = await drawingPoint(page, 'lower', 0);
  const blankUpper = await snapshot(page);
  const blankLower = await snapshot(page, 'lower');
  await stroke(page, upper.x, upper.y);
  const markedUpper = await snapshot(page);
  await page.mouse.click(lower.x, lower.y);
  const markedLower = await snapshot(page, 'lower');
  await page.locator('#ink-undo').click();
  expect(await snapshot(page)).toBe(markedUpper);
  expect(await snapshot(page, 'lower')).toBe(blankLower);
  await page.mouse.click(lower.x, lower.y);
  for (const hash of ['#about', '#projects', '#projects?category=Gaming&page=1', '#projects?category=All&page=2', '#project/repoquest/overview', '#project/repoquest/inside', '#project/repoquest/links', '#help/1', '#help/2']) {
    await route(page, hash);
    await expect(ink(page)).toHaveAttribute('data-action-count', '0');
    await expect(page.locator('#ink-undo')).toBeDisabled();
    await tools(page);
    await page.locator('#ink-stamp').click();
    await expect(ink(page)).toHaveAttribute('data-action-count', '1');
    if (hash === '#projects') {
      await page.locator('#ink-close-panel').click();
      const originalKey = await ink(page).getAttribute('data-surface-key');
      await page.getByRole('button', { name: /^Preview /, pressed: false }).first().click();
      await expect(ink(page)).not.toHaveAttribute('data-surface-key', originalKey!);
      await expect(ink(page)).toHaveAttribute('data-action-count', '0');
      await route(page, '#projects');
      await expect(ink(page)).toHaveAttribute('data-action-count', '1');
    }
  }
  await route(page, '#home');
  expect(await snapshot(page)).toBe(markedUpper);
  expect(await snapshot(page, 'lower')).toBe(markedLower);
  await tools(page);
  await page.locator('#ink-clear').click();
  expect(await snapshot(page)).toBe(blankUpper);
  expect(await snapshot(page, 'lower')).toBe(blankLower);
  await page.locator('#ink-undo').click();
  expect(await snapshot(page)).toBe(markedUpper);
  expect(await snapshot(page, 'lower')).toBe(markedLower);
  await route(page, '#about');
  await expect(ink(page)).toHaveAttribute('data-action-count', '1');
  await expect(page.locator('#ink-toggle')).toHaveAttribute('aria-pressed', 'true');
});

test('checker paint, colors, nibs, eraser, and undoable clear change pixels', async ({ page }) => {
  const point = await drawingPoint(page);
  const blank = await snapshot(page);
  await page.locator('#ink-toggle').click();
  await tools(page);
  await page.getByRole('button', { name: 'Paint', exact: true }).click();
  await page.getByRole('button', { name: 'Red ink' }).click();
  await page.locator('#ink-close-panel').click();
  await page.mouse.click(point.x, point.y);
  const sample = await pixels(page, point.localX - 4, point.localY - 4, 'upper', 8, 8);
  expect(sample.filter((value, i) => i % 4 === 3 && value === 255)).toHaveLength(32);
  expect(sample.filter((value, i) => i % 4 === 3 && value === 0)).toHaveLength(32);
  const opaque = sample.findIndex((value, i) => i % 4 === 3 && value === 255);
  expect(sample.slice(opaque - 3, opaque + 1)).toEqual([212, 72, 54, 255]);
  const painted = await snapshot(page);
  await tools(page);
  await page.getByRole('button', { name: 'Eraser', exact: true }).click();
  await page.locator('#ink-close-panel').click();
  await page.mouse.click(point.x, point.y);
  expect(await snapshot(page)).toBe(blank);
  await page.locator('#ink-undo').click();
  expect(await snapshot(page)).toBe(painted);
  await tools(page);
  await page.getByRole('button', { name: 'Broad nib' }).click();
  await expect(page.getByRole('button', { name: 'Broad nib' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#ink-clear').click();
  expect(await snapshot(page)).toBe(blank);
  await page.locator('#ink-undo').click();
  expect(await snapshot(page)).toBe(painted);
});

test('keyboard stamp exports both transparent screens and Escape takes priority over navigation', async ({ page }) => {
  await route(page, '#about');
  await page.locator('#ink-toggle').focus();
  await page.keyboard.press('Enter');
  const lower = await drawingPoint(page, 'lower');
  await stroke(page, lower.x, lower.y);
  await page.locator('#ink-tools-toggle').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Pen', exact: true })).toBeFocused();
  await page.locator('#ink-stamp').focus();
  await page.keyboard.press('Enter');
  await expect(ink(page)).toHaveAttribute('data-action-count', '2');
  const download = page.waitForEvent('download');
  await page.locator('#ink-save').click();
  const exported = await download;
  expect(exported.suggestedFilename()).toBe('joji-page-ink.png');
  const stream = await exported.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const bytes = Buffer.concat(chunks);
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const dimensions = await page.locator('.screen-ink-canvas').evaluateAll((canvases) => canvases.map((node) => {
    const canvas = node as HTMLCanvasElement;
    return { width: canvas.width, height: canvas.height };
  }));
  expect(bytes.readUInt32BE(16)).toBe(Math.max(...dimensions.map((value) => value.width)));
  expect(bytes.readUInt32BE(20)).toBe(dimensions.reduce((sum, value) => sum + value.height, 0));
  const decoded = await page.evaluate(async ({ data, x, y }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    return { corner: [...ctx.getImageData(0, 0, 1, 1).data], lower: [...ctx.getImageData(x, y, 1, 1).data] };
  }, { data: bytes.toString('base64'), x: lower.localX, y: dimensions[0].height + lower.localY });
  expect(decoded.corner).toEqual([0, 0, 0, 0]);
  expect(decoded.lower).toEqual([49, 87, 188, 255]);
  await page.keyboard.press('Escape');
  await expect(page.locator('#ink-panel')).toBeHidden();
  await expect(page.locator('#ink-tools-toggle')).toBeFocused();
  await expect(page).toHaveURL(/#about$/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#ink-toggle')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#ink-toggle')).toBeFocused();
  await expect(page).toHaveURL(/#about$/);
});

test('hover is mouse-only opt-in and controls cannot start or join strokes', async ({ page }) => {
  const point = await drawingPoint(page);
  const blank = await snapshot(page);
  await page.locator('#ink-toggle').click();
  await page.mouse.move(point.x, point.y);
  await page.mouse.move(point.x + 24, point.y + 24);
  expect(await snapshot(page)).toBe(blank);
  await tools(page);
  await page.getByRole('switch', { name: /Paint on hover/ }).check();
  await page.locator('#ink-close-panel').click();
  await ink(page).dispatchEvent('pointermove', { pointerType: 'touch', isPrimary: true, pointerId: 99, buttons: 0, clientX: point.x, clientY: point.y });
  expect(await snapshot(page)).toBe(blank);
  await page.mouse.move(point.x, point.y);
  await page.mouse.move(point.x + 24, point.y + 24);
  await page.locator('#ink-tools-toggle').hover();
  expect(await snapshot(page)).not.toBe(blank);
  await tools(page);
  await page.getByRole('switch', { name: /Paint on hover/ }).uncheck();
  await page.locator('#ink-close-panel').click();
  const count = await ink(page).getAttribute('data-action-count');
  const control = (await page.locator('#sound-toggle').boundingBox())!;
  await page.mouse.move(control.x + control.width / 2, control.y + control.height / 2);
  await page.mouse.down();
  await page.mouse.move(point.x, point.y, { steps: 5 });
  await page.mouse.up();
  await expect(ink(page)).toHaveAttribute('data-action-count', count!);
  await page.locator('#sound-toggle').click();
  await expect(ink(page)).toHaveAttribute('data-action-count', count!);
  await route(page, '#about');
  await expect(ink(page)).toHaveAttribute('data-action-count', '0');
});

test('surface-local coordinates survive resize and internal scrolling without document overflow', async ({ page }) => {
  await overflowLower(page);
  await page.locator('#ink-toggle').click();
  const point = await drawingPoint(page, 'lower');
  await stroke(page, point.x, point.y);
  await page.locator('#lower-scroll').evaluate((node) => { node.scrollTop = 100; });
  await expect.poll(() => page.locator('#lower-scroll').evaluate((node) => node.scrollTop)).toBe(100);
  expect(await pixels(page, point.localX, point.localY, 'lower')).toEqual([49, 87, 188, 255]);
  const scrolled = await drawingPoint(page, 'lower');
  await stroke(page, scrolled.x, scrolled.y);
  expect(await pixels(page, scrolled.localX, scrolled.localY, 'lower')).toEqual([49, 87, 188, 255]);
  await page.setViewportSize({ width: 480, height: 700 });
  await expect.poll(() => ink(page, 'lower').evaluate((canvas: HTMLCanvasElement) => canvas.width === canvas.parentElement!.clientWidth)).toBe(true);
  expect(await pixels(page, point.localX, point.localY, 'lower')).toEqual([49, 87, 188, 255]);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('route changes, internal scroll, cancel, and blur break active strokes', async ({ page }) => {
  await page.locator('#ink-toggle').click();
  const point = await drawingPoint(page);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 10, point.y + 10);
  await route(page, '#about');
  const blank = await snapshot(page);
  const next = await drawingPoint(page);
  await page.mouse.move(next.x, next.y);
  await page.mouse.up();
  expect(await snapshot(page)).toBe(blank);
  await route(page, '#home');
  await expect(ink(page)).toHaveAttribute('data-action-count', '1');
  await overflowLower(page);
  for (const interruption of ['scroll', 'pointercancel', 'blur']) {
    const start = await drawingPoint(page, 'lower');
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    if (interruption === 'scroll') {
      await page.locator('#lower-scroll').evaluate((node) => { node.scrollTop += 40; });
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    } else if (interruption === 'pointercancel') await page.locator('body').dispatchEvent('pointercancel', { pointerId: 1 });
    else await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    const before = await snapshot(page, 'lower');
    await page.mouse.move(start.x + 24, start.y + 24);
    await page.mouse.up();
    expect(await snapshot(page, 'lower')).toBe(before);
  }
  await expect(ink(page, 'lower')).toHaveAttribute('data-action-count', '3');
});

test('drawing uses synth nodes and explicit mute survives ink toggles and destinations', async ({ page }) => {
  await page.evaluate(() => {
    const original = AudioContext.prototype.createBufferSource;
    document.documentElement.dataset.drawingSounds = '0';
    AudioContext.prototype.createBufferSource = function () {
      document.documentElement.dataset.drawingSounds = String(Number(document.documentElement.dataset.drawingSounds) + 1);
      return original.call(this);
    };
  });
  await page.locator('#ink-toggle').click();
  await expect(page.locator('#ink-sound')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'true');
  const point = await drawingPoint(page);
  await stroke(page, point.x, point.y);
  await expect.poll(() => page.locator('html').getAttribute('data-drawing-sounds')).not.toBe('0');
  await page.locator('#ink-sound').click();
  const count = await page.locator('html').getAttribute('data-drawing-sounds');
  await page.locator('#ink-toggle').click();
  await page.locator('#ink-toggle').click();
  await route(page, '#about');
  const next = await drawingPoint(page);
  await stroke(page, next.x, next.y);
  expect(await page.locator('html').getAttribute('data-drawing-sounds')).toBe(count);
  await expect(page.locator('#ink-sound')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('sound failures remain visible without breaking drawing', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: class { constructor() { throw new Error('Audio unavailable in this test'); } },
    });
  });
  await page.reload();
  await page.locator('#ink-toggle').click();
  await expect(page.locator('#ink-status')).toContainText('Sound is unavailable');
  await expect(page.locator('#ink-sound')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'false');
  const point = await drawingPoint(page);
  await stroke(page, point.x, point.y);
  expect(await pixels(page, point.localX, point.localY)).toEqual([49, 87, 188, 255]);
});

test('touch drag paints without scrolling; Ink off restores native screen scroll and pinch zoom', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Requires native touch emulation.');
  await overflowLower(page);
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
  const box = (await page.locator('#lower-scroll').boundingBox())!;
  const swipe = () => session.send('Input.synthesizeScrollGesture', {
    x: box.x + 30, y: box.y + box.height - 30, yDistance: -90, speed: 350, gestureSourceType: 'touch',
  });
  const scrollTop = () => page.locator('#lower-scroll').evaluate((node) => node.scrollTop);
  await swipe();
  await expect.poll(scrollTop, { message: 'Genuinely overflowing screen scrolls with native touch before ink' }).toBeGreaterThan(0);
  await page.locator('#lower-scroll').evaluate((node) => { node.scrollTop = 0; });
  await expect.poll(scrollTop).toBe(0);
  await page.locator('#ink-toggle').tap();
  const blank = await snapshot(page, 'lower');
  await swipe();
  await expect(ink(page, 'lower')).toHaveAttribute('data-action-count', '1');
  expect(await snapshot(page, 'lower')).not.toBe(blank);
  expect(await scrollTop()).toBe(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await page.locator('#lower-content').evaluate((node) => getComputedStyle(node).touchAction)).toBe('pinch-zoom');
  await page.locator('#ink-toggle').tap();
  const before = await snapshot(page, 'lower');
  await swipe();
  await expect.poll(scrollTop).toBeGreaterThan(0);
  expect(await snapshot(page, 'lower')).toBe(before);
  await page.locator('#ink-toggle').tap();
  await session.send('Input.synthesizePinchGesture', {
    x: box.x + box.width / 2, y: box.y + box.height / 2, scaleFactor: 1.5, gestureSourceType: 'touch',
  });
  await expect.poll(() => page.evaluate(() => visualViewport!.scale)).toBeGreaterThan(1.1);
});

test('ink dock and tools remain accessible within narrow and landscape viewports', async ({ page }) => {
  await page.locator('#ink-toggle').click();
  await tools(page);
  expect((await new AxeBuilder({ page }).include('.ink-widget').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  for (const viewport of [{ width: 320, height: 600 }, { width: 390, height: 600 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => {
      const panel = (await page.locator('#ink-panel').boundingBox())!;
      return panel.x >= 0 && panel.y >= 0 && panel.x + panel.width <= viewport.width && panel.y + panel.height <= viewport.height;
    }).toBe(true);
    const dock = (await page.locator('.ink-dock').boundingBox())!;
    expect(dock.x).toBeGreaterThanOrEqual(0);
    expect(dock.x + dock.width).toBeLessThanOrEqual(viewport.width);
    expect(dock.y + dock.height).toBeLessThanOrEqual(viewport.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
