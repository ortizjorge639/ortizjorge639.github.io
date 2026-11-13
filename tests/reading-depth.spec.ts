import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../src/projects';

// One pass covers every route; assertions use the same canonical catalog as generation.
test('all reading routes teach components, relationships, decisions and limits', async ({ page }) => {
  for (const project of projects) {
    await page.goto(`/read/${project.id}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.title);
    await expect(page.locator('#architecture figure')).toHaveCount(1);
    expect(await page.locator('.architecture-nodes li').count()).toBeGreaterThanOrEqual(3);
    expect(await page.locator('.architecture-connections li').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('.decision-list article').count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator('.architecture-boundary')).not.toBeEmpty();
    await expect(page.locator('#walkthrough')).toContainText('not a recorded run');
    await expect(page.locator('#evidence')).toContainText('Not established');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    expect(overflow, `${project.id} has no horizontal clipping`).toBe(false);
    if (project.sourceType === 'curated-case-study') {
      await expect(page.getByRole('link', { name: 'Public repository', exact: true })).toHaveCount(0);
      await expect(page.locator('#sources')).not.toContainText('gist.');
    }
  }
});

test('phone without scripts reaches content and retains usable architecture text', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/read/apim-credential-broker-poc/');
  expect(await page.locator('main').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(400);
  expect(await page.locator('.project-nav details').getAttribute('open')).toBeNull();
  await expect(page.locator('.architecture-nodes')).toBeVisible();
  await expect(page.locator('.architecture-connections')).toBeVisible();
  await expect(page.locator('.architecture-boundary')).toContainText('per-user');
  await page.locator('.project-nav summary').click();
  await page.getByRole('link', { name: 'After the meeting', exact: true }).click();
  await expect(page.locator('#evidence')).toContainText('corrected value');
  await context.close();
});

test('architecture content remains accessible and adapts on viewport resize', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/read/apim-credential-broker-poc/');
  await expect(page.locator('.project-nav details')).toHaveAttribute('open', '');
  await expect(page.locator('.system-diagram')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.project-nav details')).not.toHaveAttribute('open');
  await expect(page.locator('.architecture-nodes')).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('audit review screenshots preserve phone and desktop architecture views', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/read/apim-credential-broker-poc/#architecture');
  await page.locator('#architecture').screenshot({ path: testInfo.outputPath('broker-architecture-desktop.png') });
  await testInfo.attach('broker-architecture-desktop', { path: testInfo.outputPath('broker-architecture-desktop.png'), contentType: 'image/png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/read/document-evidence-pipeline/#architecture');
  await page.locator('#architecture').screenshot({ path: testInfo.outputPath('document-architecture-phone.png') });
  await testInfo.attach('document-architecture-phone', { path: testInfo.outputPath('document-architecture-phone.png'), contentType: 'image/png' });
});
