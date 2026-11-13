import { icon } from './art';
import { storyArt } from './story-art';
import { repoUrl, type Project } from './projects';
import type { ProjectStory, StoryScene, StoryVisual } from './story-types';

export const escapeText = (value: string) => value.replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

export function storyShell(project: Project) {
  return `<section class="story-player ${project.color}" data-story-player data-project-id="${escapeText(project.id)}" tabindex="0" aria-label="${escapeText(project.title)} project flipbook" aria-keyshortcuts="ArrowLeft ArrowRight Space">
    <div class="story-topline"><h2>${escapeText(project.title)}</h2><div class="story-top-actions"><button class="story-sources-toggle" aria-label="Show story sources" aria-expanded="false" aria-controls="story-sources">Sources</button><button data-story-action="expand" aria-label="Expand flipbook" aria-pressed="false" title="More room">${icon('external')}</button></div></div>
    <div class="story-viewport" role="group" tabindex="0" aria-label="Project story frame. Press Enter to replay this frame's animation." aria-keyshortcuts="Enter"><div class="story-canvas ink-surface" id="story-canvas"></div><div id="story-sources" class="story-sources" hidden></div></div>
    <div class="story-controls" role="group" aria-label="Flipbook playback">
      <button data-story-action="previous" aria-label="Previous frame" title="Previous frame">${icon('arrow', 'reverse')}</button>
      <button data-story-action="play" aria-label="Play flipbook" title="Play" aria-pressed="false"><span aria-hidden="true">▶</span></button>
      <button data-story-action="next" aria-label="Next frame" title="Next frame">${icon('arrow')}</button>
      <label class="story-scrub"><span class="sr-only">Flipbook progress</span><input type="range" min="0" max="1" step="0.1" value="0" aria-valuetext="Beginning" /></label>
      <span class="story-position" aria-hidden="true">1 / 6</span>
      <button data-story-action="restart" aria-label="Restart flipbook" title="Restart">${icon('undo')}</button>
    </div>
    <span class="sr-only story-announcement" role="status" aria-live="polite"></span>
  </section>`;
}

function visualMarkup(visual: StoryVisual, project: Project) {
  switch (visual.type) {
    case 'contrast':
      return `<div class="story-contrast"><div class="story-before">${storyArt(project.illustration, 'before')}<p>${escapeText(visual.before)}</p></div><span class="story-transform-arrow" aria-hidden="true">${icon('arrow')}</span><div class="story-after">${storyArt(project.illustration, 'after')}<p>${escapeText(visual.after)}</p></div></div>`;
    case 'flow':
      return `<div class="story-flow" role="list" aria-label="System flow" data-edges="${escapeText(JSON.stringify(visual.edges))}"><svg class="story-wires" aria-hidden="true"></svg>${visual.nodes.map(node => {
        const incoming = visual.edges.filter(edge => edge.to === node.id).map(edge => visual.nodes.find(item => item.id === edge.from)!.label);
        return `<div class="story-node" role="listitem" data-story-step data-node="${escapeText(node.id)}">${incoming.length ? `<span class="sr-only">From ${escapeText(incoming.join(', '))}. </span>` : ''}<strong>${escapeText(node.label)}</strong><p>${escapeText(node.detail)}</p></div>`;
      }).join('')}</div>`;
    case 'roles':
      return `<dl class="story-roles">${visual.items.map(item => `<div data-story-step><dt>${escapeText(item.name)}</dt><dd>${escapeText(item.role)}</dd></div>`).join('')}</dl>`;
    case 'steps':
      return `<ol class="story-steps">${visual.items.map(item => `<li data-story-step><strong>${escapeText(item.title)}</strong><p>${escapeText(item.detail)}</p></li>`).join('')}</ol>`;
    case 'image':
      return `<div class="story-image"><button type="button" class="image-open" data-image-open aria-label="Enlarge image: ${escapeText(visual.alt)}" aria-haspopup="dialog"><img src="${escapeText(visual.src)}" alt="${escapeText(visual.alt)}" decoding="async" /></button><svg class="story-image-corners" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8V0h8M92 0h8v8M100 92v8h-8M8 100H0v-8" vector-effect="non-scaling-stroke" /></svg><p class="story-image-error" hidden role="status">This image could not load. The project description and sources are still available.</p></div>`;
    case 'outcome':
      return `<div class="story-outcome"><div class="story-outcome-art">${storyArt(project.illustration)}</div><strong>${escapeText(visual.result)}</strong></div>`;
  }

}

export function connectStoryFlow(root: HTMLElement) {
    const flow = root.querySelector<HTMLElement>('.story-flow');
    const svg = flow?.querySelector<SVGSVGElement>('.story-wires');
    if (!flow || !svg) return false;
    const bounds = flow.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return false;
    const edges: { from: string; to: string }[] = JSON.parse(flow.dataset.edges!);
    const geometry = JSON.stringify([...flow.querySelectorAll('[data-node]')].map(node => {
      const rect = node.getBoundingClientRect();
      return [rect.left - bounds.left, rect.top - bounds.top, rect.width, rect.height];
    }));
    if (svg.dataset.geometry === geometry) return false;
    svg.dataset.geometry = geometry;
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    svg.replaceChildren();
    for (const edge of edges) {
      const from = flow.querySelector<HTMLElement>(`[data-node="${CSS.escape(edge.from)}"]`)!.getBoundingClientRect();
      const to = flow.querySelector<HTMLElement>(`[data-node="${CSS.escape(edge.to)}"]`)!.getBoundingClientRect();
      const vertical = Math.abs(from.top - to.top) > 8;
      const x1 = (vertical ? from.left + from.width / 2 : from.right) - bounds.left;
      const y1 = (vertical ? from.bottom : from.top + from.height / 2) - bounds.top;
      const x2 = (vertical ? to.left + to.width / 2 : to.left) - bounds.left;
      const y2 = (vertical ? to.top : to.top + to.height / 2) - bounds.top;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('story-wire');
      path.dataset.from = edge.from;
      path.dataset.to = edge.to;
      path.setAttribute('d', vertical
        ? `M${x1} ${y1}C${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2}`
        : `M${x1} ${y1}C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`);
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrow.setAttribute('d', vertical ? `M${x2 - 3} ${y2 - 5}L${x2} ${y2}L${x2 + 3} ${y2 - 5}`
        : `M${x2 - 5} ${y2 - 3}L${x2} ${y2}L${x2 - 5} ${y2 + 3}`);
      svg.append(path, arrow);
    }
    return true;
}

export function renderStoryScene(scene: StoryScene, project: Project) {
  if (scene.visual.type === 'image') {
    return `<figure class="story-scene story-scene--image" data-scene-id="${escapeText(scene.id)}">
      <div class="story-visual">${visualMarkup(scene.visual, project)}</div>
      <figcaption><h3 id="story-heading">${escapeText(scene.headline)}</h3></figcaption>
    </figure>`;
  }
  return `<article class="story-scene story-scene--${scene.visual.type}" data-scene-id="${escapeText(scene.id)}">
    <h3 id="story-heading">${escapeText(scene.headline)}</h3>
    <div class="story-visual">${visualMarkup(scene.visual, project)}</div>
    <p class="story-body">${escapeText(scene.body)}</p>
    ${scene.beat === 'use' ? `<div class="story-links"><a href="${escapeText(repoUrl(project))}" target="_blank" rel="noopener noreferrer">Repository ${icon('external')}</a>${project.site ? `<a href="${escapeText(project.site)}" target="_blank" rel="noopener noreferrer">Walkthrough ${icon('external')}</a>` : ''}</div>` : ''}
  </article>`;
}

export function renderStorySources(story: ProjectStory, scene: StoryScene) {
  return `${scene.visual.type === 'image' ? `<p class="story-supporting-copy">${escapeText(scene.body)}</p>` : ''}<p>Sources for this frame</p>${scene.sources.map(id => {
    const source = story.sources.find(item => item.id === id);
    if (!source) throw new Error(`Missing story source ${id}`);
    return `<a href="${escapeText(source.url)}" target="_blank" rel="noopener noreferrer">${escapeText(source.title)} ${icon('external')}</a>`;
  }).join('')}`;
}
