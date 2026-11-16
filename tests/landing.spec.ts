import { test, expect } from '@playwright/test';

// Deterministic UI fixtures only. No live guide/model endpoint is exercised.
const citation = {
  id: 'landing-lineage', title: 'Lineage · public README', projectId: 'web-context-graph',
  url: `https://github.com/ortizjorge639/web-context-graph/blob/${'a'.repeat(40)}/README.md`,
};

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
});

test('front door is meaningful without JavaScript and both entrances are real links', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hi, I’m Jorge!');
  await expect(page.locator('.landing-header')).toContainText('Jorge Ortiz Flores');
  await expect(page.locator('.landing-header')).toContainText('2026–2027');
  await expect(page.getByRole('link', { name: /Read the notes/ })).toHaveAttribute('href', '/read/');
  await expect(page.getByRole('link', { name: /Open the sketchbook/ })).toHaveAttribute('href', '/sketchbook/#home');
  await expect(page.locator('#guide-access')).toBeHidden();
  await page.getByRole('link', { name: /Read the notes/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects, opened up.');
  await page.goto('/');
  await page.getByRole('link', { name: /Open the sketchbook/ }).click();
  await expect(page).toHaveURL(/\/sketchbook\/#home$/);
  await page.getByRole('link', { name: 'Browse public project notes', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects, opened up.');
  await context.close();
});

test('idle landing loads a small entry, not sketchbook or guide payloads', async ({ page }) => {
  const scripts: Promise<Buffer>[] = [];
  const api: string[] = [];
  page.on('response', response => {
    if (response.request().resourceType() === 'script') scripts.push(response.body());
  });
  page.on('request', request => { if (request.url().includes('/api/guide/')) api.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('#guide-access')).toBeVisible();
  const bodies = await Promise.all(scripts);
  expect(bodies.length).toBeGreaterThan(0);
  expect(bodies.reduce((bytes, body) => bytes + body.byteLength, 0)).toBeLessThan(18_000);
  expect(bodies.map(body => body.toString()).join('\n')).not.toMatch(/screen-ink-canvas|studio-app|guide-composer|upper-scroll/);
  expect(api).toEqual([]);
  await expect(page.locator('canvas, .studio-app, .guide-root, #entry-screen')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'GitHub', exact: false })).toHaveAttribute('href', 'https://github.com/ortizjorge639');
  await expect(page.getByRole('link', { name: 'LinkedIn', exact: false })).toHaveAttribute('href', 'https://www.linkedin.com/in/jorgeortizflores/');
  await page.getByRole('link', { name: /Open the sketchbook/ }).click();
  await expect(page.locator('.studio-app')).toHaveAttribute('data-screen', 'home');
});

for (const hash of ['#home', '#project/repoquest/overview?scene=watch-the-guide', '#about/flipnotes/2', '#project/%/overview']) {
  test(`legacy front-door bookmark preserves ${hash}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?from=bookmark${hash}`);
    await expect.poll(() => page.url()).toContain(`/sketchbook/?from=bookmark${hash}`);
    await expect(page.locator('.studio-app')).toHaveAttribute('data-screen',
      hash.includes('/%/') ? 'not-found' : hash.startsWith('#project/') ? 'project' : hash.startsWith('#about') ? 'about' : 'home');
    await expect(page.locator('#landing-content')).toHaveCount(0);
  });
}

test('same-document legacy hash changes leave the landing for the sketchbook', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#guide-access')).toBeVisible();
  await page.evaluate(() => { location.hash = '#projects'; });
  await expect(page).toHaveURL(/\/sketchbook\/#projects$/);
  await expect(page.locator('.studio-app')).toHaveAttribute('data-screen', 'projects');
});

test('ask explicitly lazy-loads the shared quiet guide with grounded fixture sources', async ({ page }) => {
  const questions: unknown[] = [];
  await page.route('**/api/guide/status', route => route.fulfill({ json: { available: true, mode: 'model-api', provider: 'azure-openai' } }));
  await page.route('**/api/guide/chat', route => {
    questions.push(route.request().postDataJSON());
    return route.fulfill({ json: {
      answer: 'The public notes describe Lineage as a local-first workspace for branching conversations.',
      citations: [citation], contextProjectId: null, suggestedProjects: ['web-context-graph'],
    } });
  });
  await page.addInitScript(() => {
    // Quiet means no AudioContext creation, even when opening/sending.
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: class {
      constructor() { document.documentElement.dataset.unexpectedAudio = 'true'; throw new Error('Landing must stay silent'); }
    } });
  });
  await page.goto('/');
  await expect(page.locator('.guide-root')).toHaveCount(0);
  await page.locator('#guide-access').click();
  await expect(page.locator('#guide-panel')).toBeVisible();
  await expect(page.locator('#guide-access')).toHaveAccessibleName('Ask about the work — Minimize studio guide');
  await expect(page.locator('#guide-send')).toBeEnabled();
  expect(questions).toEqual([]);
  await page.getByLabel('Your question', { exact: true }).fill('What is Lineage?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.locator('.guide-message-assistant')).toContainText('local-first workspace');
  await expect(page.getByRole('link', { name: citation.title, exact: true })).toHaveAttribute('href', citation.url);
  expect(questions).toEqual([{ question: 'What is Lineage?', projectId: null, history: [] }]);
  await expect(page.locator('html')).not.toHaveAttribute('data-unexpected-audio', 'true');
  await page.locator('#guide-minimize').click();
  await expect(page.locator('#guide-access')).toHaveAccessibleName('Ask about the work — Show studio guide');
  await page.getByRole('button', { name: 'Ask about the work — Show studio guide', exact: true }).click();
  await expect(page.locator('#guide-access')).toHaveAccessibleName('Ask about the work — Minimize studio guide');
  await expect(page.locator('.guide-root')).toHaveCount(1);
  await expect(page.locator('.guide-message-assistant')).toHaveCount(1);
  await page.getByRole('button', { name: /Open Lineage/ }).click();
  await expect(page).toHaveURL(/\/read\/web-context-graph\/$/);
});

test('unavailable guide stays disabled without blocking the static entrances', async ({ page }) => {
  await page.route('**/api/guide/status', route => route.fulfill({ status: 503, json: { available: false } }));
  await page.goto('/');
  await page.locator('#guide-access').click();
  await expect(page.locator('#guide-feedback-text')).not.toBeEmpty();
  await expect(page.locator('#guide-send')).toBeDisabled();
  await expect(page.locator('.guide-message-assistant')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Browse public project notes', exact: true })).toHaveAttribute('href', '/read/');
  await expect(page.getByRole('link', { name: /Open the sketchbook/ })).toHaveAttribute('href', '/sketchbook/#home');
});

test('guide request errors never become fabricated answers', async ({ page }) => {
  await page.route('**/api/guide/status', route => route.fulfill({ json: { available: true, mode: 'model-api', provider: 'azure-openai' } }));
  await page.route('**/api/guide/chat', route => route.fulfill({ status: 503, json: { code: 'unavailable', error: 'The public-notes guide is temporarily unavailable.' } }));
  await page.goto('/');
  await page.locator('#guide-access').click();
  await expect(page.locator('#guide-send')).toBeEnabled();
  await page.getByLabel('Your question', { exact: true }).fill('What can I explore?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.locator('#guide-feedback-text')).toContainText('unavailable');
  await expect(page.locator('.guide-message-assistant')).toHaveCount(0);
  await expect(page.locator('#guide-retry')).toBeVisible();
  await page.locator('#guide-minimize').click();
  await page.getByRole('link', { name: /Read the notes/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects, opened up.');
});

test('failed guide chunk leaves a readable error and the notes usable', async ({ page }) => {
  await page.route('**/assets/landing-guide-*.js', route => route.abort());
  await page.goto('/');
  await page.locator('#guide-access').click();
  await expect(page.locator('#landing-guide-status')).toContainText('could not load');
  await expect(page.locator('#guide-access')).toBeEnabled();
  await page.getByRole('link', { name: /Read the notes/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects, opened up.');
});

test('phone layouts do not overflow before or after opening the guide', async ({ page }) => {
  await page.route('**/api/guide/status', route => route.fulfill({ status: 503, json: { available: false } }));
  for (const viewport of [{ width: 320, height: 700 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    expect(await noOverflow()).toBe(true);
    for (const link of ['Read the notes', 'Open the sketchbook']) {
      const box = (await page.getByRole('link', { name: new RegExp(link) }).boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await page.locator('#guide-access').click();
    await expect(page.locator('#guide-panel')).toBeVisible();
    await expect(page.locator('#guide-feedback-text')).not.toBeEmpty();
    expect(await noOverflow()).toBe(true);
    const panel = (await page.locator('#guide-panel').boundingBox())!;
    expect(panel.x).toBeGreaterThanOrEqual(0);
    expect(panel.x + panel.width).toBeLessThanOrEqual(viewport.width);
    await expect(page.locator('#guide-question')).toBeInViewport({ ratio: 1 });
  }
});
