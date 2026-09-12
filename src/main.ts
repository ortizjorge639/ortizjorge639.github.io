import './style.css';
import { projects, repoUrl, type Category, type Project } from './projects';
import { icon, illustration } from './art';
import { setupDrawing } from './drawing';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="topline"><span>A PERSONAL COLLECTION OF THINGS I'M MAKING</span><span>EST. IN CURIOSITY <span class="tiny-star">✳</span></span></div>
  <header class="site-header">
    <a href="#" class="brand" aria-label="Joji's sketchbook home"><img src="/favicon.svg" width="42" height="42" alt="" /><span>joji's <strong>sketchbook</strong><small>JORGE / BUILDER & EXPLORER</small></span></a>
    <nav aria-label="Main navigation"><a class="nav-work" href="#projects">The work <span>07</span></a><a href="#about">The human</a><a class="github-nav" href="https://github.com/ortizjorge639" target="_blank" rel="noopener noreferrer">GitHub ${icon('external')}</a></nav>
  </header>
  <main>
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-copy">
        <p class="eyebrow"><span class="record-dot"></span> OPEN SKETCHBOOK · VOL. 01</p>
        <h1 id="hero-heading">A few ideas.<br>A lot of <span class="play-word">play.<svg viewBox="0 0 260 23" aria-hidden="true"><path d="M4 12Q100 1 252 11M20 20Q149 9 235 19"/></svg></span></h1>
        <p class="hero-description">Hey, I'm Jorge <span class="handwriting">(also Joji).</span><br>I build things at the intersection of AI, tech, media, and games. This is where the experiments live.</p>
        <a class="primary-button" href="#projects">Flip through my work ${icon('arrow')}</a>
        <div class="margin-note"><svg viewBox="0 0 65 44" aria-hidden="true"><path d="M59 37Q5 43 13 4m-9 8 9-9 10 9"/></svg><span>some tools, some toys.<br>all a work in progress.</span></div>
        <div class="topic-strip"><span>AI</span><i>+</i><span>TECH</span><i>+</i><span>MEDIA</span><i>+</i><span>GAMING</span></div>
      </div>
      <div class="flipbook-wrap">
        <div class="handwriting book-note">a peek inside <span>↴</span></div>
        <div class="flipbook" aria-label="Featured project flipbook" tabindex="0">
          <div class="book-binding" aria-hidden="true">${'<i></i>'.repeat(8)}</div>
          <div class="book-top"><span><i class="record-dot"></i> PROJECT PREVIEW</span><span id="frame-label">FRAME 02 / 07</span></div>
          <div id="feature-page"></div>
          <div class="book-controls"><button id="previous" class="square-button" aria-label="Previous project">${icon('arrow', 'reverse')}</button><div class="page-dots" aria-label="Choose a featured project">${projects.map((p, i) => `<button data-frame="${i}" aria-label="Show ${p.title}" aria-pressed="${i === 1}"></button>`).join('')}</div><button id="next" class="square-button" aria-label="Next project">${icon('arrow')}</button></div>
        </div>
        <div class="under-book"><span class="handwriting">little experiments. real code.</span><span>← FLIP →</span></div>
      </div>
    </section>

    <section id="projects" class="projects-section" aria-labelledby="projects-title">
      <div class="section-heading"><div><p class="eyebrow">THE PROJECT DRAWER</p><h2 id="projects-title">Made of curiosity<span class="red">.</span></h2></div><span class="collection-label">SELECTED PUBLIC REPOS<br>2026 COLLECTION</span></div>
      <div class="filter-bar"><div class="filters" role="group" aria-label="Filter projects">${['All', 'AI', 'Tech', 'Media', 'Gaming'].map((c) => `<button data-filter="${c}" aria-pressed="${c === 'All'}">${c === 'All' ? 'All pages' : c}${c === 'All' ? '<span>07</span>' : ''}</button>`).join('')}</div><p id="result-count" role="status">7 pages to explore</p></div>
      <div id="project-grid" class="project-grid"></div>
      <p class="drawer-footnote"><span>↳</span> Not everything needs to be a startup. Sometimes a good experiment is enough.</p>
    </section>

    <section class="playground" aria-labelledby="playground-title">
      <div class="playground-copy"><p class="eyebrow">A PAGE JUST FOR YOU</p><h2 id="playground-title">Leave a little<br> <span class="handwriting blue">scribble.</span></h2><p>Every sketchbook needs a messy page. Pick a pen, make a mark, take it with you.</p><span class="privacy-note">YOUR CANVAS. JUST IN THIS TAB.<br>NOT UPLOADED. NOT TRACKED.</span></div>
      <div class="drawing-desk"><div class="drawing-toolbar"><div role="group" aria-label="Drawing tools"><button data-tool="pen" aria-label="Pen" aria-pressed="true">${icon('pen')}</button><button data-tool="brush" aria-label="Paintbrush" aria-pressed="false">${icon('brush')}</button><button data-tool="eraser" aria-label="Eraser" aria-pressed="false">${icon('eraser')}</button></div><span class="tool-divider"></span><div class="ink-colors" role="group" aria-label="Ink color"><button data-color="#3157bc" style="--swatch:#3157bc" aria-label="Blue ink" aria-pressed="true"></button><button data-color="#d44836" style="--swatch:#d44836" aria-label="Red ink" aria-pressed="false"></button><button data-color="#292b30" style="--swatch:#292b30" aria-label="Black ink" aria-pressed="false"></button></div><div class="drawing-actions"><button id="undo" aria-label="Undo last stroke" disabled>${icon('undo')}</button><button id="save-drawing" aria-label="Download drawing as PNG">${icon('download')}</button></div></div><div class="canvas-wrap"><canvas id="drawing" width="1000" height="440" aria-label="Freehand drawing canvas. Use a pointer or touch to draw. Keyboard users can add a stamp with the button below."></canvas><span class="canvas-hint handwriting" aria-hidden="true">your next great idea goes here...</span></div><div class="drawing-bottom"><span id="drawing-status" role="status">Blue pen · ready when you are</span><button id="stamp">Add a star stamp ✳</button></div></div>
    </section>

    <section id="about" class="about" aria-labelledby="about-title"><div class="avatar-doodle" aria-hidden="true"><svg viewBox="0 0 150 150"><path d="M33 74q-6-49 40-48 47-3 42 49l-5 32-24 23-33-9-18-26z" fill="#ede6d5" stroke="currentColor" stroke-width="3"/><path d="m32 61 4-33 19 10 12-20 16 16 23-7 11 38M47 72h23v17H47zM84 72h23v17H84zM70 77h14m-20 31q17 11 31-3" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg><span class="handwriting">hi, i'm joji.</span></div><div><p class="eyebrow">THE HUMAN BEHIND THE PAGES</p><h2 id="about-title">Always making. Always learning.</h2><p>I'm Jorge, a builder who likes thoughtful tools, playful interfaces, and finding out what happens when different interests overlap. My public repos are a working notebook: AI conversations, creative workflows, and a few games along the way.</p><a class="text-link" href="https://github.com/ortizjorge639" target="_blank" rel="noopener noreferrer">Find me (and the source) on GitHub ${icon('external')}</a></div><div class="about-stamp" aria-hidden="true">HUMAN<br>MADE WITH<br>CURIOSITY<span>✳</span></div></section>
  </main>
  <footer><span>© ${new Date().getFullYear()} JORGE · BUILT ONE FRAME AT A TIME</span><span class="footer-note">Keep your rough drafts.</span><button id="sound-toggle" aria-pressed="false">${icon('mute')} Sound off</button><a href="#top" aria-label="Back to top">↑ TOP</a></footer>
  <dialog id="project-dialog" aria-labelledby="dialog-title"><div class="dialog-top"><span class="eyebrow">FROM THE PROJECT DRAWER</span><button id="close-dialog" aria-label="Close project details">✕</button></div><div id="dialog-content"></div></dialog>
`;

const projectGrid = document.querySelector<HTMLDivElement>('#project-grid')!;
const dialog = document.querySelector<HTMLDialogElement>('#project-dialog')!;
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
  page.innerHTML = `<button class="feature-visual ${project.color}" data-project="${project.id}" aria-label="Explore ${project.title}">${project.image ? `<img src="${project.image}" alt="${project.imageAlt}" width="1000" height="625" />` : illustration(project.illustration)}<span class="preview-label">${project.image ? 'ACTUAL PROJECT CAPTURE' : 'SKETCHBOOK STUDY'}</span><span class="corner-sticker">${project.categories[0]}<br>IN PLAY</span></button><div class="feature-caption"><div><span class="eyebrow">${project.categories.join(' / ')}</span><h2>${project.title}</h2><p>${project.subtitle}</p></div><button data-project="${project.id}" class="square-button" aria-label="Read about ${project.title}">${icon('arrow')}</button></div>`;
  document.querySelector('#frame-label')!.textContent = `FRAME ${String(frame + 1).padStart(2, '0')} / 07`;
  document.querySelectorAll<HTMLButtonElement>('[data-frame]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.frame) === frame)));
  if (animate) {
    void page.offsetWidth;
    page.classList.add('flipping');
    animationTimer = setTimeout(() => page.classList.remove('flipping'), 360);
    playFlip();
  }
}
function changeFrame(direction: number) {
  frame = (frame + direction + projects.length) % projects.length;
  renderFeature(true);
}
document.querySelector('#previous')!.addEventListener('click', () => changeFrame(-1));
document.querySelector('#next')!.addEventListener('click', () => changeFrame(1));
document.querySelector('.flipbook')!.addEventListener('keydown', (event) => {
  const key = event as KeyboardEvent;
  if (key.key !== 'ArrowLeft' && key.key !== 'ArrowRight') return;
  key.preventDefault();
  changeFrame(key.key === 'ArrowRight' ? 1 : -1);
});
document.querySelectorAll<HTMLButtonElement>('[data-frame]').forEach((button) => button.addEventListener('click', () => {
  frame = Number(button.dataset.frame);
  renderFeature(true);
}));

function renderProjects(filter: Category | 'All' = 'All') {
  const selected = projects.filter((p) => filter === 'All' || p.categories.includes(filter));
  projectGrid.innerHTML = selected.map((p) => `<article class="project-card ${p.color}"><button class="card-art" data-project="${p.id}" aria-label="Explore ${p.title}"><span class="card-number">${String(projects.indexOf(p) + 1).padStart(2, '0')}</span>${illustration(p.illustration)}<span class="card-corner">${icon('arrow')}</span><span class="art-label">A SKETCH, NOT A SCREENSHOT</span></button><div class="card-body"><div class="card-meta"><span>${p.categories.join(' + ')}</span><span>${p.updated.slice(0, 7).replace('-', '.')}</span></div><h3><button data-project="${p.id}">${p.title}</button></h3><p>${p.subtitle}</p><div class="card-bottom"><span>${p.stack.slice(0, 2).join(' / ')}</span><span class="status-dot" aria-hidden="true"></span></div></div></article>`).join('');
  document.querySelector('#result-count')!.textContent = `${selected.length} ${selected.length === 1 ? 'page' : 'pages'} to explore`;
}
document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  renderProjects(button.dataset.filter as Category | 'All');
  playFlip();
}));

function openProject(project: Project) {
  document.querySelector('#dialog-content')!.innerHTML = `<div class="detail-art ${project.color}">${project.image ? `<img src="${project.image}" alt="${project.imageAlt}" width="1000" height="625" />` : illustration(project.illustration)}</div><div class="detail-copy"><p class="eyebrow">${project.categories.join(' / ')} · ${project.status}</p><h2 id="dialog-title">${project.title}</h2><p class="detail-description">${project.description}</p><h3>What's inside</h3><ul>${project.capabilities.map((c) => `<li>${c}</li>`).join('')}</ul><div class="stack-tags">${project.stack.map((s) => `<span>${s}</span>`).join('')}</div><p class="project-note">${project.note}</p><div class="detail-links"><a class="primary-button" href="${repoUrl(project)}" target="_blank" rel="noopener noreferrer">View repository ${icon('external')}</a>${project.site ? `<a class="text-link" href="${project.site}" target="_blank" rel="noopener noreferrer">Project walkthrough ${icon('arrow')}</a>` : ''}</div><a class="source-note" href="${repoUrl(project)}#readme" target="_blank" rel="noopener noreferrer">About this write-up: public repository README, reviewed September 2026 ↗</a></div>`;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
document.addEventListener('click', (event) => {
  const target = (event.target as Element).closest<HTMLElement>('[data-project]');
  if (!target) return;
  const project = projects.find((p) => p.id === target.dataset.project);
  if (project) openProject(project);
});
document.querySelector('#close-dialog')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));

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
renderFeature();
renderProjects();
setupDrawing();
