import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { flipnotes, aboutHash } from '../src/flipnotes';
import { readScreen } from '../src/navigation';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#about');
  await expect(page.locator('#entry-screen')).toBeHidden();
});

test('right arrow discovers the four original images and approximate dates in order', async ({ page }) => {
  await expect(page.locator('.creator-screen #screen-title')).toHaveText('Always making. Always learning.');
  await expect(page.locator('.flipnote-art')).toHaveCount(0);
  const bio = await page.locator('.creator-content').textContent();
  for (let i = 0; i < flipnotes.length; i++) {
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(new RegExp(`${aboutHash(i + 1)}$`));
    const image = page.locator('.flipnote-art');
    await expect(image).toHaveAttribute('src', flipnotes[i].image);
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth === 256 && element.naturalHeight === 192)).toBe(true);
    await expect(page.locator('.flipnote-figure figcaption')).toHaveText(flipnotes[i].date);
    await expect(page.locator('.creator-content')).toHaveText(bio!);
    await expect(page.locator('#screen-title')).toHaveCount(1);
  }
  await expect(page.getByRole('link', { name: 'Next About page' })).toHaveCount(0);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#about\/flipnotes\/4$/);
  for (let i = 0; i < flipnotes.length; i++) await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('.creator-screen #screen-title')).toHaveText('Always making. Always learning.');
  await expect(page.getByRole('link', { name: 'Previous About page' })).toHaveCount(0);
});

test('the easter egg uses only a small page corner with no counter or toolbar', async ({ page }) => {
  await expect(page.locator('.creator-page-count')).toHaveCount(0);
  await expect(page.locator('.creator-paging button')).toHaveCount(0);
  await expect(page.locator('.creator-paging')).toHaveText('');
  const corner = page.getByRole('link', { name: 'Next About page' });
  const box = (await corner.boundingBox())!;
  expect(box.width).toBe(44);
  expect(box.height).toBe(44);
  const icon = (await corner.locator('svg').boundingBox())!;
  expect(icon.width).toBe(18);
  await corner.focus();
  await expect(corner).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.flipnote-art')).toBeVisible();
});

test('touch controls, deep links, Back and Help preserve the selected page', async ({ page }) => {
  await page.getByRole('link', { name: 'Next About page' }).click();
  await page.getByRole('link', { name: 'Next About page' }).click();
  await expect(page).toHaveURL(/#about\/flipnotes\/2$/);
  await page.reload();
  await expect(page.locator('#entry-screen')).toBeHidden();
  await expect(page.locator('.flipnote-art')).toHaveAttribute('src', flipnotes[1].image);
  await page.locator('#open-help').click();
  await page.locator('#back-button').click();
  await expect(page).toHaveURL(/#about\/flipnotes\/2$/);
  await page.getByRole('link', { name: 'Back to About intro' }).click();
  await expect(page).toHaveURL(/#about$/);
  await page.locator('#back-button').click();
  await expect(page).toHaveURL(/#home$/);
});

test('arrow keys do not hijack chat editing, ink controls or modified shortcuts', async ({ page }) => {
  await page.locator('#guide-access').click();
  await page.locator('#guide-question').fill('A question');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#about$/);
  await page.locator('#guide-minimize').click();
  await page.locator('#ink-toggle').click();
  await page.locator('#ink-tools-toggle').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#about$/);
  await page.locator('#screen-title').focus();
  await page.keyboard.press('Shift+ArrowRight');
  await expect(page).toHaveURL(/#about$/);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#about\/flipnotes\/1$/);
});

test('turning pages preserves the lower bio DOM and scroll position and isolates ink per page', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await page.locator('.creator-content').evaluate(element => { element.dataset.retained = 'true'; });
  await page.locator('#lower-scroll').evaluate(element => { element.scrollTop = 60; });
  const scroll = await page.locator('#lower-scroll').evaluate(element => element.scrollTop);
  await page.locator('#ink-toggle').click();
  await page.locator('#ink-tools-toggle').click();
  await page.locator('#ink-stamp').click();
  await page.keyboard.press('Escape');
  await page.locator('#screen-title').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.creator-content')).toHaveAttribute('data-retained', 'true');
  expect(await page.locator('#lower-scroll').evaluate(element => element.scrollTop)).toBe(scroll);
  await expect(page.locator('.screen-ink-canvas[data-pane=upper]')).toHaveAttribute('data-action-count', '0');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.screen-ink-canvas[data-pane=upper]')).toHaveAttribute('data-action-count', '1');
});

test('page turn is directional, bounded, interruptible, and removed for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const forward = await page.evaluate(() => {
    document.querySelector<HTMLAnchorElement>('[data-focus="about-next"]')!.click();
    const animation = document.querySelector('.creator-sheet')!.getAnimations()[0];
    return { duration: animation.effect!.getTiming().duration, frames: (animation.effect as KeyframeEffect).getKeyframes() };
  });
  expect(forward.duration).toBe(220);
  expect(forward.frames[0].transform).toContain('65deg');
  await page.evaluate(() => {
    for (let i = 0; i < 3; i++) document.querySelector<HTMLAnchorElement>('[data-focus="about-next"]')!.click();
  });
  await expect(page).toHaveURL(/#about\/flipnotes\/4$/);
  await expect(page.locator('.flipnote-art')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('ArrowLeft');
  expect(await page.locator('.creator-sheet').evaluate(element => element.getAnimations().length)).toBe(0);
});

test('archive is accessible and rejects invalid image-page routes', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  for (const hash of ['#about/flipnotes/0', '#about/flipnotes/5', '#about/flipnotes/nope', '#about/flipnotes/01', '#about/flipnotes/1?unknown=true']) {
    expect(readScreen(hash).kind).toBe('not-found');
  }
  expect(readScreen('#about')).toEqual({ kind: 'about', page: 0 });
  expect(readScreen('#about/flipnotes/4')).toEqual({ kind: 'about', page: 4 });
});
