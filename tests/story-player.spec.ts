import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects, repoUrl } from '../src/projects';
import { projectStories } from '../src/stories';
import { readScreen } from '../src/navigation';

const player = (page: Page) => page.locator('[data-story-player]');
async function ready(page: Page, hash = '#projects?category=All&page=2&selected=repoquest') {
  await page.goto(`/${hash}`);
  await expect(page.locator('#entry-screen')).toBeHidden();
  await expect(player(page)).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
});
async function goFrame(page: Page, count: number) {
  for (let i = 0; i < count; i++) await page.getByRole('button', { name: 'Next frame', exact: true }).click();
}

test('all catalog projects expose the same six-frame data-driven player and verified source links', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const project of projects) {
    await ready(page, `#project/${project.id}/overview`);
    const story = projectStories[project.id];
    for (let i = 0; i < story.scenes.length; i++) {
      const scene = story.scenes[i];
      await expect(player(page)).toHaveAttribute('data-scene', scene.id);
      await expect(page.locator('#story-heading')).toHaveText(scene.headline);
      if (scene.visual.type === 'image') {
        await expect(page.locator('.story-body')).toHaveCount(0);
        await expect(page.locator('.story-scene figcaption')).toHaveText(scene.headline);
      } else await expect(page.locator('.story-body')).toHaveText(scene.body);
      await expect(player(page)).toHaveAttribute('data-playing', 'false');
      await page.getByRole('button', { name: 'Show story sources' }).click();
      if (scene.visual.type === 'image') await expect(page.locator('.story-supporting-copy')).toHaveText(scene.body);
      const links = page.locator('#story-sources a');
      await expect(links).toHaveCount(scene.sources.length);
      for (let j = 0; j < scene.sources.length; j++) {
        await expect(links.nth(j)).toHaveAttribute('href', story.sources.find(source => source.id === scene.sources[j])!.url);
      }
      await page.getByRole('button', { name: 'Show story sources' }).click();
      if (i < story.scenes.length - 1) await goFrame(page, 1);
    }
    await expect(page.getByRole('button', { name: 'Next frame', exact: true })).toBeDisabled();
    await expect(page.locator('.story-links a')).toHaveCount(Number(!!repoUrl(project)) + Number(!!project.site));
    await expect(page.locator('.story-links a').first()).toHaveAttribute('href', repoUrl(project) || project.site!);
  }
});

test('manual upper-screen navigation never alters the catalog or its scroll and selection', async ({ page }) => {
  await ready(page);
  await page.locator('.library-content').evaluate(element => { element.dataset.retained = 'true'; });
  await page.setViewportSize({ width: 320, height: 600 });
  await page.locator('.library-content').evaluate(element => { element.style.minHeight = '500px'; });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.locator('#lower-scroll').evaluate(element => { element.scrollTop = 55; });
  const scroll = await page.locator('#lower-scroll').evaluate(element => element.scrollTop);
  const before = await page.locator('.library-content').innerHTML();
  await player(page).evaluate((element: HTMLElement) => element.focus({ preventScroll: true }));
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#story-heading')).toHaveText(projectStories.repoquest.scenes[2].headline);
  await expect(page.locator('.library-content')).toHaveAttribute('data-retained', 'true');
  // Only Open's target gains the selected frame; catalog content is untouched.
  expect((await page.locator('.library-content').innerHTML()).replace(/\?scene=[^"]+/g, '')).toBe(before.replace(/\?scene=[^"]+/g, ''));
  expect(await page.locator('#lower-scroll').evaluate(element => element.scrollTop)).toBe(scroll);
  await expect(page.getByRole('button', { name: 'Preview RepoQuest', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.page-count')).toHaveText(`2 / ${Math.ceil(projects.length / 4)}`);
  await expect(page.locator('.story-player')).toBeFocused();
});

test('timed playback is opt-in, pauses precisely, seeks deterministically and ends on a readable final frame', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto('/#projects?category=All&page=2&selected=repoquest');
  await page.clock.runFor(100);
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.clock.runFor(100);
  const scenes = projectStories.repoquest.scenes;
  await page.clock.runFor(12000);
  await expect(player(page)).toHaveAttribute('data-scene', scenes[0].id);
  await page.getByRole('button', { name: 'Play flipbook', exact: true }).click();
  await page.clock.runFor((scenes[0].duration + .2) * 1000);
  await expect(player(page)).toHaveAttribute('data-scene', scenes[1].id);
  await page.getByRole('button', { name: 'Pause flipbook', exact: true }).click();
  await page.clock.runFor(20000);
  await expect(player(page)).toHaveAttribute('data-scene', scenes[1].id);
  await page.getByRole('slider', { name: 'Flipbook progress' }).fill(String(scenes.slice(0, 3).reduce((sum, scene) => sum + scene.duration, 0) + 1));
  await expect(player(page)).toHaveAttribute('data-scene', scenes[3].id);
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
  await page.getByRole('button', { name: 'Play flipbook', exact: true }).click();
  await page.clock.runFor(65000);
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
  await expect(page.locator('#story-heading')).toHaveText(scenes.at(-1)!.headline);
  await expect(page.locator('.story-links')).toBeVisible();
  await page.getByRole('button', { name: 'Restart flipbook' }).click();
  await expect(player(page)).toHaveAttribute('data-scene', scenes[0].id);
});

test('Open and Back keep the same frame and project while supporting copy remains deliberate', async ({ page }) => {
  await ready(page);
  await goFrame(page, 2);
  const scene = projectStories.repoquest.scenes[2].id;
  const library = page.url();
  await page.locator('.open-project').click();
  await expect(page).toHaveURL(new RegExp(`#project/repoquest/overview\\?scene=${scene}$`));
  await expect(page.locator('.detail-description')).toContainText('TypeScript CLI');
  await expect(page.locator('.library-content')).toHaveCount(0);
  await expect(player(page)).toHaveAttribute('data-scene', scene);
  await page.getByRole('link', { name: "What's inside", exact: true }).click();
  await expect(player(page)).toHaveAttribute('data-scene', scene);
  await page.getByRole('link', { name: 'Back to project library' }).click();
  await expect(page).toHaveURL(library);
  await expect(player(page)).toHaveAttribute('data-scene', scene);
  await expect(page.locator('.open-project')).toBeFocused();
});

test('typing and catalog keys remain independent; ink and the guide pause playback', async ({ page }) => {
  await page.route('**/api/guide/status', route => route.fulfill({ json: { available: true, mode: 'copilot-cli' } }));
  await ready(page);
  await page.getByRole('button', { name: 'Play flipbook', exact: true }).click();
  await page.locator('#ink-toggle').click();
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
  await page.locator('#ink-toggle').click();
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
  await page.getByRole('button', { name: 'Play flipbook', exact: true }).click();
  await page.locator('#guide-access').click();
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
  const scene = await player(page).getAttribute('data-scene');
  await page.locator('#guide-question').fill('Draft question');
  await page.keyboard.press('ArrowRight');
  await expect(player(page)).toHaveAttribute('data-scene', scene!);
  await page.locator('#guide-minimize').click();
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
  await page.getByRole('button', { name: 'Preview RepoQuest', exact: true }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(player(page)).toHaveAttribute('data-project-id', 'just-play');
  await expect(player(page)).toHaveAttribute('data-scene', projectStories['just-play'].scenes[0].id);
});

test('scene ink is isolated, survives Open, and lower catalog ink persists across frames', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await page.locator('#ink-toggle').click();
  await page.locator('#ink-tools-toggle').click();
  await page.locator('#ink-stamp').click();
  await page.keyboard.press('Escape');
  const marked = await page.locator('.screen-ink-canvas[data-pane=upper]').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  const lower = page.locator('.screen-ink-canvas[data-pane=lower]');
  const point = await page.locator('#lower-content').evaluate(element => {
    const bounds = element.getBoundingClientRect();
    return { x: bounds.left + 3, y: bounds.top + 3 };
  });
  await page.mouse.click(point.x, point.y);
  const lowerMarks = await lower.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await goFrame(page, 1);
  expect(await lower.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(lowerMarks);
  await expect(page.locator('.screen-ink-canvas[data-pane=upper]')).toHaveAttribute('data-action-count', '1');
  await page.getByRole('button', { name: 'Previous frame', exact: true }).click();
  expect(await page.locator('.screen-ink-canvas[data-pane=upper]').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(marked);
  await page.locator('.open-project').click();
  expect(await page.locator('.screen-ink-canvas[data-pane=upper]').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(marked);
});

test('expanded player retains catalog content and reduces cleanly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  const before = (await player(page).boundingBox())!.height;
  const catalog = await page.locator('.project-grid').innerHTML();
  await page.getByRole('button', { name: 'Expand flipbook', exact: true }).click();
  expect((await player(page).boundingBox())!.height).toBeGreaterThan(before);
  expect(await page.locator('.project-grid').innerHTML()).toBe(catalog);
  await page.getByRole('button', { name: 'Reduce flipbook', exact: true }).click();
  expect((await player(page).boundingBox())!.height).toBeCloseTo(before);
});

test('hidden tabs and rapid project selection cancel old playback without advancing the catalog', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto('/#projects?category=All&page=2&selected=repoquest');
  await page.clock.runFor(100);
  await page.getByRole('button', { name: 'Play flipbook', exact: true }).click();
  await page.clock.runFor(1000);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
  await page.clock.runFor(20000);
  await expect(player(page)).toHaveAttribute('data-scene', projectStories.repoquest.scenes[0].id);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.getByRole('button', { name: 'Play flipbook', exact: true }).click();
  await page.getByRole('button', { name: 'Preview Just Play', exact: true }).click();
  await page.clock.runFor(12000);
  await expect(player(page)).toHaveAttribute('data-scene', projectStories['just-play'].scenes[0].id);
  await expect(player(page)).toHaveAttribute('data-playing', 'false');
  await page.getByRole('button', { name: 'Play flipbook', exact: true }).click();
  await page.locator('#home-button').click();
  await page.clock.runFor(12000);
  await expect(player(page)).toHaveCount(0);
});

test('reduced motion and broken images preserve complete readable content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/images/repoquest.jpg', route => route.abort());
  await ready(page);
  await expect(page.getByRole('button', { name: 'Play flipbook' })).toBeDisabled();
  const imageIndex = projectStories.repoquest.scenes.findIndex(scene => scene.visual.type === 'image');
  expect(imageIndex).toBeGreaterThanOrEqual(0);
  await goFrame(page, imageIndex);
  await expect(page.locator('.story-image-error')).toBeVisible();
  await expect(page.locator('#story-heading')).not.toBeEmpty();
  await page.getByRole('button', { name: 'Show story sources' }).click();
  await expect(page.locator('.story-supporting-copy')).not.toBeEmpty();
  expect(await player(page).evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
});

test('each project has distinct workflow drawings rather than generic success decorations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const drawings = new Set<string>();
  for (const project of projects) {
    await ready(page, `#project/${project.id}/overview`);
    const before = page.locator('.story-before .story-project-symbol');
    const after = page.locator('.story-after .story-project-symbol');
    await expect(before).toHaveAttribute('data-symbol', `${project.illustration}-before`);
    await expect(after).toHaveAttribute('data-symbol', `${project.illustration}-after`);
    const pair = await before.innerHTML() + await after.innerHTML();
    expect(drawings.has(pair)).toBe(false);
    drawings.add(pair);
    expect(await before.innerHTML()).not.toBe(await after.innerHTML());
    await expect(page.locator('.story-scribble, .story-check')).toHaveCount(0);
  }
  expect(drawings.size).toBe(projects.length);
});

test('direct scenes validate their project and are accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const scene = projectStories.repoquest.scenes[2].id;
  await ready(page, `#project/repoquest/overview?scene=${scene}`);
  await expect(player(page)).toHaveAttribute('data-scene', scene);
  await page.evaluate(() => document.fonts.ready);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  expect(readScreen('#project/repoquest/overview?scene=missing').kind).toBe('not-found');
  expect(readScreen('#projects?selected=repoquest&scene=missing').kind).toBe('not-found');
});

test('every frame is keyboard-accessible and passes automated accessibility checks', async ({ page }) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  for (let index = 0; index < projectStories.repoquest.scenes.length; index++) {
    await page.evaluate(() => document.fonts.ready);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    if (index < projectStories.repoquest.scenes.length - 1) await goFrame(page, 1);
  }
});
