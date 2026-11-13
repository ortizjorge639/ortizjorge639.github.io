import { test, expect, type Page } from '@playwright/test';
import { projectStories } from '../src/stories';
import { projects } from '../src/projects';

const player = (page: Page) => page.locator('[data-story-player]');
const viewport = (page: Page) => page.locator('.story-viewport');
const library = '/#projects?category=All&page=2&selected=repoquest';

async function ready(page: Page, route = library) {
  await page.goto(route);
  await page.clock.runFor(100);
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.evaluate(() => document.fonts.ready);
  await page.clock.runFor(100);
}
async function replay(page: Page) {
  await viewport(page).focus();
  await page.keyboard.press('Enter');
  await expect(player(page)).toHaveAttribute('data-motion', 'replay');
}
test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  await page.route('**/api/guide/status', route => route.fulfill({ json: { available: true, mode: 'copilot-cli' } }));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
});

test('hover replays once without changing the frame, clock, catalog, focus, or markup', async ({ page, isMobile }) => {
  await ready(page);
  await page.mouse.move(1, 1);
  const url = page.url();
  const catalog = await page.locator('.library-content').innerHTML();
  const frame = await page.locator('#story-canvas').innerHTML();
  const progress = await page.getByRole('slider').inputValue();
  await page.locator('.open-project').focus();
  await viewport(page).hover();
  if (isMobile) {
    await expect(player(page)).toHaveAttribute('data-motion', 'idle');
    await replay(page);
  } else {
    await expect(player(page)).toHaveAttribute('data-motion', 'hover');
    await expect(page.locator('.open-project')).toBeFocused();
  }
  await page.clock.runFor(150);
  expect(await page.locator('.story-lightbox-stroke').count()).toBeGreaterThan(0);
  const offsets = await page.locator('.story-before svg path:not(.story-lightbox-stroke)').evaluateAll(paths =>
    paths.map(path => parseFloat(getComputedStyle(path).strokeDashoffset)));
  expect(offsets.some(offset => offset > 0 && offset < 100)).toBe(true);
  await page.clock.runFor(3000);
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
  expect(page.url()).toBe(url);
  expect(await page.getByRole('slider').inputValue()).toBe(progress);
  expect(await page.locator('.library-content').innerHTML()).toBe(catalog);
  expect(await page.locator('#story-canvas').innerHTML()).toBe(frame);
  expect(await player(page).evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  await page.clock.runFor(5000);
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
});

test('all seven projects inherit bounded recipes for every scene, with no hidden copy', async ({ page }) => {
  test.setTimeout(90000);
  for (const project of projects) {
    for (const scene of projectStories[project.id].scenes) {
      await ready(page, `/#project/${project.id}/overview?scene=${scene.id}`);
      await replay(page);
      await page.clock.runFor(120);
      const effects = await player(page).evaluate(element => element.getAnimations({ subtree: true }).map(animation => animation.effect!.getTiming()));
      expect(effects.length).toBeGreaterThan(0);
      for (const effect of effects) {
        expect(effect.iterations).toBe(1);
        expect(Number(effect.duration) + effect.delay).toBeLessThanOrEqual(2500);
        expect(effect.easing).toMatch(/^steps/);
      }
      await expect(page.locator('#story-heading')).toHaveText(scene.headline);
      if (scene.visual.type !== 'image') await expect(page.locator('.story-body')).toBeVisible();
      await page.clock.runFor(3000);
      await expect(player(page)).toHaveAttribute('data-motion', 'idle');
      expect(await player(page).evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
      await expect(page.locator('.story-lightbox-stroke, .story-pencil-line, .story-wire-ink, [data-active=true]')).toHaveCount(0);
    }
  }
});

test('flow motion follows authored edges and highlights the receiving node', async ({ page }) => {
  const scene = projectStories.repoquest.scenes[2];
  if (scene.visual.type !== 'flow') throw new Error('Expected a flow fixture');
  await ready(page, `/#project/repoquest/overview?scene=${scene.id}`);
  await replay(page);
  const connections = await page.locator('.story-wire-ink').evaluateAll(paths => paths.map(path => ({
    from: (path as SVGPathElement).dataset.from, to: (path as SVGPathElement).dataset.to,
  })));
  expect(connections).toEqual(scene.visual.edges);
  await page.clock.runFor(450);
  await expect(page.locator(`[data-node="${scene.visual.edges[0].to}"]`)).toHaveAttribute('data-active', 'true');
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
});

test('a delayed last playback tick still settles the final drawing', async ({ page }) => {
  await ready(page, '/#project/repoquest/overview?scene=tutorial-not-app');
  await page.getByRole('button', { name: 'Play flipbook', exact: true }).click();
  await expect(player(page)).toHaveAttribute('data-motion', 'timeline');
  await page.clock.fastForward(20000);
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await expect(page.locator('.story-lightbox-stroke')).toHaveCount(0);
});

test('touch replays deliberately without hover activation or frame navigation', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Native touch replay uses the touch-enabled project.');
  await ready(page);
  await viewport(page).dispatchEvent('pointerenter', { pointerType: 'touch' });
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  const url = page.url();
  await page.locator('.story-before').tap();
  await expect(player(page)).toHaveAttribute('data-motion', 'replay');
  await page.clock.runFor(3000);
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  expect(page.url()).toBe(url);
});

test('hover exit, manual navigation, and sources cancel without accumulating effects', async ({ page, isMobile }) => {
  await ready(page);
  if (!isMobile) {
    await viewport(page).hover();
    await expect(player(page)).toHaveAttribute('data-motion', 'hover');
    await page.mouse.move(1, 1);
    await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  }
  await replay(page);
  const traces = await page.locator('.story-lightbox-stroke').count();
  for (let i = 0; i < 4; i++) await replay(page);
  expect(await page.locator('.story-lightbox-stroke').count()).toBe(traces);
  await page.getByRole('button', { name: 'Next frame', exact: true }).click();
  await expect(player(page)).toHaveAttribute('data-motion', 'manual');
  await expect(page.locator('.story-lightbox-stroke')).toHaveCount(1);
  await page.getByRole('button', { name: 'Show story sources' }).click();
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await viewport(page).dispatchEvent('pointerenter', { pointerType: 'mouse' });
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await page.getByRole('button', { name: 'Show story sources' }).click();
  await page.clock.runFor(3000);
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
});

test('Ink, Guide, modal, hidden tab, reduced motion and navigation stop frame motion', async ({ page }) => {
  await ready(page);
  await replay(page);
  await page.locator('#ink-toggle').click();
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await viewport(page).focus();
  await page.keyboard.press('Enter');
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await page.locator('#ink-toggle').click();
  await replay(page);
  await page.locator('#guide-access').click();
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await page.locator('#guide-minimize').click();
  await replay(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await page.getByRole('button', { name: 'Next frame', exact: true }).click();
  await page.locator('[data-image-open]').click();
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await page.keyboard.press('Escape');
  await replay(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(player(page)).toHaveAttribute('data-motion', 'idle');
  await page.keyboard.press('Enter');
  expect(await player(page).evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  await page.locator('#home-button').click();
  await page.clock.runFor(4000);
  await expect(page.locator('[data-story-player]')).toHaveCount(0);
});
