import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const route = '/#projects?category=All&page=2&selected=repoquest&scene=watch-the-guide';
const viewer = (page: Page) => page.locator('.image-viewer');
async function open(page: Page) {
  await page.goto(route);
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.locator('[data-image-open]').click();
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByRole('button', { name: 'Zoom in', exact: true })).toBeEnabled();
}

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('image opens with keyboard focus, bounded zoom, fit, and Escape restores the same frame', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('#entry-screen')).toBeHidden();
  const trigger = page.locator('[data-image-open]');
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = viewer(page);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close image' })).toBeFocused();
  await expect(dialog.getByRole('button', { name: 'Zoom in', exact: true })).toBeEnabled();
  await expect(dialog.locator('img')).toHaveAttribute('src', /repoquest.jpg$/);
  const initial = (await dialog.locator('img').boundingBox())!;
  for (let i = 0; i < 4; i++) await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(dialog.locator('output')).toHaveText('400%');
  await expect(dialog.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled();
  expect((await dialog.locator('img').boundingBox())!.width).toBeCloseTo(initial.width * 4, 0);
  await page.keyboard.press('-');
  await expect(dialog.locator('output')).toHaveText('300%');
  await dialog.getByRole('button', { name: 'Fit', exact: true }).click();
  await expect(dialog.locator('output')).toHaveText('100%');
  await expect(dialog.getByRole('button', { name: 'Zoom out', exact: true })).toBeDisabled();
  expect((await dialog.locator('img').boundingBox())!.width).toBeCloseTo(initial.width, 0);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page).toHaveURL(new RegExp('selected=repoquest&scene=watch-the-guide$'));
  await expect(page.locator('.library-content')).toBeVisible();
});

test('zoomed image pans by mouse dragging and resets each time it opens', async ({ page }) => {
  await open(page);
  const dialog = viewer(page);
  await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click();
  const viewport = dialog.locator('.image-viewer-viewport');
  const bounds = (await viewport.boundingBox())!;
  const before = await viewport.evaluate(element => element.scrollLeft);
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 - 60, bounds.y + bounds.height / 2 - 40, { steps: 5 });
  await page.mouse.up();
  expect(await viewport.evaluate(element => element.scrollLeft)).toBeGreaterThan(before + 40);
  await dialog.getByRole('button', { name: 'Close image' }).click();
  await page.locator('[data-image-open]').click();
  await expect(dialog.locator('output')).toHaveText('100%');
  await page.mouse.click(2, 2);
  await expect(dialog).toBeHidden();
});

test('modal traps focus, isolates shortcuts, and passes accessibility checks', async ({ page }) => {
  await open(page);
  const url = page.url();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    expect(await viewer(page).evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('ArrowRight');
  expect(page.url()).toBe(url);
  await page.evaluate(() => document.fonts.ready);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('archived Flipnotes use the same viewer without turning pages or losing Ink', async ({ page }) => {
  await page.goto('/#about/flipnotes/1');
  await expect(page.locator('#entry-screen')).toBeHidden();
  const trigger = page.locator('[data-image-open]');
  await trigger.click();
  await expect(viewer(page).locator('img')).toHaveClass('pixel-art');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#about\/flipnotes\/1$/);
  await page.keyboard.press('Escape');
  await page.locator('#ink-toggle').click();
  await expect(trigger).toBeDisabled();
  const image = (await page.locator('.flipnote-art').boundingBox())!;
  await page.mouse.click(image.x + image.width / 2, image.y + image.height / 2);
  await expect(viewer(page)).toBeHidden();
  await expect(page.locator('.screen-ink-canvas[data-pane=upper]')).toHaveAttribute('data-action-count', '1');
  await page.locator('#ink-toggle').click();
  await expect(trigger).toBeEnabled();
  await trigger.click();
  await expect(viewer(page)).toBeVisible();
});

test('opening the viewer pauses playing frames without resuming on close', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto(route);
  await page.clock.runFor(100);
  await page.getByRole('button', { name: 'Play flipbook', exact: true }).click();
  await page.clock.runFor(500);
  await page.locator('[data-image-open]').click();
  await expect(page.locator('[data-story-player]')).toHaveAttribute('data-playing', 'false');
  await page.clock.runFor(20000);
  await expect(page.locator('[data-story-player]')).toHaveAttribute('data-scene', 'watch-the-guide');
  await page.keyboard.press('Escape');
  await page.clock.runFor(20000);
  await expect(page.locator('[data-story-player]')).toHaveAttribute('data-playing', 'false');
  await expect(page.locator('[data-story-player]')).toHaveAttribute('data-scene', 'watch-the-guide');
});

test('viewer failure is explicit and route changes dismiss stale images', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.locator('.story-image img').evaluate((image: HTMLImageElement) => image.decode());
  await page.route('**/images/unavailable.png', request => request.abort());
  await page.locator('.story-image img').evaluate(image => {
    // Simulate a distinct viewer request failing after the thumbnail has loaded.
    Object.defineProperty(image, 'currentSrc', { value: new URL('/images/unavailable.png', location.href).href });
  });
  await page.locator('[data-image-open]').click();
  await expect(viewer(page).getByRole('status').filter({ hasText: 'could not load' })).toBeVisible();
  await expect(viewer(page).getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled();
  await page.evaluate(() => { location.hash = '#home'; });
  await expect(viewer(page)).toBeHidden();
  await expect(page.locator('#screen-title')).toBeVisible();
});
