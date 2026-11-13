import './story.css';
import { StoryClock } from './story-clock';
import { connectStoryFlow, renderStoryScene, renderStorySources } from './story-render';
import { projectStories } from './stories';
import type { Project } from './projects';
import type { ProjectStory } from './story-types';
import { createStoryMotion } from './story-motion';

interface PlayerHooks {
  beforeScene: () => void;
  sceneChanged: (sceneId: string, manual: boolean) => void;
  canPlay: () => boolean;
  playSound: () => void;
}

export function setupStoryPlayer(hooks: PlayerHooks) {
  let root: HTMLElement | undefined;
  let story: ProjectStory | undefined;
  let project: Project | undefined;
  let clock: StoryClock | undefined;
  let controller: AbortController | undefined;
  let frame = 0;
  let lastTime = 0;
  let renderedIndex = -1;
  let motion: ReturnType<typeof createStoryMotion> | undefined;
  let previewFrame = 0;
  let observer: ResizeObserver | undefined;
  let expanded = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fmt = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;

  function pause() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    clock?.pause();
    stopMotion();
    update();
  }

  function stopMotion() {
    if (previewFrame) cancelAnimationFrame(previewFrame);
    previewFrame = 0;
    motion?.dispose();
    motion = undefined;
    if (root) root.dataset.motion = 'idle';
  }

  function startMotion(mode: 'timeline' | 'hover' | 'replay' | 'manual') {
    stopMotion();
    if (!root || reduced.matches || !hooks.canPlay() || document.hidden ||
        !root.querySelector<HTMLElement>('#story-sources')!.hidden) return;
    motion = createStoryMotion(root);
    root.dataset.motion = mode;
    motion.seek(0);
    if (mode === 'timeline') return;
    const start = performance.now();
    const preview = (now: number) => {
      previewFrame = 0;
      if (!motion) return;
      if (!hooks.canPlay() || document.hidden || now - start >= motion.duration) { stopMotion(); return; }
      motion.seek(now - start);
      previewFrame = requestAnimationFrame(preview);
    };
    previewFrame = requestAnimationFrame(preview);
  }

  function replay(mode: 'hover' | 'replay') {
    if (mode === 'hover' && motion) return;
    if (!clock?.position().playing) startMotion(mode);
  }

  function refreshFlow() {
    if (root && connectStoryFlow(root) && motion) {
      stopMotion();
      if (clock?.position().playing) { startMotion('timeline'); update(); }
    }
  }

  function update() {
    if (!root || !clock || !story) return;
    const position = clock.position();
    root.dataset.playing = String(position.playing);
    const play = root.querySelector<HTMLButtonElement>('[data-story-action="play"]')!;
    play.setAttribute('aria-label', position.playing ? 'Pause flipbook' : position.time >= position.total ? 'Replay flipbook' : 'Play flipbook');
    play.setAttribute('aria-pressed', String(position.playing));
    play.innerHTML = `<span aria-hidden="true">${position.playing ? 'Ⅱ' : '▶'}</span>`;
    play.disabled = reduced.matches || !hooks.canPlay();
    play.title = reduced.matches ? 'Reduced motion: use the frame arrows'
      : !hooks.canPlay() ? 'Turn Ink off and close the guide to play' : play.getAttribute('aria-label')!;
    root.querySelector<HTMLButtonElement>('[data-story-action="previous"]')!.disabled = position.index === 0;
    root.querySelector<HTMLButtonElement>('[data-story-action="next"]')!.disabled = position.index === story.scenes.length - 1;
    const progress = root.querySelector<HTMLInputElement>('input[type="range"]')!;
    progress.max = String(position.total);
    progress.value = String(position.time);
    progress.setAttribute('aria-valuetext', `${fmt(position.time)} of ${fmt(position.total)}; ${story.scenes[position.index].headline}`);
    root.querySelector('.story-position')!.textContent = `${position.index + 1} / ${story.scenes.length}`;
    root.dataset.scene = story.scenes[position.index].id;
    if (root.dataset.motion === 'timeline' && motion) {
      if (!position.playing || position.offset * 1000 >= motion.duration) stopMotion();
      else motion.seek(position.offset * 1000);
    }
  }

  function draw(manual: boolean) {
    if (!root || !clock || !story || !project) return;
    const position = clock.position();
    if (position.index === renderedIndex) { update(); return; }
    hooks.beforeScene();
    stopMotion();
    const canvas = root.querySelector<HTMLElement>('#story-canvas')!;
    const scene = story.scenes[position.index];
    canvas.dataset.visual = scene.visual.type;
    canvas.innerHTML = renderStoryScene(scene, project);
    root.querySelector<HTMLElement>('.story-viewport')!.scrollTop = 0;
    const sources = root.querySelector<HTMLElement>('#story-sources')!;
    sources.innerHTML = renderStorySources(story, scene);
    sources.hidden = true;
    canvas.inert = false;
    root.querySelector('.story-sources-toggle')!.setAttribute('aria-expanded', 'false');
    canvas.querySelector<HTMLImageElement>('img')?.addEventListener('error', (event) => {
      const image = event.currentTarget as HTMLImageElement;
      image.hidden = true;
      image.closest<HTMLButtonElement>('[data-image-open]')!.hidden = true;
      canvas.querySelector<HTMLElement>('.story-image-error')!.hidden = false;
    }, { once: true, signal: controller!.signal });
    renderedIndex = position.index;
    connectStoryFlow(root);
    if (manual) root.querySelector('.story-announcement')!.textContent = `${position.index + 1} of ${story.scenes.length}: ${scene.headline}`;
    hooks.sceneChanged(scene.id, manual);
    if (position.playing) startMotion('timeline');
    else if (manual) startMotion('manual');
    update();
  }

  function tick(now: number) {
    frame = 0;
    if (!clock?.position().playing) return;
    if (!hooks.canPlay() || document.hidden) { pause(); return; }
    clock.advance(Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    draw(false);
    if (clock.position().playing) frame = requestAnimationFrame(tick);
  }

  function play() {
    if (!clock || !root || reduced.matches || !hooks.canPlay() || document.hidden) return;
    if (clock.position().playing) { pause(); return; }
    clock.play();
    if (clock.position().index === renderedIndex) startMotion('timeline');
    draw(false);
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function go(index: number) {
    if (!clock) return;
    pause();
    clock.goTo(index);
    draw(true);
  }

  function unmount() {
    pause();
    controller?.abort();
    observer?.disconnect();
    root = undefined;
    clock = undefined;
    story = undefined;
    project = undefined;
    renderedIndex = -1;
    expanded = false;
    document.querySelector<HTMLElement>('.studio-app')!.dataset.storyExpanded = 'false';
  }

  function mount(element: HTMLElement, selected: Project, sceneId?: string) {
    if (root === element && project?.id === selected.id) {
      pause();
      const index = sceneId ? story!.scenes.findIndex(scene => scene.id === sceneId) : clock!.position().index;
      if (index >= 0 && index !== renderedIndex) go(index);
      return;
    }
    unmount();
    root = element;
    project = selected;
    story = projectStories[selected.id];
    if (!story) throw new Error(`Missing story for ${selected.id}`);
    controller = new AbortController();
    observer = new ResizeObserver(refreshFlow);
    observer.observe(root.querySelector('#story-canvas')!);
    clock = new StoryClock(story.scenes.map(scene => scene.duration));
    if (sceneId) {
      const index = story.scenes.findIndex(scene => scene.id === sceneId);
      if (index < 0) throw new Error(`Unknown scene ${sceneId} for ${selected.id}`);
      clock.goTo(index);
    }
    const { signal } = controller;
    root.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      const action = event.target.closest<HTMLButtonElement>('[data-story-action]')?.dataset.storyAction;
      if (action) {
        if (action === 'expand') {
          expanded = !expanded;
          document.querySelector<HTMLElement>('.studio-app')!.dataset.storyExpanded = String(expanded);
          const button = root!.querySelector<HTMLButtonElement>('[data-story-action="expand"]')!;
          button.setAttribute('aria-pressed', String(expanded));
          button.setAttribute('aria-label', expanded ? 'Reduce flipbook' : 'Expand flipbook');
        } else if (action === 'play') play();
        else if (action === 'restart') go(0);
        else go(clock!.position().index + (action === 'next' ? 1 : -1));
        hooks.playSound();
      }
      if (event.target.closest('.story-sources-toggle')) {
        pause();
        const sources = root!.querySelector<HTMLElement>('#story-sources')!;
        sources.hidden = !sources.hidden;
        root!.querySelector<HTMLElement>('#story-canvas')!.inert = !sources.hidden;
        const toggle = root!.querySelector<HTMLButtonElement>('.story-sources-toggle')!;
        toggle.setAttribute('aria-expanded', String(!sources.hidden));
        (sources.hidden ? toggle : sources.querySelector<HTMLElement>('a'))?.focus({ preventScroll: true });
      } else if (event.target.closest('.story-canvas') && !event.target.closest('a,button,input,[data-ink-ui]')) {
        replay('replay');
      }
    }, { signal });
    root.addEventListener('keydown', (event) => {
      if (!(event.target instanceof Element) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
          event.target.closest('input,textarea,select,[contenteditable]')) return;
      if (event.key === 'Enter' && event.target.matches('.story-viewport')) {
        event.preventDefault();
        replay('replay');
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        go(clock!.position().index + (event.key === 'ArrowRight' ? 1 : -1));
        hooks.playSound();
      } else if (event.key === ' ' && event.target === root) {
        event.preventDefault();
        play();
      }
    }, { signal });
    const viewport = root.querySelector<HTMLElement>('.story-viewport')!;
    viewport.addEventListener('pointerenter', event => {
      if ((event.pointerType === 'mouse' || event.pointerType === 'pen') && matchMedia('(any-hover: hover)').matches) replay('hover');
    }, { signal });
    viewport.addEventListener('pointerleave', () => { if (root?.dataset.motion === 'hover') stopMotion(); }, { signal });
    root.querySelector<HTMLInputElement>('input[type="range"]')!.addEventListener('input', (event) => {
      const value = Number((event.target as HTMLInputElement).value);
      pause();
      clock!.seek(value);
      draw(true);
    }, { signal });
    root.querySelector('.story-viewport')!.addEventListener('scroll', () => {
      if (root!.querySelector<HTMLElement>('.story-viewport')!.scrollTop > 0) pause();
    }, { signal, passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); }, { signal });
    draw(false);
    void document.fonts.ready.then(() => { if (root === element) refreshFlow(); });
  }

  reduced.addEventListener('change', () => { if (reduced.matches) pause(); update(); });
  return {
    mount, unmount, pause,
    currentScene: () => story && clock ? story.scenes[clock.position().index].id : undefined,
    canvas: () => root?.querySelector<HTMLElement>('#story-canvas'),
  };
}
