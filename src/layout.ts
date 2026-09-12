import { icon } from './art';
import { projects } from './projects';

const count = String(projects.length).padStart(2, '0');
const flipbookMark = `<svg class="flipbook-mark" viewBox="0 0 180 100" aria-hidden="true"><path d="m25 53 61-28 69 29-59 30z" fill="currentColor"/><path d="M25 53v16l71 26 59-27V54M96 84v11" fill="none" stroke="currentColor" stroke-width="4"/><path d="M84 24C60 30 33 26 21 9c18 41 72 58 117 31" fill="currentColor"/><path d="m46 54 48 17 37-16" fill="none" stroke="var(--blue)" stroke-width="3"/></svg>`;

export const layout = `
  <header id="home" class="site-header">
    <a href="#home" class="brand" aria-label="Joji's sketchbook home"><img src="/favicon.svg" width="36" height="36" alt="" /><span>joji's sketchbook<small>A PORTFOLIO IN PLAY</small></span></a>
    <nav aria-label="Main navigation"><a href="#projects">Projects <span>${count}</span></a><a href="#about">About</a></nav>
  </header>
  <main>
    <section class="studio-console" aria-labelledby="hero-heading">
      <div class="title-screen">
        <div class="screen-corners" aria-hidden="true"></div>
        <p class="screen-kicker">PERSONAL PROJECT STUDIO</p>
        <h1 id="hero-heading" class="studio-logo"><span>Joji's</span> <strong>Sketchbook</strong></h1>
        ${flipbookMark}
        <p class="title-caption">A few ideas. A lot of play.</p>
        <p class="title-credit">© ${new Date().getFullYear()} Jorge · Built with curiosity</p>
      </div>
      <div class="console-hinge" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="touch-screen">
        <div class="console-status">
          <a href="#home" class="status-home" aria-label="Home">${icon('home')}</a>
          <time id="studio-date" aria-label="Current date"></time>
          <time id="studio-clock" aria-label="Current local time"></time>
          <button id="open-help" aria-haspopup="dialog">Help <span>?</span></button>
        </div>
        <div class="menu-content">
          <p class="menu-prompt">What would you like to do?</p>
          <div class="launchers">
            <a class="launcher" href="#projects">${icon('book')}<span>View<br>Projects</span></a>
            <a class="launcher red-launcher" href="#about">${icon('person')}<span>Meet<br>Joji</span></a>
          </div>
          <a class="community-button" href="https://github.com/ortizjorge639" target="_blank" rel="noopener noreferrer">${icon('folder')} Joji on GitHub ${icon('external')}</a>
          <p class="touch-hint">Make it your own. Try the floating Ink switch.</p>
        </div>
      </div>
    </section>

    <section class="featured-section screen-panel" aria-label="Featured work">
      <div class="window-title"><span>${icon('book')} Project preview</span><span>SELECTED WORK / ${count} PAGES</span></div>
      <div class="featured-content">
        <div class="flipbook" aria-label="Featured project flipbook" tabindex="0">
          <div class="book-top"><span>PREVIEW SCREEN</span><span id="frame-label">FRAME 02 / ${count}</span></div>
          <div id="feature-page"></div>
          <div class="book-controls">
            <button id="previous" class="square-button" aria-label="Previous project">${icon('arrow', 'reverse')}</button>
            <div class="page-dots" aria-label="Choose a featured project">${projects.map((p, i) => `<button data-frame="${i}" aria-label="Show ${p.title}" aria-pressed="${i === 1}">${String(i + 1).padStart(2, '0')}</button>`).join('')}</div>
            <button id="next" class="square-button" aria-label="Next project">${icon('arrow')}</button>
          </div>
        </div>
        <div class="intro-panel">
          <p class="eyebrow">A NOTE FROM THE CREATOR</p>
          <h2>Little experiments.<br> Real code.</h2>
          <p>Hey, I'm Jorge <span class="handwriting">(also Joji).</span> I build things at the intersection of AI, tech, media, and games. This is where the experiments live.</p>
          <div class="topic-strip"><span>AI</span><span>TECH</span><span>MEDIA</span><span>GAMING</span></div>
          <p class="intro-note">${icon('pen')} Some tools. Some toys.<br>All a work in progress.</p>
        </div>
      </div>
    </section>

    <section id="projects" class="projects-section screen-panel" aria-labelledby="projects-title">
      <div class="window-title"><h2 id="projects-title">${icon('folder')} View projects</h2><span>PUBLIC COLLECTION / 2026</span></div>
      <div class="filter-bar"><div class="filters" role="group" aria-label="Filter projects">${['All', 'AI', 'Tech', 'Media', 'Gaming'].map((c) => `<button data-filter="${c}" aria-pressed="${c === 'All'}">${c === 'All' ? 'All pages' : c}${c === 'All' ? `<span>${count}</span>` : ''}</button>`).join('')}</div><p id="result-count" role="status">${projects.length} pages to explore</p></div>
      <div id="project-grid" class="project-grid"></div>
      <div class="panel-bottom"><span>Select a page to see what's inside.</span><a href="#home">${icon('arrow', 'reverse')} Back</a></div>
    </section>

    <section id="about" class="about screen-panel" aria-labelledby="about-title">
      <div class="window-title"><h2 id="about-title">${icon('person')} Creator details</h2><span>PROFILE / 01</span></div>
      <div class="about-content"><div class="avatar-doodle" aria-hidden="true"><svg viewBox="0 0 150 150"><path d="M33 74q-6-49 40-48 47-3 42 49l-5 32-24 23-33-9-18-26z" fill="#ede6d5" stroke="currentColor" stroke-width="3"/><path d="m32 61 4-33 19 10 12-20 16 16 23-7 11 38M47 72h23v17H47zM84 72h23v17H84zM70 77h14m-20 31q17 11 31-3" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg><span>JORGE / JOJI</span></div><div><h3>Always making. Always learning.</h3><p>I'm Jorge, a builder who likes thoughtful tools, playful interfaces, and finding out what happens when different interests overlap. My public repos are a working notebook: AI conversations, creative workflows, and a few games along the way.</p><a class="text-link" href="https://github.com/ortizjorge639" target="_blank" rel="noopener noreferrer">Find me on GitHub ${icon('external')}</a></div></div>
    </section>
  </main>
  <footer><span>© ${new Date().getFullYear()} JORGE · ONE FRAME AT A TIME</span><button id="sound-toggle" aria-pressed="false">${icon('mute')} Sound off</button><a href="#home" aria-label="Back to top">${icon('home')} Home</a></footer>
  <dialog id="project-dialog" aria-labelledby="dialog-title"><div class="dialog-top"><span>${icon('book')} Project details</span><button id="close-dialog" aria-label="Close project details">${icon('arrow', 'reverse')} Back</button></div><div id="dialog-content"></div></dialog>
  <dialog id="help-dialog" aria-labelledby="help-title"><div class="dialog-top"><h2 id="help-title">Studio help</h2><button id="close-help" aria-label="Close help">${icon('arrow', 'reverse')} Back</button></div><div class="help-content"><h3>Welcome to the sketchbook.</h3><p>This is Jorge's portfolio: a collection of public experiments in AI, tech, media, and gaming.</p><dl><div><dt>${icon('book')} View projects</dt><dd>Filter the collection, open a page for details, or flip through the preview with the arrow buttons. Arrow keys work while the preview is focused.</dd></div><div><dt>${icon('pen')} Ink the page</dt><dd>The floating Ink switch makes the portfolio your canvas. Drag or click to draw; open the tool tray for pixel pen, dithered paint, eraser, colors, and optional mouse-hover painting. Links and buttons still work. On touchscreens, turn Ink off to scroll. Pinch to zoom still works.</dd></div><div><dt>${icon('undo')} Keep your marks</dt><dd>Undo also restores cleared ink. Use the keyboard-accessible star stamp or save a transparent PNG of your ink only. Marks stay in this tab and reset on reload. Escape closes the tool tray, then turns Ink off.</dd></div><div><dt>${icon('sound')} Quiet little sounds</dt><dd>Enabling Ink turns on soft, original drawing sounds unless you have already muted them. The speaker button and footer share one sound setting. Nothing plays before your first interaction, and reduced-motion preferences are respected.</dd></div></dl><button id="help-done" class="primary-button">Got it ${icon('arrow')}</button></div></dialog>
`;
