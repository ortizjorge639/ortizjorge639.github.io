import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('loads real portfolio content without browser errors or overflow', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('fonts.googleapis')) errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Joji's Sketchbook");
  await expect(page.locator('.project-card')).toHaveCount(7);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.feature-visual img')).toBeVisible();
  expect(await page.locator('.feature-visual img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBeTruthy();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  expect(errors).toEqual([]);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-portfolio.png`, fullPage: true });
});

test('category filters select the correct public projects', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Gaming', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await expect(page.locator('#result-count')).toHaveText('2 pages to explore');
  await expect(page.locator('.project-card').filter({ hasText: 'Just Play' })).toBeVisible();
  await page.getByRole('button', { name: 'AI', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Media', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'All pages' }).click();
  await expect(page.locator('.project-card')).toHaveCount(7);
});

test('flipbook navigates, wraps, and opens accurate project details', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Next project', exact: true }).click();
  await expect(page.locator('.feature-caption h2')).toHaveText('After the meeting');
  await page.getByRole('button', { name: 'Previous project', exact: true }).click();
  await expect(page.locator('.feature-caption h2')).toHaveText('Lineage');
  await page.locator('.flipbook').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.feature-caption h2')).toHaveText('The Batch');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.feature-caption h2')).toHaveText('RepoQuest');
  await page.getByRole('button', { name: 'Read about RepoQuest' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'RepoQuest', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View repository' })).toHaveAttribute('href', 'https://github.com/ortizjorge639/repoquest');
  await expect(page.locator('.detail-art img')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Read about RepoQuest' })).toBeFocused();
});

test('every card has a working details panel with evidence and source', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.card-body h3 button');
  await expect(cards).toHaveCount(7);
  for (let i = 0; i < await cards.count(); i++) {
    const title = await cards.nth(i).textContent();
    await cards.nth(i).click();
    await expect(page.locator('#dialog-title')).toHaveText(title!);
    await expect(page.locator('.detail-copy li')).toHaveCount(3);
    await expect(page.locator('.source-note')).toHaveAttribute('href', /^https:\/\/github.com\/ortizjorge639\/.+#readme$/);
    await page.getByRole('button', { name: 'Close project details' }).click();
  }
});

test('reduced motion and muted-by-default controls remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Sound off' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Next project', exact: true }).click();
  expect(await page.locator('#feature-page').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('button', { name: 'Sound off' }).click();
  await expect(page.getByRole('button', { name: 'Sound on' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Sound on' }).click();
  await expect(page.getByRole('button', { name: 'Sound off' })).toHaveAttribute('aria-pressed', 'false');
});

test('main page and project dialog meet automated accessibility checks', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const scan = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect((await scan()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Read about Lineage' }).click();
  expect((await scan()).violations).toEqual([]);
});

test('narrow phones and tablets do not overflow horizontally', async ({ page }) => {
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.project-card')).toHaveCount(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}px`).toBeTruthy();
  }
});

test('original palette is retained and handheld screens adapt to the viewport', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('.studio-console')).toBeVisible();
  const palette = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return ['--blue', '--red', '--paper'].map((name) => root.getPropertyValue(name).trim()).concat(root.backgroundColor);
  });
  expect(palette).toEqual(['#3157bc', '#c53f2e', '#fffdf6', 'rgb(246, 243, 233)']);
  const title = (await page.locator('.title-screen').boundingBox())!;
  const menu = (await page.locator('.touch-screen').boundingBox())!;
  if (testInfo.project.name === 'mobile') {
    expect(menu.y).toBeGreaterThan(title.y + title.height);
  } else {
    expect(menu.x).toBeGreaterThan(title.x + title.width);
    expect(menu.y).toBe(title.y);
  }
  await expect(page.locator('#studio-date')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
  await expect(page.locator('#studio-clock')).toHaveText(/^\d{2}:\d{2}$/);
});

test('touch menu destinations and help work with keyboard focus', async ({ page }) => {
  await page.goto('/');
  await page.locator('.launcher[href="#projects"]').click();
  await expect(page).toHaveURL(/#projects$/);
  await page.locator('.launcher[href="#about"]').click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('#playground')).toHaveCount(0);
  await page.getByRole('button', { name: 'Help', exact: false }).click();
  const help = page.getByRole('dialog', { name: 'Studio help' });
  await expect(help).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(help).not.toBeVisible();
  await expect(page.locator('#open-help')).toBeFocused();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Got it' }).click();
  await expect(help).not.toBeVisible();
});
