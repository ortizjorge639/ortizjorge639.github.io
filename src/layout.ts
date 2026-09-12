import { icon } from './art';
import { projects } from './projects';

const count = String(projects.length).padStart(2, '0');
const flipbookMark = `<svg class="flipbook-mark" viewBox="0 0 180 100" aria-hidden="true"><path d="m25 53 61-28 69 29-59 30z" fill="currentColor"/><path d="M25 53v16l71 26 59-27V54M96 84v11" fill="none" stroke="currentColor" stroke-width="4"/><path d="M84 24C60 30 33 26 21 9c18 41 72 58 117 31" fill="currentColor"/><path d="m46 54 48 17 37-16" fill="none" stroke="var(--blue)" stroke-width="3"/></svg>`;

export const layout = `
  <header id="home" class="site-header">
    <a href="#home" class="brand" aria-label="Joji's sketchbook home"><img src="/favicon.svg" width="36" height="36" alt="" /><span>joji's sketchbook<small>A PORTFOLIO IN PLAY</small></span></a>
    <nav aria-label="Main navigation"><a href="#projects">Projects <span>${count}</span></a><a href="#playground">Create</a><a href="#about">About</a></nav>
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
            <a class="launcher red-launcher" href="#playground">${icon('pen')}<span>Create<br>Scribble</span></a>
          </div>
          <a class="community-button" href="https://github.com/ortizjorge639" target="_blank" rel="noopener noreferrer">${icon('folder')} Joji on GitHub ${icon('external')}</a>
          <p class="touch-hint">Touch, click, or use your keyboard.</p>
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

    <section id="playground" class="playground screen-panel" aria-labelledby="playground-title">
      <div class="window-title"><h2 id="playground-title">${icon('pen')} Create a scribble</h2><span>YOUR OWN BLANK PAGE</span></div>
      <div class="editor-layout">
        <aside class="editor-guide" aria-label="Drawing guide">
          <div class="guide-icon">${icon('pen')}</div>
          <h3>Make your mark.</h3>
          <p>Pick a pen, paint a little, and take your sketch with you.</p>
          <dl><div><dt>01</dt><dd>Choose a tool</dd></div><div><dt>02</dt><dd>Pick your ink</dd></div><div><dt>03</dt><dd>Draw something</dd></div></dl>
          <p class="privacy-note">Only in this tab.<br>Not uploaded. Not tracked.</p>
        </aside>
        <div class="drawing-desk">
          <div class="editor-status"><span>${icon('page')} UNTITLED SKETCH</span><button id="grid-toggle" aria-pressed="true">Grid on</button></div>
          <div class="canvas-wrap"><canvas id="drawing" width="1000" height="625" aria-label="Freehand drawing canvas. Use a pointer or touch to draw. Keyboard users can add a stamp with the button below."></canvas><span class="canvas-hint handwriting" aria-hidden="true">your next great idea goes here...</span></div>
          <div class="drawing-toolbar">
            <div role="group" aria-label="Drawing tools"><button data-tool="pen" aria-label="Pen" aria-pressed="true" title="Pen">${icon('pen')}</button><button data-tool="brush" aria-label="Paintbrush" aria-pressed="false" title="Paintbrush">${icon('brush')}</button><button data-tool="eraser" aria-label="Eraser" aria-pressed="false" title="Eraser">${icon('eraser')}</button></div>
            <span class="tool-divider"></span>
            <div class="ink-colors" role="group" aria-label="Ink color"><button data-color="#3157bc" style="--swatch:#3157bc" aria-label="Blue ink" aria-pressed="true"></button><button data-color="#d44836" style="--swatch:#d44836" aria-label="Red ink" aria-pressed="false"></button><button data-color="#292b30" style="--swatch:#292b30" aria-label="Black ink" aria-pressed="false"></button></div>
            <div class="drawing-actions"><button id="undo" aria-label="Undo last stroke" title="Undo" disabled>${icon('undo')}</button><button id="save-drawing" aria-label="Download drawing as PNG" title="Download PNG">${icon('download')}</button></div>
          </div>
          <div class="drawing-bottom"><span id="drawing-status" role="status">Blue pen · ready when you are</span><button id="stamp">Add a star stamp ✳</button></div>
        </div>
      </div>
      <div class="panel-bottom"><a href="#projects">${icon('arrow', 'reverse')} Back to projects</a><span>DRAW · UNDO · DOWNLOAD</span></div>
    </section>

    <section id="about" class="about screen-panel" aria-labelledby="about-title">
      <div class="window-title"><h2 id="about-title">${icon('person')} Creator details</h2><span>PROFILE / 01</span></div>
      <div class="about-content"><div class="avatar-doodle" aria-hidden="true"><svg viewBox="0 0 150 150"><path d="M33 74q-6-49 40-48 47-3 42 49l-5 32-24 23-33-9-18-26z" fill="#ede6d5" stroke="currentColor" stroke-width="3"/><path d="m32 61 4-33 19 10 12-20 16 16 23-7 11 38M47 72h23v17H47zM84 72h23v17H84zM70 77h14m-20 31q17 11 31-3" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg><span>JORGE / JOJI</span></div><div><h3>Always making. Always learning.</h3><p>I'm Jorge, a builder who likes thoughtful tools, playful interfaces, and finding out what happens when different interests overlap. My public repos are a working notebook: AI conversations, creative workflows, and a few games along the way.</p><a class="text-link" href="https://github.com/ortizjorge639" target="_blank" rel="noopener noreferrer">Find me on GitHub ${icon('external')}</a></div></div>
    </section>
  </main>
  <footer><span>© ${new Date().getFullYear()} JORGE · ONE FRAME AT A TIME</span><button id="sound-toggle" aria-pressed="false">${icon('mute')} Sound off</button><a href="#home" aria-label="Back to top">${icon('home')} Home</a></footer>
  <dialog id="project-dialog" aria-labelledby="dialog-title"><div class="dialog-top"><span>${icon('book')} Project details</span><button id="close-dialog" aria-label="Close project details">${icon('arrow', 'reverse')} Back</button></div><div id="dialog-content"></div></dialog>
  <dialog id="help-dialog" aria-labelledby="help-title"><div class="dialog-top"><h2 id="help-title">Studio help</h2><button id="close-help" aria-label="Close help">${icon('arrow', 'reverse')} Back</button></div><div class="help-content"><h3>Welcome to the sketchbook.</h3><p>This is Jorge's portfolio: a collection of public experiments in AI, tech, media, and gaming.</p><dl><div><dt>${icon('book')} View projects</dt><dd>Filter the collection, open a page for details, or flip through the preview with the arrow buttons. Arrow keys work while the preview is focused.</dd></div><div><dt>${icon('pen')} Create a scribble</dt><dd>Draw with a mouse, stylus, or touch. Pick an ink color, undo a mark, and download your drawing. The star stamp also works with a keyboard.</dd></div><div><dt>${icon('sound')} Keep it comfortable</dt><dd>Page sounds start off. Turn them on in the footer if you like. Reduced-motion preferences are respected. Sketches stay in this tab and reset on reload.</dd></div></dl><button id="help-done" class="primary-button">Got it ${icon('arrow')}</button></div></dialog>
`;
