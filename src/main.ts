import './style.css';
import { icon } from './art';
import { setupPageInk } from './drawing';
import { StudioAudio } from './audio';
import { layout } from './layout';
import { libraryHash, libraryPage, projectHash, readScreen, surfaceKey, type Screen } from './navigation';
import { renderScreen } from './screens';
import { setupStudioGuide } from './guide';
import './viewport.css';
import { setupEntry } from './entry';
import { aboutHash, flipnotes } from './flipnotes';
import { setupStoryPlayer } from './story-player';
import { projectStories } from './stories';
import type { Project } from './projects';
import { setupImageViewer } from './image-viewer';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = layout;

const element = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const app = element<HTMLElement>('.studio-app');
const upper = element<HTMLElement>('#upper-content');
const lower = element<HTMLElement>('#lower-content');
const upperScroll = element<HTMLElement>('#upper-scroll');
const lowerScroll = element<HTMLElement>('#lower-scroll');
const back = element<HTMLAnchorElement>('#back-button');
const status = element<HTMLElement>('#navigation-status');
const audio = new StudioAudio();
const ink = setupPageInk(audio, element('#ink-mount'));
const guide = setupStudioGuide(audio, (id) => navigate(`#project/${encodeURIComponent(id)}/overview`));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let screen: Screen = readScreen(location.hash);
let animation: Animation | undefined;
let lastLibrary = '#projects';
let helpReturn = '#home';
let libraryReturn = '#projects';
let renderedScreen: Screen | undefined;
let flipnotesPreloaded = false;
let mountingStory = false;
const storyPlayer = setupStoryPlayer({
  beforeScene: () => ink.suspend(),
  sceneChanged: (id) => {
    const selected = selectedProject(screen);
    if (!selected) return;
    if (!mountingStory && (screen.kind === 'project' || screen.kind === 'projects')) {
      screen = { ...screen, scene: id === projectStories[selected.id].scenes[0].id ? undefined : id };
      const hash = screenHash(screen);
      history.replaceState({ ...entry(), studio: true, hash }, '', hash);
      if (screen.kind === 'projects') lastLibrary = hash;
      app.dataset.surface = surfaceKey(screen);
    }
    syncPlayerLinks();
    bindInk();
  },
  canPlay: () => !ink.isEnabled() && !guide.isOpen() && !imageViewer.isOpen(),
  playSound: () => audio.playUI(),
});
const imageViewer = setupImageViewer({
  beforeOpen: () => storyPlayer.pause(),
  canOpen: () => !ink.isEnabled(),
});
ink.onEnabled(() => { storyPlayer.pause(); imageViewer.syncAvailability(); });
guide.onOpen(() => storyPlayer.pause());

function selectedProject(value: Screen): Project | undefined {
  return value.kind === 'projects' ? value.selected : value.kind === 'project' ? value.project : undefined;
}
function screenHash(value: Screen) {
  if (value.kind === 'projects') return libraryHash(value.filter, value.page, value.selected.id, value.scene);
  if (value.kind === 'project') return projectHash(value.project.id, value.page, value.scene);
  return location.hash || '#home';
}
function syncPlayerLinks() {
  const selected = selectedProject(screen);
  if (!selected) return;
  const scene = storyPlayer.currentScene();
  const key = scene === projectStories[selected.id].scenes[0].id ? undefined : scene;
  const open = document.querySelector<HTMLAnchorElement>('.open-project');
  if (open) open.href = projectHash(selected.id, 'overview', key);
  document.querySelectorAll<HTMLAnchorElement>('.detail-tabs a, .detail-pagination a').forEach(link => {
    const target = readScreen(link.hash);
    if (target.kind === 'project') link.href = projectHash(selected.id, target.page, key);
  });
}
function bindInk() {
  const selected = selectedProject(screen);
  const scene = storyPlayer.currentScene();
  const canvas = storyPlayer.canvas();
  if (selected && scene && canvas) {
    const lowerKey = screen.kind === 'projects' || screen.kind === 'project' ? surfaceKey({ ...screen, scene: undefined }) : surfaceKey(screen);
    ink.setSurface(lowerKey, { upper: canvas, lower }, `story:${selected.id}:${scene}`);
  } else ink.setSurface(surfaceKey(screen), { upper, lower });
  imageViewer.syncAvailability();
}

interface Entry {
  studio: true;
  hash: string;
  back?: string;
  focus?: string;
  library?: string;
  helpReturn?: string;
}

function entry(): Entry | undefined {
  const state: unknown = history.state;
  if (!state || typeof state !== 'object' || !('studio' in state) || state.studio !== true || !('hash' in state) || typeof state.hash !== 'string') return undefined;
  return state as Entry;
}

function focusKey() {
  const active = document.activeElement;
  return active instanceof HTMLElement ? active.dataset.focus ?? active.id : undefined;
}

function rememberFocus() {
  history.replaceState({ ...entry(), studio: true, hash: location.hash || '#home', focus: focusKey(), library: lastLibrary, helpReturn }, '');
}

function updateClock() {
  const now = new Date();
  const date = document.querySelector<HTMLTimeElement>('#studio-date');
  if (date) {
    date.dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    date.textContent = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
  }
  const clock = element<HTMLTimeElement>('#studio-clock');
  clock.dateTime = now.toISOString();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function parentHash() {
  if (screen.kind === 'project') return libraryReturn;
  if (screen.kind === 'help') return helpReturn;
  if (screen.kind === 'about' && screen.page > 0) return '#about';
  return '#home';
}

function render(focus?: string, animate = true) {
  imageViewer.close(false);
  const aboutTurn = screen.kind === 'about' && renderedScreen?.kind === 'about' && screen.page !== renderedScreen.page
    ? Math.sign(screen.page - renderedScreen.page) : 0;
  ink.suspend();
  storyPlayer.pause();
  animation?.cancel();
  const rendered = renderScreen(screen);
  app.dataset.screen = screen.kind;
  app.dataset.surface = surfaceKey(screen);
  app.inert = screen.kind === 'opening';
  const selected = selectedProject(screen);
  const keepPlayer = selected && selectedProject(renderedScreen ?? { kind: 'home' })?.id === selected.id
    && !!upper.querySelector('[data-story-player]');
  if (!keepPlayer) {
    storyPlayer.unmount();
    upper.innerHTML = rendered.upper;
  }
  if (!aboutTurn) {
    lower.innerHTML = rendered.lower;
    lowerScroll.scrollTop = 0;
  }
  upperScroll.scrollTop = 0;
  element('#screen-label').textContent = rendered.label;
  const pagination = element('#library-pagination');
  pagination.innerHTML = rendered.footer ?? '';
  pagination.hidden = !rendered.footer;
  document.title = `${rendered.title} · Joji's sketchbook`;
  back.href = parentHash();
  back.setAttribute('aria-label', screen.kind === 'project' ? 'Back to project library' : screen.kind === 'help' ? 'Back from help' : screen.kind === 'about' && screen.page > 0 ? 'Back to About intro' : 'Back to main menu');
  const isHome = screen.kind === 'home' || screen.kind === 'opening';
  back.hidden = isHome;
  element('#home-button').hidden = isHome;
  element('#ink-mount').hidden = screen.kind === 'opening';
  updateClock();
  if (selected) {
    mountingStory = true;
    try {
      const routeScene = screen.kind === 'projects' || screen.kind === 'project' ? screen.scene : undefined;
      const legacyBeat = screen.kind === 'project' && screen.page === 'inside' ? 'details' : 'use';
      const legacyScene = screen.kind === 'project' && screen.page !== 'overview'
        ? projectStories[selected.id].scenes.find(scene => scene.beat === legacyBeat)?.id : undefined;
      storyPlayer.mount(upper.querySelector<HTMLElement>('[data-story-player]')!, selected, routeScene ?? legacyScene ?? projectStories[selected.id].scenes[0].id);
    } finally { mountingStory = false; }
    syncPlayerLinks();
  }
  bindInk();
  guide.setScreen(screen);
  status.textContent = rendered.title;
  if (screen.kind === 'about' && !flipnotesPreloaded) {
    flipnotesPreloaded = true;
    flipnotes.forEach((note) => { const image = new Image(); image.src = note.image; });
  }
  if (focus) {
    const target = document.querySelector<HTMLElement>(`[data-focus="${CSS.escape(focus)}"]`) ?? document.getElementById(focus) ?? element('#screen-title');
    (target.closest('[inert]') ? lowerScroll : target).focus({ preventScroll: true });
  }
  if (animate && !reducedMotion.matches) {
    if (aboutTurn) {
      const sheet = upper.querySelector<HTMLElement>('.creator-sheet')!;
      animation = sheet.animate([
        { transform: `perspective(900px) rotateY(${aboutTurn * 65}deg)`, opacity: .35, transformOrigin: aboutTurn > 0 ? 'left center' : 'right center' },
        { transform: 'perspective(900px) rotateY(0deg)', opacity: 1, transformOrigin: aboutTurn > 0 ? 'left center' : 'right center' },
      ], { duration: 220, easing: 'steps(5, end)' });
    } else animation = lower.animate(
      [{ clipPath: 'inset(0 0 20% 0)' }, { clipPath: 'inset(0)' }],
      { duration: 160, easing: 'steps(4, end)' },
    );
  }
  renderedScreen = screen;
}

function navigate(hash: string, replace = false, focus = 'screen-title') {
  rememberFocus();
  let next = readScreen(hash);
  if (selectedProject(next) && selectedProject(next)?.id === selectedProject(screen)?.id &&
      (next.kind === 'project' || (screen.kind === 'project' && next.kind === 'projects')) &&
      !next.scene && storyPlayer.currentScene()) {
    next = { ...next, scene: storyPlayer.currentScene() };
    hash = screenHash(next);
  }
  if (screen.kind === 'projects') lastLibrary = location.hash || '#projects';
  if (next.kind === 'project' && screen.kind !== 'project') libraryReturn = lastLibrary;
  if (next.kind === 'help' && screen.kind !== 'help') helpReturn = location.hash || '#home';
  const previous = location.hash || '#home';
  const state: Entry = { studio: true, hash, back: replace ? entry()?.back : previous, library: lastLibrary, helpReturn, focus };
  history[replace ? 'replaceState' : 'pushState'](state, '', hash);
  screen = next;
  render(focus);
}

function goBack() {
  const target = parentHash();
  if (entry()?.back === target) history.back();
  else navigate(target);
}

function syncFromHistory() {
  const state = entry();
  lastLibrary = state?.library ?? lastLibrary;
  helpReturn = state?.helpReturn ?? '#home';
  libraryReturn = lastLibrary;
  screen = readScreen(location.hash);
  render(state?.focus ?? 'screen-title');
}

window.addEventListener('popstate', syncFromHistory);
// Hash changes made outside the app (including pasted fragments) must use the same renderer.
window.addEventListener('hashchange', () => {
  if (surfaceKey(readScreen(location.hash)) !== surfaceKey(screen)) syncFromHistory();
});

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const control = event.target.closest<HTMLElement>('a,button');
  if (!control || (control instanceof HTMLButtonElement && control.disabled)) return;
  if (control.closest('[data-ink-ui],[data-guide-ui],[data-story-player]')) return;
  if (control.id === 'sound-toggle') {
    audio.toggle();
    return;
  }
  audio.playUI();
  if (control.dataset.select && screen.kind === 'projects') {
    navigate(libraryHash(screen.filter, screen.page, control.dataset.select), true, `project-${control.dataset.select}`);
    return;
  }
  if (!(control instanceof HTMLAnchorElement) || !control.getAttribute('href')?.startsWith('#') || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (control.id === 'open-help' && screen.kind === 'help') return;
  if (control.id === 'back-button') goBack();
  else {
    const hash = control.getAttribute('href')!;
    const replace = control.hasAttribute('data-replace');
    navigate(hash, replace, replace ? control.dataset.focus ?? 'screen-title' : 'screen-title');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (guide.handleEscape(event.target)) {
      event.preventDefault();
      return;
    }
    if (ink.handleEscape()) {
      event.preventDefault();
      return;
    }
    if (screen.kind !== 'opening' && screen.kind !== 'home') goBack();
    event.preventDefault();
  }
  if (screen.kind === 'about' && ['ArrowLeft', 'ArrowRight'].includes(event.key) &&
      !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey &&
      !upperScroll.inert && !app.closest('[inert]') && !(event.target instanceof Element &&
        event.target.closest('input,textarea,select,[contenteditable],[data-guide-ui],[data-ink-ui]'))) {
    event.preventDefault();
    const next = screen.page + (event.key === 'ArrowRight' ? 1 : -1);
    if (next >= 0 && next <= flipnotes.length) {
      navigate(aboutHash(next), true);
      audio.playUI();
    }
    return;
  }
  if (screen.kind !== 'projects' || !(event.target instanceof HTMLElement) || !event.target.matches('[data-select]')) return;
  const directions: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -2, ArrowDown: 2 };
  const direction = directions[event.key];
  if (!direction || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  event.preventDefault();
  const items = libraryPage(screen.filter, screen.page);
  const selectedId = event.target.dataset.select;
  const index = items.findIndex((project) => project.id === selectedId);
  const selected = items[Math.max(0, Math.min(items.length - 1, index + direction))];
  navigate(libraryHash(screen.filter, screen.page, selected.id), true, `project-${selected.id}`);
  audio.playUI();
});

audio.subscribe(({ enabled, error, awaitingGesture }) => {
  const button = element<HTMLButtonElement>('#sound-toggle');
  button.setAttribute('aria-pressed', String(enabled));
  button.setAttribute('aria-label', `Sound ${enabled ? 'on' : 'off'}`);
  button.title = awaitingGesture ? 'Sound on — starts after your first interaction' : `Sound ${enabled ? 'on' : 'off'}`;
  button.innerHTML = icon(enabled ? 'sound' : 'mute');
  if (error) showNotice(error, 'sound');
  else if (element('#app-notice').dataset.source === 'sound') element('#app-notice').hidden = true;
});

function showNotice(message: string, source = 'opening') {
  const notice = element('#app-notice');
  notice.textContent = message;
  notice.dataset.source = source;
  notice.hidden = false;
}

function finishOpening(focus = false) {
  if (screen.kind !== 'opening') return;
  screen = { kind: 'home' };
  render(focus ? 'screen-title' : undefined, false);
}

history.replaceState({ ...entry(), studio: true, hash: location.hash || '#home' }, '');
const homeEntry = screen.kind === 'home';
if (homeEntry && !reducedMotion.matches) screen = { kind: 'opening' };
render(undefined, false);
setupEntry({
  home: homeEntry,
  reducedMotion,
  onReveal: () => finishOpening(),
  onComplete: () => audio.startEntry(homeEntry),
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    animation?.cancel();
  }
});
window.setInterval(updateClock, 30_000);
