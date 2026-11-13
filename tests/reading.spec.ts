import { test, expect } from '@playwright/test';

test('project reading pages load and refresh without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/read/just-play/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Just Play');
  await expect(page.getByRole('heading', { name: 'How it works', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Public landing page', exact: true })).toHaveAttribute('href', 'https://v0-just-play-app.vercel.app/about');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Just Play');
  await page.getByRole('link', { name: 'All projects', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects, opened up.');
  await expect(page.getByRole('link', { name: 'Just Play', exact: true }).last()).toHaveAttribute('href', '/read/just-play/');
  await context.close();
});


test('reading mode reuses original frog with project context and a safe unavailable state', async ({ page }) => {
  await page.route('**/api/guide/status', route => route.fulfill({ status: 503, json: { error: 'Unavailable' } }));
  await page.goto('/read/firstmind/');
  await page.getByRole('button', { name: 'Ask the studio frog' }).click();
  await expect(page.locator('#guide-panel')).toBeVisible();
  await expect(page.locator('#guide-context-label')).toHaveText('Next question: FirstMind');
  await expect(page.locator('#guide-send')).toBeDisabled();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('FirstMind');
  await expect(page.getByRole('link', { name: 'Browse public project notes' })).toHaveAttribute('href', '/read/');
  await page.locator('#guide-minimize').click();
  await expect(page.locator('#frog-trigger')).toBeFocused();
});

test('reading search is local, handles hostile input, and keeps keyboard links usable', async ({ page }) => {
  await page.goto('/read/');
  const search=page.getByRole('searchbox', { name: 'Find a project' });
  await search.fill('StandBy');
  await expect(page.locator('.project-index article:visible')).toHaveCount(1);
  await expect(page.locator('#search-status')).toHaveText('1 project found');
  await search.fill('<img src=x onerror=alert(1)>');
  await expect(page.locator('#search-status')).toContainText('No projects found');
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await search.fill('FirstMind');
  await page.locator('.project-index h2 a:visible').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/read\/firstmind\/$/);
});
