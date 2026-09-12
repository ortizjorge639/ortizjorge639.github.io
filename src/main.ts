import './style.css';
import { projects, repoUrl, type Category, type Project } from './projects';
import { icon, illustration } from './art';
import { setupDrawing } from './drawing';
import { layout } from './layout';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = layout;

const projectGrid = document.querySelector<HTMLDivElement>('#project-grid')!;
const dialog = document.querySelector<HTMLDialogElement>('#project-dialog')!;
const help = document.querySelector<HTMLDialogElement>('#help-dialog')!;
let frame = 1;
let soundEnabled = false;
let audio: AudioContext | undefined;
let animationTimer: ReturnType<typeof setTimeout> | undefined;

function playFlip() {
  if (!soundEnabled) return;
  audio ??= new AudioContext();
  void audio.resume().catch((error: unknown) => {
    console.warn('Page sound could not start', error);
    soundEnabled = false;
    updateSoundButton();
  });
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(420, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(140, audio.currentTime + 0.07);
  gain.gain.setValueAtTime(0.035, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.08);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.08);
}

function renderFeature(animate = false) {
  const project = projects[frame];
  const page = document.querySelector<HTMLDivElement>('#feature-page')!;
  clearTimeout(animationTimer);
  page.classList.remove('flipping');
  page.innerHTML = `
    <button class="feature-visual ${project.color}" data-project="${project.id}" aria-label="Explore ${project.title}">
      ${project.image ? `<img src="${project.image}" alt="${project.imageAlt}" width="1000" height="625" />` : illustration(project.illustration)}
      <span class="preview-label">${project.image ? 'ACTUAL PROJECT CAPTURE' : 'ORIGINAL PROJECT SKETCH'}</span>
    </button>
    <div class="feature-caption"><div><span class="eyebrow">${project.categories.join(' / ')}</span><h2>${project.title}</h2><p>${project.subtitle}</p></div><button data-project="${project.id}" class="details-button" aria-label="Read about ${project.title}">Details ${icon('arrow')}</button></div>`;
  document.querySelector('#frame-label')!.textContent = `FRAME ${String(frame + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
  document.querySelectorAll<HTMLButtonElement>('[data-frame]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.frame) === frame)));
  if (animate) {
    void page.offsetWidth;
    page.classList.add('flipping');
    animationTimer = setTimeout(() => page.classList.remove('flipping'), 240);
    playFlip();
  }
}

function changeFrame(direction: number) {
  frame = (frame + direction + projects.length) % projects.length;
  renderFeature(true);
}
document.querySelector('#previous')!.addEventListener('click', () => changeFrame(-1));
document.querySelector('#next')!.addEventListener('click', () => changeFrame(1));
document.querySelector<HTMLElement>('.flipbook')!.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  changeFrame(event.key === 'ArrowRight' ? 1 : -1);
});
document.querySelectorAll<HTMLButtonElement>('[data-frame]').forEach((button) => button.addEventListener('click', () => {
  frame = Number(button.dataset.frame);
  renderFeature(true);
}));

function renderProjects(filter: Category | 'All' = 'All') {
  const selected = projects.filter((p) => filter === 'All' || p.categories.includes(filter));
  projectGrid.innerHTML = selected.map((p) => `
    <article class="project-card ${p.color}">
      <button class="card-art" data-project="${p.id}" aria-label="Explore ${p.title}"><span class="card-number">${icon('page')} ${String(projects.indexOf(p) + 1).padStart(2, '0')}</span>${illustration(p.illustration)}<span class="card-corner">${icon('arrow')}</span><span class="art-label">SKETCH / NOT A SCREENSHOT</span></button>
      <div class="card-body"><div class="card-meta"><span>${p.categories.join(' + ')}</span><span>${p.updated.slice(0, 7).replace('-', '.')}</span></div><h3><button data-project="${p.id}">${p.title}</button></h3><p>${p.subtitle}</p><div class="card-bottom"><span>${p.stack.slice(0, 2).join(' / ')}</span>${icon('book')}</div></div>
    </article>`).join('');
  document.querySelector('#result-count')!.textContent = `${selected.length} ${selected.length === 1 ? 'page' : 'pages'} to explore`;
}
document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  renderProjects(button.dataset.filter as Category | 'All');
  playFlip();
}));

function openProject(project: Project) {
  document.querySelector('#dialog-content')!.innerHTML = `
    <div class="detail-art ${project.color}">${project.image ? `<img src="${project.image}" alt="${project.imageAlt}" width="1000" height="625" />` : illustration(project.illustration)}</div>
    <div class="detail-copy"><p class="eyebrow">${project.categories.join(' / ')} · ${project.status}</p><h2 id="dialog-title">${project.title}</h2><p class="detail-description">${project.description}</p><h3>What's inside</h3><ul>${project.capabilities.map((c) => `<li>${c}</li>`).join('')}</ul><div class="stack-tags">${project.stack.map((s) => `<span>${s}</span>`).join('')}</div><p class="project-note">${project.note}</p><div class="detail-links"><a class="primary-button" href="${repoUrl(project)}" target="_blank" rel="noopener noreferrer">View repository ${icon('external')}</a>${project.site ? `<a class="text-link" href="${project.site}" target="_blank" rel="noopener noreferrer">Project walkthrough ${icon('arrow')}</a>` : ''}</div><a class="source-note" href="${repoUrl(project)}#readme" target="_blank" rel="noopener noreferrer">Source: public repository README · reviewed September 2026 ↗</a></div>`;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest<HTMLElement>('[data-project]');
  if (!target) return;
  const project = projects.find((p) => p.id === target.dataset.project);
  if (project) openProject(project);
});
document.querySelector('#close-dialog')!.addEventListener('click', () => dialog.close());
document.querySelector('#open-help')!.addEventListener('click', () => {
  help.showModal();
  document.body.classList.add('modal-open');
});
document.querySelector('#close-help')!.addEventListener('click', () => help.close());
document.querySelector('#help-done')!.addEventListener('click', () => help.close());
for (const modal of [dialog, help]) {
  modal.addEventListener('click', (event) => {
    if (event.target !== modal) return;
    const bounds = modal.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) modal.close();
  });
  modal.addEventListener('close', () => {
    document.body.classList.toggle('modal-open', dialog.open || help.open);
  });
}

function updateSoundButton() {
  const button = document.querySelector<HTMLButtonElement>('#sound-toggle')!;
  button.setAttribute('aria-pressed', String(soundEnabled));
  button.innerHTML = `${icon(soundEnabled ? 'sound' : 'mute')} Sound ${soundEnabled ? 'on' : 'off'}`;
}
document.querySelector('#sound-toggle')!.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  updateSoundButton();
  playFlip();
});
document.querySelector('footer a')!.addEventListener('click', (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  document.querySelector<HTMLAnchorElement>('.brand')!.focus({ preventScroll: true });
});
const gridToggle = document.querySelector<HTMLButtonElement>('#grid-toggle')!;
gridToggle.addEventListener('click', () => {
  const showGrid = gridToggle.getAttribute('aria-pressed') !== 'true';
  gridToggle.setAttribute('aria-pressed', String(showGrid));
  gridToggle.textContent = `Grid ${showGrid ? 'on' : 'off'}`;
  document.querySelector('.canvas-wrap')!.classList.toggle('grid-hidden', !showGrid);
});

function updateClock() {
  const now = new Date();
  const date = document.querySelector<HTMLTimeElement>('#studio-date')!;
  const clock = document.querySelector<HTMLTimeElement>('#studio-clock')!;
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  date.dateTime = `${year}-${month}-${day}`;
  date.textContent = `${month}/${day}/${year}`;
  clock.dateTime = now.toISOString();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}
updateClock();
window.setInterval(updateClock, 30_000);
renderFeature();
renderProjects();
setupDrawing();
