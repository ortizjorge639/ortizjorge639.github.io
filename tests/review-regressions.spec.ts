import { test, expect } from '@playwright/test';
import { projectStories } from '../src/stories';

test('catalog arrows start at focused unselected tile and ignore modified keys', async ({ page }) => {
  await page.goto('/#projects');
  const tile = page.getByRole('button', { name: 'Preview After the meeting', exact: true });
  await tile.focus();
  await page.keyboard.press('Shift+ArrowLeft');
  await expect(tile).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Preview Modding, with guardrails', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(tile).toBeFocused();
});

test('source overlay removes covered image controls from interaction and restores them', async ({ page }) => {
  await page.goto('/#project/repoquest/overview');
  const imageIndex = projectStories.repoquest.scenes.findIndex(s => s.visual.type === 'image');
  expect(imageIndex).toBeGreaterThanOrEqual(0);
  for (let i = 0; i < imageIndex; i++) await page.getByRole('button', { name: 'Next frame', exact: true }).click();
  const toggle = page.getByRole('button', { name: 'Show story sources' });
  await toggle.click();
  await expect(page.locator('#story-canvas')).toHaveAttribute('inert', '');
  await expect(page.locator('#story-sources a').first()).toBeFocused();
  await toggle.click();
  await expect(page.locator('#story-canvas')).not.toHaveAttribute('inert', '');
  await expect(toggle).toBeFocused();
});

test('reverse flow connects facing edges and points upward on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/#project/weekend-batch/overview?scene=one-pipeline');
  // Use the canonical flow scene, without assuming its authored ID.
  const scene = projectStories['weekend-batch'].scenes.find(s => s.visual.type === 'flow')!;
  await page.goto(`/#project/weekend-batch/overview?scene=${scene.id}`);
  const result = await page.locator('.story-flow').evaluate(flow => {
    const nodes = [...flow.querySelectorAll<HTMLElement>('[data-node]')];
    const edges: {from: string; to: string}[] = JSON.parse((flow as HTMLElement).dataset.edges!);
    const edge = edges.find(e => nodes.find(n => n.dataset.node === e.from)!.getBoundingClientRect().top > nodes.find(n => n.dataset.node === e.to)!.getBoundingClientRect().top)!;
    const wire = flow.querySelector<SVGPathElement>(`path[data-from="${edge.from}"][data-to="${edge.to}"]`)!;
    const from = nodes.find(n => n.dataset.node === edge.from)!.getBoundingClientRect();
    const bounds = flow.getBoundingClientRect();
    return { start: wire.getPointAtLength(0).y, expected: from.top - bounds.top };
  });
  expect(result.start).toBeCloseTo(result.expected, 0);
});

test('partial grounding is disclosed even when response includes citations', async ({ page }) => {
  await page.route('**/api/guide/status', route => route.fulfill({ json: { available: true, mode: 'copilot-cli' } }));
  await page.route('**/api/guide/chat', route => route.fulfill({ json: { answer: 'Only part is supported.', grounded: false, contextProjectId: null, citations: [{ id: 'portfolio:about', title: 'Portfolio', url: 'https://ortizjorge639.github.io/', projectId: null }] } }));
  await page.goto('/#home');
  await page.locator('#guide-access').click();
  await page.locator('#guide-question').fill('What is supported?');
  await page.locator('#guide-send').click();
  await expect(page.locator('.guide-message-assistant')).toContainText('Not fully established by the available notes.');
});
