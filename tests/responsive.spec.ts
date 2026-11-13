import type { Page, Locator } from '@playwright/test';
import { test, expect } from './fixtures/responsive';
import { projects } from '../src/projects';
import { projectStories } from '../src/stories';
import { renderStoryScene } from '../src/story-render';
import type { StoryScene } from '../src/story-types';
import AxeBuilder from '@axe-core/playwright';

const sizes = [
  [240, 320], [280, 653], [320, 568], [360, 640], [390, 844], [430, 932],
  [568, 320], [844, 390], [640, 360], [720, 540], [768, 1024], [1024, 768],
  [540, 720], [720, 720], [912, 1368], [1280, 720], [1440, 900], [2560, 1080], [3840, 2160],
] as const;
const pages = ['home', 'projects', 'project/mcreator-workspace-harness/overview', 'project/repoquest/inside', 'project/repoquest/links', 'about', 'help/3', 'unknown'];

async function settle(page: Page) {
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}
async function reachable(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  const result = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    let left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
    let top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      const bounds = parent.getBoundingClientRect();
      if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) { top = Math.max(top, bounds.top); bottom = Math.min(bottom, bounds.bottom); }
      if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) { left = Math.max(left, bounds.left); right = Math.min(right, bounds.right); }
    }
    const x = (left + right) / 2;
    const y = (top + bottom) / 2;
    const hit = document.elementFromPoint(x, y);
    return { width: right - left, height: bottom - top, hit: hit !== null && (element.contains(hit) || hit === element) };
  });
  expect(result.width).toBeGreaterThan(0);
  expect(result.height).toBeGreaterThan(0);
  expect(result.hit, `occluded control: ${await locator.getAttribute('id') ?? await locator.textContent()}`).toBe(true);
}
async function noHorizontalClipping(page: Page) {
  const overflow = await page.evaluate(() => {
    const selectors = ['html', '#app', '.studio-app', '#upper-scroll', '#lower-scroll', '.screen-status', '.screen-navigation', '.story-player', '.story-viewport', '.story-controls', '#story-sources:not([hidden])', '#guide-panel:not([hidden])', '#guide-log', '.guide-composer', '#ink-panel:not([hidden])'];
    return selectors.flatMap((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      return element && element.getClientRects().length && element.scrollWidth > element.clientWidth + 2
        ? [{ selector, client: element.clientWidth, content: element.scrollWidth }] : [];
    });
  });
  expect(overflow).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/guide/status', (route) => route.fulfill({ json: { available: true, mode: 'copilot-cli' } }));
  await page.route('**/api/guide/chat', (route) => route.fulfill({ json: {
    answer: 'A long source-backed response for responsive testing. '.repeat(16),
    citations: [{ id: 'fixture', title: 'VeryLongUnbrokenSourceHeading'.repeat(5), projectId: 'repoquest',
      url: 'https://github.com/ortizjorge639/repoquest/blob/main/README.md' }],
    contextProjectId: route.request().postDataJSON().projectId,
  } }));
});

for (const [width, height] of sizes) {
  test(`screens and guide remain usable at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const hash of pages) {
      await page.goto(`/#${hash}`);
      await settle(page);
      await noHorizontalClipping(page);
      await reachable(page.locator('#guide-access'));
      await reachable(page.locator('#ink-toggle'));
      if (hash !== 'home') await reachable(page.locator('#home-button'));
      if (hash === 'projects') await reachable(page.locator('.open-project'));
      if (hash === 'project/repoquest/links') await reachable(page.locator('.source-note'));
      if (hash === 'about') await reachable(page.getByRole('link', { name: 'GitHub', exact: true }));
    }
    await page.locator('#guide-access').click();
    await expect(page.locator('#guide-send')).toBeEnabled();
    await settle(page);
    await noHorizontalClipping(page);
    await reachable(page.locator('#guide-question'));
    await reachable(page.locator('#guide-minimize'));
    expect(await page.locator('#lower-scroll').evaluate(element => element.clientHeight)).toBeGreaterThanOrEqual(48);
    await page.locator('#guide-question').fill('Layout fixture question');
    await page.locator('#guide-send').click();
    await expect(page.locator('.guide-message-assistant')).toBeVisible();
    await noHorizontalClipping(page);
    await reachable(page.locator('.guide-sources a'));
    await page.locator('#guide-expand').click();
    await settle(page);
    await reachable(page.locator('#guide-question'));
    await reachable(page.locator('#guide-access'));
    await page.locator('#guide-minimize').click();
    await page.locator('#ink-toggle').click();
    await reachable(page.locator('#back-button'));
    await reachable(page.locator('#ink-sound'));
    await page.locator('#ink-tools-toggle').click();
    await noHorizontalClipping(page);
    await reachable(page.locator('#ink-close-panel'));
    await reachable(page.locator('#ink-stamp'));
    expect(errors).toEqual([]);
  });
}

test('fold/unfold and rotation preserve conversation, draft, ink, and source controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#projects');
  await page.locator('#ink-toggle').click();
  await page.locator('#ink-tools-toggle').click();
  await page.locator('#ink-stamp').click();
  await page.keyboard.press('Escape');
  await page.locator('#guide-access').click();
  await expect(page.locator('#guide-send')).toBeEnabled();
  await page.locator('#guide-question').fill('Fixture');
  await page.locator('#guide-send').click();
  await expect(page.locator('.guide-message-assistant')).toBeVisible();
  await page.locator('#guide-question').fill('Preserved draft');
  for (const [width, height] of [[720, 720], [1368, 912], [540, 720], [844, 390], [280, 653], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await settle(page);
    await noHorizontalClipping(page);
    await reachable(page.locator('#guide-question'));
    await expect(page.locator('#guide-question')).toHaveValue('Preserved draft');
    await expect(page.locator('.guide-message-assistant')).toHaveCount(1);
    await expect(page.locator('.screen-ink-canvas[data-pane=upper]')).toHaveAttribute('data-action-count', '1');
  }
});

test('200–400% zoom-equivalent reflow and enlarged text keep controls reachable', async ({ page }) => {
  // Desktop page zoom reduces CSS viewport dimensions; these are reflow equivalents,
  // not a claim to exercise a physical browser's zoom UI.
  for (const scale of [2, 4]) {
    await page.setViewportSize({ width: Math.floor(1280 / scale), height: Math.floor(800 / scale) });
    await page.goto('/#project/repoquest/links');
    await settle(page);
    await noHorizontalClipping(page);
    await reachable(page.locator('.source-note'));
    await reachable(page.locator('#home-button'));
    await page.locator('#guide-access').click();
    await reachable(page.locator('#guide-question'));
    await reachable(page.locator('#guide-minimize'));
    await page.locator('#guide-minimize').click();
  }
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/#about');
  await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>('#lower-content p, #lower-content h1, .screen-status > *, .screen-navigation > a').forEach((element) => {
      element.style.fontSize = `${parseFloat(getComputedStyle(element).fontSize) * 2}px`;
    });
  });
  await noHorizontalClipping(page);
  await reachable(page.getByRole('link', { name: 'GitHub', exact: true }));
  await reachable(page.locator('#home-button'));
  await reachable(page.locator('#guide-access'));
});

test('pinch magnification is not mistaken for an on-screen keyboard', async ({ page }) => {
  await page.goto('/#home');
  await page.locator('#guide-access').click();
  await page.locator('#guide-question').focus();
  await page.evaluate(() => {
    const viewport = new EventTarget();
    Object.assign(viewport, { height: innerHeight / 2, width: innerWidth / 2, offsetTop: 0, offsetLeft: 0, scale: 2 });
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true });
    document.querySelector<HTMLButtonElement>('#guide-expand')!.click();
  });
  await settle(page);
  await expect(page.locator('.studio-app')).toHaveAttribute('data-guide-keyboard', 'false');
});

test('keyboard visual viewport contracts, offsets, and restores the usable guide', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const viewport = new EventTarget();
    Object.assign(viewport, { height: 844, width: 390, offsetTop: 0, offsetLeft: 0, scale: 1 });
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true });
  });
  await page.goto('/#home');
  await page.locator('#guide-access').click();
  await page.locator('#guide-question').focus();
  await page.evaluate(() => {
    Object.assign(visualViewport!, { height: 380, offsetTop: 50 });
    visualViewport!.dispatchEvent(new Event('resize'));
  });
  await settle(page);
  await expect(page.locator('.studio-app')).toHaveAttribute('data-guide-keyboard', 'true');
  const input = (await page.locator('#guide-question').boundingBox())!;
  expect(input.y).toBeGreaterThanOrEqual(50);
  expect(input.y + input.height).toBeLessThanOrEqual(430);
  await reachable(page.locator('#guide-question'));
  await reachable(page.locator('#guide-access'));
  await page.evaluate(() => {
    Object.assign(visualViewport!, { height: 844, offsetTop: 0 });
    visualViewport!.dispatchEvent(new Event('resize'));
  });
  await settle(page);
  await expect(page.locator('.studio-app')).toHaveAttribute('data-guide-keyboard', 'false');
});

test('narrow guide and enlarged creator page pass accessibility scans', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/#about');
  await page.locator('#guide-access').click();
  await settle(page);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('archived Flipnotes and date captions fit phones, tablets and short windows', async ({ page }) => {
  for (const [width, height] of [[240, 320], [390, 844], [768, 1024], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/#about');
    await settle(page);
    await reachable(page.getByRole('link', { name: 'Next About page' }));
    await page.getByRole('link', { name: 'Next About page' }).click();
    await expect(page.locator('.flipnote-figure figcaption')).toHaveText('circa 2014');
    await noHorizontalClipping(page);
    const size = await page.locator('.flipnote-art').evaluate((element: HTMLImageElement) => ({
      naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight,
      fit: getComputedStyle(element).objectFit, rendering: getComputedStyle(element).imageRendering,
    }));
    await expect.poll(() => page.locator('.flipnote-art').evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth === 256)).toBe(true);
    expect(size.fit).toBe('contain');
    expect(size.rendering).toBe('pixelated');
    await reachable(page.getByRole('link', { name: 'Previous About page' }));
    await page.getByRole('link', { name: 'Next About page' }).click();
    await expect(page.locator('.flipnote-figure figcaption')).toHaveText('circa 2015');
  }
});

for (const [width, height] of [[240, 320], [390, 844], [844, 390], [1440, 1000]]) {
test(`all project story templates reflow without losing their controls or sources at ${width}x${height}`, async ({ page }) => {
  test.setTimeout(90000);
    await page.setViewportSize({ width, height });
    for (const project of projects) {
      const story = projectStories[project.id];
      await page.goto(`/#project/${project.id}/overview`);
      await settle(page);
      for (const [index, scene] of story.scenes.entries()) {
        await expect(page.locator('#story-heading')).toHaveText(scene.headline);
        await noHorizontalClipping(page);
        await reachable(page.locator('.story-sources-toggle'));
        if (index < story.scenes.length - 1) {
          await reachable(page.getByRole('button', { name: 'Next frame', exact: true }));
          await page.getByRole('button', { name: 'Next frame', exact: true }).click();
        }
      }
      await reachable(page.locator('.story-links a').first());
    }
});
}

test('story state survives foldable-sized resizing and its system diagram keeps real connections', async ({ page }) => {
  const flow = projectStories.repoquest.scenes.find(scene => scene.visual.type === 'flow')!;
  await page.goto(`/#projects?category=All&page=2&selected=repoquest&scene=${flow.id}`);
  await settle(page);
  for (const [width, height] of [[390, 844], [720, 720], [1368, 912], [280, 653]]) {
    await page.setViewportSize({ width, height });
    await settle(page);
    await noHorizontalClipping(page);
    await expect(page.locator('[data-story-player]')).toHaveAttribute('data-scene', flow.id);
    await expect(page.locator('.story-node')).toHaveCount(flow.visual.type === 'flow' ? flow.visual.nodes.length : 0);
    await expect(page.locator('.story-wires path')).toHaveCount(flow.visual.type === 'flow' ? flow.visual.edges.length * 2 : 0);
    await reachable(page.getByRole('button', { name: 'Expand flipbook', exact: true }));
  }
});

test('long author-supplied copy uses the template without horizontal clipping', async ({ page }) => {
  await page.setViewportSize({ width: 280, height: 653 });
  await page.goto('/#project/repoquest/overview');
  await settle(page);
  const scene: StoryScene = {
    ...projectStories.repoquest.scenes[0],
    headline: 'A longer project headline that still needs to remain completely readable',
    body: 'This controlled test fixture exercises a longer explanation without implying real project facts. '.repeat(4),
    visual: { type: 'roles', items: [
      { name: 'AnUnusuallyLongTechnologyNameWithoutSpaces', role: 'A detailed responsibility that wraps rather than being clipped.' },
      { name: 'Another component', role: 'A second responsibility with enough detail to require another line.' },
    ] },
  };
  const markup = renderStoryScene(scene, projects.find(project => project.id === 'repoquest')!);
  await page.locator('#story-canvas').evaluate((element, html) => { element.innerHTML = html; }, markup);
  await noHorizontalClipping(page);
  await reachable(page.getByRole('button', { name: 'Next frame', exact: true }));
  await reachable(page.locator('.story-sources-toggle'));
  expect(await page.locator('.story-viewport').evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
});

test('image scenes use the player canvas for the capture and one readable caption', async ({ page }) => {
  for (const [width, height] of [[320, 568], [390, 844], [844, 390], [1440, 1000]]) {
    await page.setViewportSize({ width, height });
    for (const project of projects.filter(item => item.image)) {
      const scene = projectStories[project.id].scenes.find(item => item.visual.type === 'image')!;
      await page.goto(`/#project/${project.id}/overview?scene=${scene.id}`);
      await settle(page);
      await expect(page.locator('.story-image img')).toBeVisible();
      await expect(page.locator('.story-scene figcaption')).toHaveText(scene.headline);
      await expect(page.locator('.story-body')).toHaveCount(0);
      for (const expanded of [false, true]) {
        if (expanded) {
          await page.getByRole('button', { name: 'Expand flipbook', exact: true }).click();
          await settle(page);
        }
        const geometry = await page.evaluate(() => {
          const viewport = document.querySelector('.story-viewport')!;
          const frame = document.querySelector('.story-image')!.getBoundingClientRect();
          const caption = document.querySelector('.story-scene figcaption')!.getBoundingClientRect();
          const image = document.querySelector<HTMLImageElement>('.story-image img')!;
          return {
            viewportWidth: viewport.clientWidth, viewportHeight: viewport.clientHeight,
            scrollHeight: viewport.scrollHeight, imageWidth: frame.width, imageHeight: frame.height, captionHeight: caption.height,
            fit: getComputedStyle(image).objectFit, loaded: image.complete && image.naturalWidth > 0,
          };
        });
        expect(geometry.loaded).toBe(true);
        expect(geometry.imageWidth).toBeGreaterThanOrEqual(geometry.viewportWidth - 2);
        // clientHeight rounds to whole pixels; DOMRect preserves fractional layout.
        expect(Math.abs(geometry.imageHeight + geometry.captionHeight - geometry.viewportHeight)).toBeLessThanOrEqual(1);
        expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.viewportHeight + 2);
        expect(geometry.imageHeight).toBeGreaterThan(geometry.viewportHeight * .6);
        expect(geometry.fit).toBe('contain');
      }
      await noHorizontalClipping(page);
      await reachable(page.getByRole('button', { name: 'Next frame', exact: true }));
    }
  }
});

test('image modal fits small screens, keeps zoom controls reachable, and restores focus', async ({ page }) => {
  for (const [width, height] of [[240, 320], [320, 568], [390, 844], [568, 320], [844, 390], [1440, 1000]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/#project/repoquest/overview?scene=watch-the-guide');
    await settle(page);
    const trigger = page.locator('[data-image-open]');
    await trigger.click();
    const dialog = page.locator('.image-viewer');
    await expect(dialog.getByRole('button', { name: 'Zoom in', exact: true })).toBeEnabled();
    await reachable(dialog.getByRole('button', { name: 'Close image' }));
    await reachable(dialog.getByRole('button', { name: 'Zoom in', exact: true }));
    const box = (await dialog.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.y + box.height).toBeLessThanOrEqual(height);
    const image = (await dialog.locator('img').boundingBox())!;
    const viewport = (await dialog.locator('.image-viewer-viewport').boundingBox())!;
    expect(image.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(image.height).toBeLessThanOrEqual(viewport.height + 1);
    await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await expect(dialog.locator('output')).toHaveText('200%');
    await reachable(dialog.getByRole('button', { name: 'Fit', exact: true }));
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page).toHaveURL(/scene=watch-the-guide$/);
  }
});

test('drawing recipes stay stepped and bounded across browsers and resizing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  for (const [width, height] of [[320, 568], [1440, 1000]]) {
    await page.setViewportSize({ width, height });
    for (const scene of projectStories.repoquest.scenes) {
      await page.goto(`/#project/repoquest/overview?scene=${scene.id}`);
      await page.clock.runFor(100);
      await expect(page.locator('#entry-screen')).toBeHidden();
      await page.evaluate(() => document.fonts.ready);
      await page.clock.runFor(100);
      await page.locator('.story-viewport').focus();
      await page.keyboard.press('Enter');
      await page.clock.runFor(140);
      expect(await page.locator('[data-story-player]').evaluate(element => element.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
      if (scene.visual.type === 'contrast') {
        const offset = await page.locator('.story-before svg path:not(.story-lightbox-stroke)').first().evaluate(path => parseFloat(getComputedStyle(path).strokeDashoffset));
        expect(offset).toBeGreaterThan(0);
        expect(offset).toBeLessThan(100);
      }
      await noHorizontalClipping(page);
      await page.clock.runFor(3000);
      await expect(page.locator('[data-story-player]')).toHaveAttribute('data-motion', 'idle');
      expect(await page.locator('[data-story-player]').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
      await noHorizontalClipping(page);
    }
  }
  await page.goto('/#project/repoquest/overview?scene=files-to-html');
  await page.clock.runFor(100);
  await page.locator('.story-viewport').focus();
  await page.keyboard.press('Enter');
  // Native resize delivery and its follow-up RAF must not be frozen by the test clock.
  await page.clock.resume();
  await page.setViewportSize({ width: 390, height: 844 });
  await settle(page);
  await expect(page.locator('[data-story-player]')).toHaveAttribute('data-motion', 'idle');
  await expect(page.locator('.story-wire-ink')).toHaveCount(0);
  await noHorizontalClipping(page);
});

test('hardware hinge segments never intersect the studio controls', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chromium CDP provides hardware display-feature emulation; other engines test ordinary reflow.');
  const session = await page.context().newCDPSession(page);
  for (const orientation of ['vertical', 'horizontal'] as const) {
    const offset = orientation === 'vertical' ? 360 : 420;
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: 744, height: 900, screenWidth: 744, screenHeight: 900,
      deviceScaleFactor: 1, mobile: true,
      displayFeature: { orientation, offset, maskLength: 24 },
    });
    await page.goto('/#projects');
    await settle(page);
    expect(await page.evaluate((direction) => matchMedia(`(${direction}-viewport-segments: 2)`).matches,
      orientation === 'vertical' ? 'horizontal' : 'vertical')).toBe(true);
    const box = (await page.locator('.studio-app').boundingBox())!;
    expect(orientation === 'vertical' ? box.x + box.width : box.y + box.height).toBeLessThanOrEqual(offset);
    await noHorizontalClipping(page);
    await reachable(page.locator('.open-project'));
    await page.locator('#guide-access').click();
    await reachable(page.locator('#guide-question'));
    await page.locator('#guide-minimize').click();
  }
});
