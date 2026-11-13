import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const citation = {
  id: 'lineage-readme-1', title: 'Lineage · README', projectId: 'web-context-graph',
  url: `https://github.com/ortizjorge639/web-context-graph/blob/${'a'.repeat(40)}/README.md`,
};
const reply = (contextProjectId: string | null = null) => ({
  answer: 'Lineage is a local-first workspace for branching conversations. The public notes describe a Git-backed vault.',
  citations: [citation], suggestedProjects: ['web-context-graph'], contextProjectId,
});
async function bridge(page: Page) {
  await page.route('**/api/guide/status', (route) => route.fulfill({ json: { available: true, mode: 'copilot-cli', sourceCount: 14, snapshotDate: '2026-09-16' } }));
}
async function open(page: Page, hash = '#home') {
  await bridge(page);
  await page.goto(`/${hash}`);
  await page.locator('#frog-trigger').click();
  await expect(page.locator('#guide-panel')).toBeVisible();
  await expect(page.locator('#guide-send')).toBeEnabled();
}
async function send(page: Page, question: string) {
  await page.locator('#guide-question').fill(question);
  await page.locator('#guide-send').click();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('frog greets near the home mark then perches on the upper display without model calls', async ({ page }) => {
  const apiCalls: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/api/guide')) apiCalls.push(request.url()); });
  await page.goto('/#home');
  const home = (await page.locator('#frog-trigger').boundingBox())!;
  const upper = (await page.locator('.upper-screen').boundingBox())!;
  expect(home.x).toBeGreaterThan(upper.x + upper.width / 2);
  expect(home.y + home.height).toBeLessThan(upper.y + upper.height);
  await page.locator('.launcher[href="#projects"]').click();
  const perch = (await page.locator('#frog-trigger').boundingBox())!;
  expect(perch.x).toBeLessThan(upper.x + 20);
  expect(perch.y).toBeGreaterThan(upper.y + upper.height - 70);
  expect(apiCalls).toEqual([]);
  await expect(page.locator('#guide-panel')).toBeHidden();
});

test('guide is non-modal; project browsing updates context without resetting the conversation', async ({ page }) => {
  let captured: unknown;
  await page.route('**/api/guide/chat', async (route) => {
    captured = route.request().postDataJSON();
    await route.fulfill({ json: reply('web-context-graph') });
  });
  await open(page, '#projects');
  await expect(page.locator('#upper-scroll')).toHaveAttribute('inert', '');
  await expect(page.locator('#guide-panel')).not.toHaveAttribute('aria-modal', 'true');
  await send(page, 'What does this project do?');
  await expect(page.locator('.guide-message-assistant')).toContainText('local-first workspace');
  expect(captured).toMatchObject({ question: 'What does this project do?', projectId: 'web-context-graph', history: [] });
  await page.getByRole('button', { name: 'Preview The Batch', exact: true }).click();
  await expect(page.locator('#guide-context-label')).toHaveText('Next question: The Batch');
  await expect(page.locator('.guide-message-assistant')).toHaveCount(1);
  await page.locator('#guide-question').fill('A draft to keep');
  await page.locator('#guide-minimize').click();
  await expect(page.locator('#guide-panel')).toBeHidden();
  await expect(page.locator('#frog-trigger')).toBeFocused();
  await page.locator('#frog-trigger').click();
  await expect(page.locator('#guide-question')).toHaveValue('A draft to keep');
  await expect(page.locator('.guide-message-assistant')).toHaveCount(1);
});

test('sources are safe links and project buttons navigate only on explicit clicks', async ({ page }) => {
  await page.route('**/api/guide/chat', (route) => route.fulfill({ json: reply() }));
  await open(page);
  await send(page, 'Which projects run locally?');
  const source = page.getByRole('link', { name: 'Lineage · README', exact: true });
  await expect(source).toHaveAttribute('href', citation.url);
  await expect(source).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page).toHaveURL(/#home$/);
  await page.getByRole('button', { name: 'Open Lineage', exact: false }).click();
  await expect(page).toHaveURL(/#project\/web-context-graph\/overview$/);
  await expect(page.locator('#guide-panel')).toBeVisible();
  await expect(page.locator('.guide-message-assistant')).toHaveCount(1);
});

test('a response keeps its submitted context even when browsing changes underneath', async ({ page }) => {
  let release: (() => void) | undefined;
  const delayed = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/guide/chat', async (route) => {
    await delayed;
    await route.fulfill({ json: reply('web-context-graph') });
  });
  await open(page, '#projects');
  await send(page, 'What does this project do?');
  await expect(page.locator('.guide-root')).toHaveAttribute('data-phase', 'thinking');
  await page.getByRole('button', { name: 'Preview The Batch', exact: true }).click();
  await expect(page.locator('#guide-context-label')).toContainText('The Batch');
  release!();
  await expect(page.locator('.guide-message-assistant .guide-message-label')).toContainText('Lineage');
  await expect(page.locator('#guide-context-label')).toContainText('The Batch');
});

test('stopped, unavailable, malformed and unsupported answers are distinct', async ({ page }) => {
  await page.route('**/api/guide/chat', async (route) => {
    const question = route.request().postDataJSON().question;
    if (question === 'Unsupported') await route.fulfill({ json: { answer: 'The approved notes do not establish that.', citations: [], contextProjectId: null } });
    else if (question === 'Malformed') await route.fulfill({ json: { ...reply(), citations: [{ ...citation, url: 'javascript:alert(1)' }] } });
    else await route.fulfill({ status: 429, json: { code: 'rate_limited', error: 'The local guide is busy. Try again shortly.' } });
  });
  await open(page);
  await send(page, 'Unsupported');
  await expect(page.locator('.guide-message-assistant')).toContainText('do not establish that');
  await expect(page.locator('.guide-sources a')).toHaveCount(0);
  await send(page, 'Malformed');
  await expect(page.locator('#guide-feedback-text')).toContainText("couldn't verify");
  await expect(page.locator('.guide-message-assistant')).toHaveCount(1);
  await send(page, 'Busy');
  await expect(page.locator('#guide-feedback-text')).toContainText('busy');
  await expect(page.locator('#guide-retry')).toBeVisible();
});

test('stop cancels a pending request without appending a fake answer', async ({ page }) => {
  await page.route('**/api/guide/chat', () => new Promise(() => {}));
  await open(page);
  await send(page, 'A question to stop');
  await expect(page.locator('#guide-stop')).toBeVisible();
  await page.locator('#guide-stop').click();
  await expect(page.locator('#guide-feedback-text')).toContainText('Stopped.');
  await expect(page.locator('.guide-message-assistant')).toHaveCount(0);
  await expect(page.locator('#guide-question')).toBeEnabled();
  await expect(page.locator('#guide-retry')).toBeVisible();
});

test('hide, restore and explicit clear preserve ink and respect focused Escape priority', async ({ page }) => {
  await page.route('**/api/guide/chat', (route) => route.fulfill({ json: reply() }));
  await open(page);
  await send(page, 'Where should I start?');
  await expect(page.locator('.guide-message-assistant')).toHaveCount(1);
  await page.locator('#ink-toggle').click();
  await page.locator('#ink-tools-toggle').click();
  await page.locator('#ink-stamp').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#ink-panel')).toBeHidden();
  await expect(page.locator('#guide-panel')).toBeVisible();
  await page.locator('#guide-question').focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('#guide-panel')).toBeHidden();
  await expect(page.locator('#ink-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#frog-trigger').click();
  await page.getByLabel('Guide options', { exact: true }).click();
  await page.locator('#guide-hide').click();
  await expect(page.locator('#frog-trigger')).toBeHidden();
  await expect(page.locator('#guide-access')).toBeFocused();
  await page.locator('#guide-access').click();
  await expect(page.locator('.guide-message-assistant')).toHaveCount(1);
  await page.getByLabel('Guide options', { exact: true }).click();
  await page.locator('#guide-clear').click();
  await expect(page.locator('.guide-message-assistant')).toHaveCount(1);
  await page.getByRole('button', { name: 'Confirm clear' }).click();
  await expect(page.locator('.guide-message-assistant')).toHaveCount(0);
  await expect(page.locator('.screen-ink-canvas[data-pane=upper]')).toHaveAttribute('data-action-count', '1');
});

test('guide content is excluded from drawing and answers are rendered as text', async ({ page }) => {
  await page.route('**/api/guide/chat', (route) => route.fulfill({ json: { ...reply(), answer: '<img src=x onerror="alert(1)"> Plain evidence, not executable markup.' } }));
  await open(page);
  await page.locator('#ink-toggle').click();
  await send(page, 'Tell me about Lineage');
  await expect(page.locator('.guide-message-assistant p')).toContainText('<img');
  await expect(page.locator('.guide-message-assistant img')).toHaveCount(0);
  const box = (await page.locator('.guide-message-assistant p').boundingBox())!;
  await page.mouse.move(box.x + 5, box.y + 5);
  await page.mouse.down();
  await page.mouse.move(box.x + 30, box.y + 15);
  await page.mouse.up();
  await expect(page.locator('.screen-ink-canvas[data-pane=upper]')).toHaveAttribute('data-action-count', '0');
});

test('local bridge failure is explicit and does not invent successful answers', async ({ page }) => {
  await page.route('**/api/guide/status', (route) => route.fulfill({ status: 503, json: { available: false } }));
  await page.goto('/#home');
  await page.locator('#frog-trigger').click();
  await expect(page.locator('#guide-feedback-text')).toContainText('npm run dev:guide');
  await expect(page.locator('#guide-send')).toBeDisabled();
  await expect(page.locator('#guide-connect')).toBeVisible();
  await expect(page.locator('.guide-message-assistant')).toHaveCount(0);
  await page.locator('.launcher[href="#projects"]').click();
  await expect(page.locator('.project-tile')).toHaveCount(4);
});

test('failed starter keeps a specific source error and retries the original question without duplication', async ({ page }) => {
  const requests: unknown[] = [];
  await page.route('**/api/guide/chat', async (route) => {
    requests.push(route.request().postDataJSON());
    if (requests.length === 1) await route.fulfill({ status: 502, json: {
      code: 'invalid_response', reason: 'unknown_citation',
      error: 'Copilot cited a source that was not supplied for this question. The answer was not displayed. Please try again.',
    } });
    else await route.fulfill({ json: reply() });
  });
  await open(page);
  await page.getByRole('button', { name: 'Find me a starting point', exact: false }).click();
  await page.locator('#guide-send').click();
  await expect(page.locator('#guide-feedback-text')).toContainText('source that was not supplied');
  await expect(page.locator('.guide-message-assistant')).toHaveCount(0);
  await page.locator('.launcher[href="#projects"]').click();
  await page.locator('#guide-retry').click();
  await expect(page.locator('.guide-message-assistant')).toHaveCount(1);
  await expect(page.locator('.guide-message-user')).toHaveCount(1);
  expect(requests).toEqual([
    { question: 'Where should I start exploring this portfolio?', projectId: null, history: [] },
    { question: 'Where should I start exploring this portfolio?', projectId: null, history: [] },
  ]);
  await expect(page.locator('.guide-feedback')).toBeHidden();
});

test('guide fits upper display, expands without a modal, and meets accessibility checks', async ({ page }) => {
  await page.route('**/api/guide/chat', (route) => route.fulfill({ json: reply() }));
  await open(page);
  await page.evaluate(() => document.fonts.ready);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 700 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    const panel = (await page.locator('#guide-panel').boundingBox())!;
    const upper = (await page.locator('.upper-screen').boundingBox())!;
    expect(panel.x).toBeCloseTo(upper.x, 0);
    expect(panel.y).toBeCloseTo(upper.y, 0);
    expect(panel.height).toBeCloseTo(upper.height, 0);
    await expect(page.locator('#guide-question')).toBeInViewport({ ratio: 1 });
    await expect(page.locator('#guide-access')).toBeInViewport({ ratio: 1 });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const before = (await page.locator('.upper-screen').boundingBox())!.height;
  await page.locator('#guide-expand').click();
  expect((await page.locator('.upper-screen').boundingBox())!.height).toBeGreaterThan(before);
  await expect(page.locator('#guide-panel')).not.toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('.launcher[href="#projects"]')).toBeVisible();
});

test('reduced motion keeps the frog static and mute blocks guide audio', async ({ page }) => {
  await open(page);
  await page.locator('#sound-toggle').click();
  expect(await page.locator('.guide-root').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'rest');
  await page.evaluate(() => {
    const original = AudioContext.prototype.createOscillator;
    document.documentElement.dataset.guideNotes = '0';
    AudioContext.prototype.createOscillator = function () {
      document.documentElement.dataset.guideNotes = String(Number(document.documentElement.dataset.guideNotes) + 1);
      return original.call(this);
    };
  });
  await page.locator('#guide-minimize').click();
  await page.locator('#frog-trigger').click();
  await expect(page.locator('html')).toHaveAttribute('data-guide-notes', '0');
  await page.locator('#sound-toggle').click();
  const before = Number(await page.locator('html').getAttribute('data-guide-notes'));
  await page.locator('#guide-minimize').click();
  expect(Number(await page.locator('html').getAttribute('data-guide-notes'))).toBeGreaterThan(before);
  await page.locator('#sound-toggle').click();
  const muted = await page.locator('html').getAttribute('data-guide-notes');
  await page.locator('#frog-trigger').click();
  await expect(page.locator('html')).toHaveAttribute('data-guide-notes', muted!);
});

test('the original frog uses distinct timed poses instead of a continuously bouncing icon', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install({ time: new Date('2026-09-16T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-09-16T12:00:01Z'));
  await page.goto('/#projects');
  await page.clock.runFor(100);
  await page.locator('#guide-access').click();
  await page.clock.runFor(100);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'leap');
  await page.clock.runFor(110);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'land');
  await page.clock.runFor(100);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'rest');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.runFor(10000);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'rest');
  expect(await page.locator('.guide-root').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
});

test('pupils follow the pointer across destinations and remain inside the glasses', async ({ page }) => {
  await page.goto('/#home');
  await expect(page.locator('#entry-screen')).toBeHidden();
  const pupils = page.locator('.frog-pupils');
  const gaze = () => pupils.getAttribute('transform');
  for (const hash of ['#home', '#projects', '#project/repoquest/links', '#about', '#help']) {
    await page.evaluate((value) => { location.hash = value; }, hash);
    await expect(pupils).toBeVisible();
    const frog = (await page.locator('#frog-trigger').boundingBox())!;
    await page.mouse.move(frog.x + 10, frog.y + 10);
    await page.mouse.move(1, frog.y + frog.height / 2);
    await expect.poll(gaze).toMatch(/translate\(-[12] /);
    await page.mouse.move(page.viewportSize()!.width - 1, frog.y + frog.height / 2);
    await expect.poll(gaze).toMatch(/translate\([12] /);
    const eyes = await pupils.evaluate((element) => {
      const match = /translate\((-?\d+) (-?\d+)\)/.exec(element.getAttribute('transform')!)!;
      return { x: Number(match[1]), y: Number(match[2]) };
    });
    expect(Math.abs(eyes.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(eyes.y)).toBeLessThanOrEqual(1);
  }
  await page.locator('#guide-access').click();
  const frog = (await page.locator('#frog-trigger').boundingBox())!;
  await page.mouse.move(frog.x + frog.width / 2, page.viewportSize()!.height - 1);
  await expect.poll(gaze).toMatch(/ 1\)/);
  await page.locator('#guide-minimize').click();
  await expect(pupils).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect.poll(gaze).toBe('translate(0 0)');
});

test('touch input does not leave a cursor-following gaze behind', async ({ page }) => {
  await page.goto('/#projects');
  await expect(page.locator('#entry-screen')).toBeHidden();
  const frog = (await page.locator('#frog-trigger').boundingBox())!;
  await page.mouse.move(page.viewportSize()!.width - 1, frog.y);
  await expect.poll(() => page.locator('.frog-pupils').getAttribute('transform')).not.toBe('translate(0 0)');
  await page.locator('body').dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true });
  await expect.poll(() => page.locator('.frog-pupils').getAttribute('transform')).toBe('translate(0 0)');
});

test('hover swaps to one happy frame and tint without animating or changing its hit target', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await bridge(page);
  await page.goto('/#projects');
  await page.clock.runFor(100);
  const trigger = page.locator('#frog-trigger');
  const original = await page.locator('.frog-sprite').evaluate(element => getComputedStyle(element).getPropertyValue('--paper'));
  const bounds = await trigger.boundingBox();
  await trigger.hover();
  await expect(trigger).toHaveAttribute('data-delighted', 'true');
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'glee');
  const highlighted = await page.locator('.frog-sprite').evaluate(element => getComputedStyle(element).getPropertyValue('--paper'));
  expect(highlighted).not.toBe(original);
  expect(await trigger.boundingBox()).toEqual(bounds);
  await expect(trigger).not.toBeFocused();
  await page.clock.runFor(600);
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'glee');
  await expect(trigger).toHaveAttribute('data-delighted', 'true');
  await page.mouse.move(0, 0);
  await expect(trigger).toHaveAttribute('data-delighted', 'false');
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'rest');
  await trigger.click();
  await page.clock.runFor(400);
  await expect(page.locator('#guide-panel')).toBeVisible();
});

test('keyboard focus receives the same single happy frame even with reduced motion', async ({ page }) => {
  await page.goto('/#projects');
  await expect(page.locator('#entry-screen')).toBeHidden();
  await page.keyboard.press('Tab');
  await page.locator('#frog-trigger').focus();
  await expect(page.locator('#frog-trigger')).toHaveAttribute('data-delighted', 'true');
  await expect(page.locator('.frog-sprite')).toHaveAttribute('data-pose', 'glee');
  await page.locator('#guide-access').focus();
  await expect(page.locator('#frog-trigger')).toHaveAttribute('data-delighted', 'false');
});
