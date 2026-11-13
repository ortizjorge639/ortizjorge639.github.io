import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../src/projects';
import { projectStories } from '../src/stories';
import { readScreen } from '../src/navigation';

const currentScreen = (page: Page) => page.locator('.studio-app');
const assertScreen = (page: Page, name: string) => expect(currentScreen(page)).toHaveAttribute('data-screen', name);
const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

test('home is an app, with live clock, original palette, and no stacked website sections', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#home');
  await assertScreen(page, 'home');
  await expect(page.locator('.studio-logo')).toHaveText("Joji'sStudio");
  await expect(page.locator('.studio-logo')).toHaveAttribute('aria-label', "Joji's Studio");
  await expect(page.locator('.title-caption')).toHaveText('A portfolio of apps and AI projects.');
  await expect(page.locator('.title-credit')).toHaveText('© 2026 /ortizjorge639');
  await expect(page.locator('.launcher')).toHaveCount(2);
  await expect(page.locator('.project-tile')).toHaveCount(0);
  await expect(page.locator('header, footer, #project-dialog, .featured-section')).toHaveCount(0);
  await expect(page.locator('#studio-clock')).toHaveText(/^\d{2}:\d{2}$/);
  await expect(page.locator('.screen-status #studio-date')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
  await expect(page.locator('.menu-heading #studio-date')).toHaveCount(0);
  const palette = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return ['--blue', '--red', '--paper'].map((name) => root.getPropertyValue(name).trim());
  });
  expect(palette).toEqual(['#3157bc', '#c53f2e', '#fffdf6']);
  expect(errors).toEqual([]);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-studio-home.png` });
});

test('date and clock stay in the status strip across pages and narrow viewports', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#home');
  await expect(page.locator('#entry-screen')).toBeHidden();
  for (const width of [530, 390, 320, 240]) {
    await page.setViewportSize({ width, height: 844 });
    for (const hash of ['#home', '#projects', '#about']) {
      await page.evaluate((value) => { location.hash = value; }, hash);
      await expect(page.locator('.screen-status #studio-date')).toBeVisible();
      await expect(page.locator('.screen-status #studio-clock')).toBeVisible();
      await expect(page.locator('#studio-date')).toHaveCount(1);
      expect(await page.locator('.screen-status').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      const sizes = await page.locator('.screen-status').evaluate(el =>
        ['#guide-access', '#screen-label', '#studio-date', '#studio-clock', '#open-help']
          .map(selector => getComputedStyle(el.querySelector(selector)!).fontSize));
      expect(new Set(sizes).size).toBe(1);
    }
  }
});

test('creator intro preserves Joji and the tagline with accurate professional and gaming context', async ({ page }) => {
  await page.goto('/#about');
  await expect(page.locator('#entry-screen')).toBeHidden();
  const intro = page.locator('.creator-content');
  await expect(page.locator('.creator-screen h1#screen-title')).toHaveText('Always making. Always learning.');
  await expect(page.locator('#screen-title')).toHaveCount(1);
  await expect(intro.getByRole('heading')).toHaveCount(0);
  await expect(intro).toContainText("Hey, I'm Jorge (also Joji).");
  await expect(intro).toContainText('I work at Microsoft');
  await expect(intro).toContainText("I'm also a former Flipnote Studio animator.");
  await expect(intro).toContainText('cloud solutions architecture, AI engineering, and human-centered design');
  await expect(intro).not.toContainText("I'm not developing games yet.");
  await expect(intro).toContainText('working through a game backlog');
  await expect(intro.locator(':scope > p')).toHaveCount(2);
  await expect(intro.locator('.creator-note')).toHaveCount(0);
  await expect(intro.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', 'https://github.com/ortizjorge639');
  await expect(intro.locator('.social-links .social-logo')).toHaveCount(2);
  await expect(page.locator('#back-button span')).toHaveCount(0);
  await expect(page.locator('#back-button svg')).toBeVisible();
  await expect(page.locator('#back-button')).toHaveAttribute('aria-label', 'Back to main menu');
  await expect(intro.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('href', 'https://www.linkedin.com/in/jorgeortizflores/');
  await expect(intro.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('rel', 'noopener noreferrer');
  await page.locator('#back-button').click();
  await page.locator('.launcher[href="#about"]').click();
  await expect(page.locator('#screen-title')).toBeFocused();
  await page.locator('#back-button').click();
  await page.locator('#guide-access').click();
  await page.locator('.launcher[href="#about"]').click();
  await expect(page.locator('#lower-scroll')).toBeFocused();
});

test('home social row uses labeled logo buttons with confirmed profile destinations', async ({ page }) => {
  await page.goto('/#home');
  await expect(page.locator('#entry-screen')).toBeHidden();
  const socials = page.getByRole('navigation', { name: 'Find Joji online' });
  await expect(socials.getByRole('link')).toHaveCount(2);
  for (const [name, href, asset] of [
    ['GitHub', 'https://github.com/ortizjorge639', 'github'],
    ['LinkedIn', 'https://www.linkedin.com/in/jorgeortizflores/', 'linkedin'],
  ]) {
    const link = socials.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAttribute('target', '_blank');
    const bounds = (await link.boundingBox())!;
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    const response = await page.request.get(`/icons/${asset}.svg`);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain('<svg');
  }
});

test('opening is paced on reload and bypassed by deep links', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-16T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-09-16T12:00:01Z'));
  await page.goto('/');
  await page.clock.runFor(100);
  await assertScreen(page, 'opening');
  await expect(page.locator('#entry-screen button')).toHaveCount(0);
  await page.clock.runFor(1600);
  await assertScreen(page, 'home');
  await page.reload();
  await page.clock.runFor(100);
  await assertScreen(page, 'opening');
  await page.clock.runFor(600);
  await assertScreen(page, 'opening');
  await page.clock.runFor(1000);
  await assertScreen(page, 'home');
  const direct = await page.context().newPage();
  await direct.goto('/#project/repoquest/overview');
  await assertScreen(direct, 'project');
  await direct.goto('/');
  await direct.clock.runFor(1700);
  await assertScreen(direct, 'home');
  await direct.close();
});

test('entry no longer depends on session storage', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
  });
  await page.goto('/');
  await assertScreen(page, 'home');
  await expect(page.locator('#app-notice')).toBeHidden();
  await page.locator('.launcher[href="#projects"]').click();
  await assertScreen(page, 'projects');
});

test('library selection, bounded pagination, and category filters cover the real catalog', async ({ page }) => {
  await page.goto('/#projects');
  await expect(page.locator('.screen-navigation #library-pagination .page-controls')).toBeVisible();
  await expect(page.locator('.library-controls .page-controls')).toHaveCount(0);
  await expect(page.locator('.library-controls .open-project')).toBeVisible();
  await expect(page.locator('.project-tile')).toHaveCount(4);
  await expect(page.locator('.story-topline h2')).toHaveText('Lineage');
  await expect(page.getByRole('button', { name: 'Previous library page' })).toBeDisabled();
  await page.getByRole('link', { name: 'Next library page' }).click();
  await expect(page.locator('.project-tile')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Next library page' })).toBeDisabled();
  await page.getByRole('button', { name: 'Preview RepoQuest', exact: true }).click();
  await expect(page.locator('.story-topline h2')).toHaveText('RepoQuest');
  await expect(page.getByRole('link', { name: 'Open RepoQuest', exact: true })).toBeVisible();
  const expected = { Gaming: 2, AI: 3, Media: 2, Tech: 5 };
  for (const [filter, count] of Object.entries(expected)) {
    await page.getByRole('navigation', { name: 'Project categories' }).getByRole('link', { name: filter, exact: true }).click();
    await expect(page.locator('#result-count')).toHaveText(`${count} projects`);
    await expect(page.locator('.project-tile')).toHaveCount(Math.min(4, count));
    await expect(page.locator('.page-count')).toHaveText(`1 / ${Math.ceil(count / 4)}`);
  }
  await page.getByRole('navigation', { name: 'Project categories' }).getByRole('link', { name: 'All', exact: true }).click();
  await expect(page.locator('#result-count')).toHaveText('7 projects');
});

test('footer pagination is library-only and remains usable beside expanded Ink controls', async ({ page }) => {
  await page.goto('/#projects');
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.locator('#ink-toggle').click();
  for (const width of [530, 390, 320, 240]) {
    await page.setViewportSize({ width, height: 844 });
    const footer = page.locator('.screen-navigation');
    await expect(footer.getByRole('link', { name: 'Next library page' })).toBeInViewport();
    await expect(page.locator('#ink-sound')).toBeInViewport();
    expect(await footer.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  await page.locator('#library-pagination').getByRole('link', { name: 'Next library page' }).click();
  await expect(page.locator('#library-pagination .page-count')).toHaveText('2 / 2');
  await page.locator('.open-project').click();
  await expect(page.locator('#library-pagination')).toBeHidden();
  await expect(page.locator('#library-pagination .page-controls')).toHaveCount(0);
});

test('project pages retain every fact, capture, caveat and source', async ({ page }) => {
  for (const project of projects) {
    await page.goto(`/#project/${project.id}/overview`);
    await assertScreen(page, 'project');
    await expect(page.locator('.story-topline h2')).toHaveText(project.title);
    await expect(page.locator('.detail-description')).toHaveText(project.description);
    await expect(page.locator('.detail-status')).toContainText(project.status);
    await expect(page.getByRole('button', { name: 'Previous detail page' })).toBeDisabled();
    if (project.image) {
      const imageIndex = projectStories[project.id].scenes.findIndex(scene => scene.visual.type === 'image');
      expect(imageIndex).toBeGreaterThanOrEqual(0);
      for (let i = 0; i < imageIndex; i++) await page.getByRole('button', { name: 'Next frame', exact: true }).click();
      const image = page.locator('.story-image img');
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    } else await expect(page.locator('.story-visual')).toBeVisible();
    await page.getByRole('link', { name: "What's inside", exact: true }).click();
    await expect(page.locator('.capabilities li')).toHaveText(project.capabilities);
    await expect(page.locator('.stack-tags span')).toHaveText(project.stack);
    await page.getByRole('link', { name: 'Links', exact: true }).click();
    await expect(page.locator('.project-note')).toHaveText(project.note);
    await expect(page.getByRole('link', { name: 'View repository', exact: true })).toHaveAttribute('href', `https://github.com/ortizjorge639/${project.id}`);
    await expect(page.locator('.source-note')).toHaveAttribute('href', `https://github.com/ortizjorge639/${project.id}#readme`);
    if (project.site) await expect(page.getByRole('link', { name: 'Project walkthrough' })).toHaveAttribute('href', project.site);
    await expect(page.getByRole('button', { name: 'Next detail page' })).toBeDisabled();
  }
});

test('screen Back and browser history restore the exact library and focus', async ({ page }) => {
  await page.goto('/#home');
  await page.locator('.launcher[href="#projects"]').click();
  await page.getByRole('link', { name: 'Next library page' }).click();
  await page.getByRole('button', { name: 'Preview RepoQuest', exact: true }).click();
  const library = page.url();
  await page.getByRole('link', { name: 'Open RepoQuest', exact: true }).click();
  await expect(page.locator('#screen-title')).toBeFocused();
  await page.getByRole('link', { name: 'Links', exact: true }).click();
  await page.getByRole('link', { name: 'Back to project library' }).click();
  await expect(page).toHaveURL(library);
  await expect(page.getByRole('button', { name: 'Preview RepoQuest', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: 'Open RepoQuest', exact: true })).toBeFocused();
  await page.goForward();
  await assertScreen(page, 'project');
  await expect(page.locator('#screen-title')).toHaveText('Links');
  await page.goBack();
  await expect(page).toHaveURL(library);
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await assertScreen(page, 'home');
});

test('help returns to its invoking screen and Escape performs one action', async ({ page }) => {
  await page.goto('/#project/repoquest/inside');
  await page.getByRole('link', { name: 'Studio help', exact: true }).click();
  await assertScreen(page, 'help');
  await page.getByRole('link', { name: 'Next help page' }).click();
  await expect(page.locator('#screen-title')).toHaveText('Make your mark');
  await page.keyboard.press('Escape');
  await assertScreen(page, 'project');
  await expect(page.locator('#screen-title')).toHaveText("What's inside");
  await expect(page.locator('#open-help')).toBeFocused();
  await page.locator('#ink-toggle').click();
  await page.locator('#ink-tools-toggle').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#ink-panel')).toBeHidden();
  await assertScreen(page, 'project');
  await page.keyboard.press('Escape');
  await expect(page.locator('#ink-toggle')).toHaveAttribute('aria-pressed', 'false');
  await assertScreen(page, 'project');
  await page.keyboard.press('Escape');
  await assertScreen(page, 'projects');
});

test('keyboard preview selection and repeated navigation never leave stale screens', async ({ page }) => {
  await page.goto('/#projects');
  await page.getByRole('button', { name: 'Preview Lineage', exact: true }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.story-topline h2')).toHaveText('The Batch');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.story-topline h2')).toHaveText('After the meeting');
  await expect(page.getByRole('button', { name: 'Preview After the meeting', exact: true })).toBeFocused();
  await page.evaluate(() => {
    for (const hash of ['#about', '#home', '#projects', '#project/repoquest/links']) location.hash = hash;
  });
  await assertScreen(page, 'project');
  await expect(page.locator('#screen-title')).toHaveText('Links');
  await expect(page.locator('.project-tile')).toHaveCount(0);
});

test('all active screens pass automated accessibility checks', async ({ page }) => {
  for (const hash of ['home', 'projects', 'project/repoquest/overview', 'project/repoquest/inside', 'project/repoquest/links', 'about', 'help', 'help/2', 'help/3', 'missing']) {
    await page.goto(`/#${hash}`);
    await expect(page.locator('#entry-screen')).toBeHidden();
    await page.evaluate(() => document.fonts.ready);
    expect((await scan(page)).violations, `accessibility on #${hash}`).toEqual([]);
  }
});

test('dual displays fit the viewport, use the combined ratio, and never scroll the document', async ({ page }) => {
  for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [320, 700], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/#projects');
    const app = (await currentScreen(page).boundingBox())!;
    const top = (await page.locator('.upper-screen').boundingBox())!;
    const bottom = (await page.locator('.lower-screen').boundingBox())!;
    expect(bottom.y).toBeCloseTo(top.y + top.height, 0);
    expect(bottom.x).toBe(top.x);
    expect(app.x).toBeGreaterThanOrEqual(0);
    expect(app.y).toBeGreaterThanOrEqual(0);
    expect(app.x + app.width).toBeLessThanOrEqual(width + 1);
    expect(app.y + app.height).toBeLessThanOrEqual(height + 1);
    if (height > 640) expect(app.width / app.height).toBeCloseTo(1878 / 2670, 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight)).toBe(true);
    await expect(page.locator('#home-button')).toBeInViewport();
    await expect(page.locator('#ink-toggle')).toBeInViewport();
  }
});

test('enlarged content stays readable with keyboard-accessible screen-local overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/#about');
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.addStyleTag({ content: '#lower-content p { font-size: 28px; }' });
  expect(await page.locator('#lower-scroll').evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await page.locator('#lower-scroll').focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('motion has bounded durations, reduced-motion bypasses it, and sound starts on', async ({ page }) => {
  await page.goto('/#home');
  await assertScreen(page, 'home');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'true');
  const durations = await page.evaluate(() => {
    document.querySelector<HTMLAnchorElement>('.launcher[href="#projects"]')!.click();
    return document.querySelector('#lower-content')!.getAnimations().map((animation) => animation.effect?.getTiming().duration);
  });
  expect(durations).toEqual([160]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await assertScreen(page, 'home');
  await page.locator('.launcher[href="#projects"]').click();
  expect(await page.locator('#lower-content').evaluate((element) => element.getAnimations().length)).toBe(0);
  await page.locator('#sound-toggle').click();
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('standard phone menu and library keep primary actions visible without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['home', 'projects']) {
    await page.goto(`/#${route}`);
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.locator('#lower-scroll').evaluate((element) => element.scrollHeight <= element.clientHeight + 1), { message: route }).toBe(true);
    if (route === 'projects') await expect(page.getByRole('link', { name: 'Open Lineage' })).toBeInViewport({ ratio: 1 });
  }
});

test('invalid routes are explicit and recoverable', async ({ page }) => {
  for (const hash of ['#missing', '#project/no-such-project/overview', '#project/repoquest/nope', '#projects?page=99', '#projects?category=Other', '#help/4', '#project/%/overview']) {
    await page.goto(`/${hash}`);
    await assertScreen(page, 'not-found');
    await expect(page.getByRole('heading', { name: 'That page is not here.' })).toBeVisible();
    await page.getByRole('link', { name: 'View projects', exact: true }).click();
    await assertScreen(page, 'projects');
  }
});

test('route parser rejects duplicate, malformed, and out-of-range parameters', () => {
  for (const hash of ['#projects?page=1&page=2', '#projects?page=-1', '#projects?page=1.5', '#projects?category=AI&selected=repoquest', '#projects?bad=true', '#about?bad=1', '#help/1/2']) {
    expect(readScreen(hash).kind, hash).toBe('not-found');
  }
  expect(readScreen('#project/repoquest').kind).toBe('project');
  expect(readScreen('#projects?category=Gaming').kind).toBe('projects');
});
