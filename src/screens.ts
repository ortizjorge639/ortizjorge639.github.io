import { icon, illustration } from './art';
import { aboutHash, flipnotes } from './flipnotes';
import { projects, repoUrl, readingUrl, type Project } from './projects';
import { categories, detailPages, filteredProjects, libraryHash, libraryPage, pageSize, projectHash, type Screen } from './navigation';
import { storyShell } from './story-render';

const count = String(projects.length).padStart(2, '0');
const mark = `<svg class="flipbook-mark" viewBox="0 0 180 100" aria-hidden="true"><path d="m25 53 61-28 69 29-59 30z" fill="currentColor"/><path d="M25 53v16l71 26 59-27V54M96 84v11" fill="none" stroke="currentColor" stroke-width="4"/><path d="M84 24C60 30 33 26 21 9c18 41 72 58 117 31" fill="currentColor"/><path d="m46 54 48 17 37-16" fill="none" stroke="var(--blue)" stroke-width="3"/></svg>`;
const portrait = `<div class="avatar-doodle" aria-hidden="true"><svg viewBox="0 0 150 150"><path d="M33 74q-6-49 40-48 47-3 42 49l-5 32-24 23-33-9-18-26z" fill="#ede6d5" stroke="currentColor" stroke-width="3"/><path d="m32 61 4-33 19 10 12-20 16 16 23-7 11 38M47 72h23v17H47zM84 72h23v17H84zM70 77h14m-20 31q17 11 31-3" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg></div>`;
const external = (href: string, text: string, className = 'action-link') =>
  `<a class="${className}" href="${href}" target="_blank" rel="noopener noreferrer">${text} ${icon('external')}</a>`;
const heading = (text: string) => `<h1 id="screen-title" tabindex="-1">${text}</h1>`;
const socialLinks = `<nav class="social-links" aria-label="Find Joji online">
  <a class="social-button" href="https://github.com/ortizjorge639" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><span class="social-logo" style="--social-icon:url('/icons/github.svg')" aria-hidden="true"></span></a>
  <a class="social-button" href="https://www.linkedin.com/in/jorgeortizflores/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><span class="social-logo" style="--social-icon:url('/icons/linkedin.svg')" aria-hidden="true"></span></a>
</nav>`;

function pageArrow(href: string | undefined, label: string, previous = false) {
  return href
    ? `<a class="page-arrow" href="${href}" data-replace aria-label="${label}" data-focus="${previous ? 'previous-page' : 'next-page'}">${icon('arrow', previous ? 'reverse' : '')}</a>`
    : `<button class="page-arrow" disabled aria-label="${label}">${icon('arrow', previous ? 'reverse' : '')}</button>`;
}

export interface RenderedScreen {
  upper: string;
  lower: string;
  label: string;
  title: string;
  footer?: string;
}

export function renderScreen(screen: Screen): RenderedScreen {
  switch (screen.kind) {
    case 'opening':
    case 'home': {
      const opening = screen.kind === 'opening';
      return {
        label: opening ? 'OPENING' : 'MAIN MENU',
        title: "Joji's Sketchbook",
        upper: `<div class="title-screen">
          <div class="title-line"><span>JORGE / JOJI</span><span>VOL. 01</span></div>
          <div class="studio-logo" aria-label="Joji's Studio"><span>Joji's</span><strong>Studio</strong></div>
          ${mark}
          <p class="title-caption">A portfolio of apps and AI projects.</p>
          <p class="title-credit">© 2026 /ortizjorge639</p>
        </div>`,
        lower: opening
          ? `<div class="opening-content">${heading("Joji's Sketchbook")}<p>A portfolio in play.</p></div>`
          : `<div class="menu-content">
              <div class="menu-heading">${heading('What would you like to do?')}</div>
              <div class="launchers">
                <a class="launcher" href="#projects" data-focus="view-projects">${icon('book')}<span>View<br>Projects</span><small>${count} PUBLIC EXPERIMENTS</small></a>
                <a class="launcher red-launcher" href="#about" data-focus="meet-joji">${icon('person')}<span>Meet<br>Joji</span><small>THE PERSON BEHIND IT</small></a>
              </div>
              ${socialLinks}
              <p class="touch-hint">${icon('pen')} Leave a little ink. This screen is yours.</p><a class="reading-entrance" href="/read/">Read the project notes →</a>
            </div>`,
      };
    }
    case 'projects': {
      const items = libraryPage(screen.filter, screen.page);
      const total = filteredProjects(screen.filter).length;
      const pages = Math.ceil(total / pageSize);
      return {
        label: 'VIEW PROJECTS',
        title: 'Project library',
        upper: storyShell(screen.selected),
        footer: `<div class="page-controls" role="group" aria-label="Library pages">${pageArrow(screen.page > 1 ? libraryHash(screen.filter, screen.page - 1) : undefined, 'Previous library page', true)}<span class="page-count">${screen.page} / ${pages}</span>${pageArrow(screen.page < pages ? libraryHash(screen.filter, screen.page + 1) : undefined, 'Next library page')}</div>`,
        lower: `<div class="library-content">
          <div class="library-heading">${heading('Choose a project')}<span id="result-count">${total} ${total === 1 ? 'project' : 'projects'}</span></div>
          <nav class="filters" aria-label="Project categories">${categories.map((filter) => `<a href="${libraryHash(filter)}" data-replace data-focus="filter-${filter}" ${screen.filter === filter ? 'aria-current="true"' : ''}>${filter}</a>`).join('')}</nav>
          <div class="project-grid" role="group" aria-label="Choose a project to preview">${items.map((project) => `<button class="project-tile ${project.color}" data-select="${project.id}" data-focus="project-${project.id}" aria-pressed="${screen.selected.id === project.id}" aria-label="Preview ${project.title}"><span class="tile-art">${illustration(project.illustration)}</span><span class="tile-copy"><span class="tile-number">${String(projects.indexOf(project) + 1).padStart(2, '0')} <span>${project.categories.join(' / ')}</span></span><strong>${project.title}</strong></span><span class="selection-corner" aria-hidden="true">${icon('arrow')}</span></button>`).join('')}</div>
          <div class="library-controls">
            <a class="primary-button open-project" href="${projectHash(screen.selected.id, 'overview', screen.scene)}" data-focus="open-project" aria-label="Open ${screen.selected.title}">Open ${icon('arrow')}</a>
          </div>
        </div>`,
      };
    }
    case 'project': {
      const project = screen.project;
      const index = detailPages.indexOf(screen.page);
      const titles = ['Overview', "What's inside", 'Links'];
      const body = screen.page === 'overview'
        ? `<div class="detail-status"><span>${project.categories.join(' / ')}</span><span>${project.status}</span></div><p class="detail-description">${project.description}</p>`
        : screen.page === 'inside'
          ? `<ul class="capabilities">${project.capabilities.map((capability) => `<li>${capability}</li>`).join('')}</ul><div class="stack-tags" aria-label="Technology stack">${project.stack.map((stack) => `<span>${stack}</span>`).join('')}</div>`
          : `<p class="project-note">${project.note}</p><div class="detail-links">${repoUrl(project) ? external(repoUrl(project), 'View repository', 'primary-button') : ''}${project.site ? external(project.site, 'Public landing page') : ''}</div>${external(project.sources![0].url, `Source: ${project.sources![0].label} · reviewed ${project.sources![0].reviewed}`, 'source-note')}`;
      return {
        label: 'PROJECT DETAILS',
        title: `${project.title} — ${titles[index]}`,
        upper: storyShell(project),
        lower: `<article class="detail-content">
          <div class="detail-heading">${heading(titles[index])}<span>${String(index + 1).padStart(2, '0')} / 03</span></div>
          <nav class="detail-tabs" aria-label="Project detail pages">${detailPages.map((name, i) => `<a href="${projectHash(project.id, name)}" data-replace data-focus="detail-${name}" ${name === screen.page ? 'aria-current="page"' : ''}>${titles[i]}</a>`).join('')}</nav>
          <div class="detail-body">${body}<a class="reading-entrance" href="${readingUrl(project)}">Read project notes →</a></div>
          <div class="detail-pagination">${pageArrow(index > 0 ? projectHash(project.id, detailPages[index - 1]) : undefined, 'Previous detail page', true)}<span>${index === 2 ? 'Follow the work outside the studio.' : 'Turn the page to see more.'}</span>${pageArrow(index < 2 ? projectHash(project.id, detailPages[index + 1]) : undefined, 'Next detail page')}</div>
        </article>`,
      };
    }
    case 'about': {
      const note = screen.page ? flipnotes[screen.page - 1] : undefined;
      const corner = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 18h16V2Z" /></svg>';
      const previous = screen.page > 0
        ? `<a href="${aboutHash(screen.page - 1)}" class="page-corner previous-corner" data-replace data-focus="about-previous" aria-label="Previous About page" title="Previous page">${corner}</a>`
        : '';
      const next = screen.page < flipnotes.length
        ? `<a href="${aboutHash(screen.page + 1)}" class="page-corner next-corner" data-replace data-focus="about-next" aria-label="Next About page" title="Turn the page">${corner}</a>`
        : '';
      const sheet = note
        ? `<figure class="flipnote-figure">${heading(`Flipnote ${screen.page} of ${flipnotes.length}`)}<div class="flipnote-image-frame"><button type="button" class="image-open" data-image-open aria-label="Enlarge Flipnote ${screen.page}" aria-haspopup="dialog"><img class="flipnote-art" src="${note.image}" width="256" height="192" alt="Joji's original Flipnote artwork, image ${screen.page} of ${flipnotes.length}, ${note.date}" /></button></div><figcaption>${note.date}</figcaption></figure>`
        : `<div class="creator-screen"><div class="creator-art">${portrait}<span class="creator-signature">Jorge / Joji</span></div>${heading('Always making. Always learning.')}<p>AI · TECH · MEDIA · GAMING</p></div>`;
      return {
        label: note ? 'FLIPNOTE ARCHIVE' : 'MEET JOJI',
        title: note ? `Flipnote ${screen.page} — ${note.date}` : 'Meet Joji',
        upper: `<div class="creator-flipbook"><div class="creator-sheet">${sheet}</div><nav class="creator-paging" aria-label="About flipbook pages">${previous}${next}</nav></div>`,
        lower: `<article class="creator-content" aria-label="About Joji"><p>Hey, I'm Jorge <span class="handwriting">(also Joji).</span> I work at Microsoft, with a background in cloud solutions architecture, AI engineering, and human-centered design. I'm also a former Flipnote Studio animator.</p><p>I like thoughtful tools, playful interfaces, and finding out what happens when different interests overlap. Here you'll find apps for AI conversations, creative workflows, and working through a game backlog.</p>${socialLinks}</article>`,
      };
    }
    case 'help': {
      const titles = ['Find your way', 'Make your mark', 'Your pocket studio'];
      const help = [
        `<p>This is Jorge's portfolio: public experiments in AI, tech, media, and gaming.</p><p>Choose <strong>View Projects</strong> and select a thumbnail. Its flipbook starts paused above the catalog. Use Play or the frame arrows to explore; Expand gives it more room. <strong>Open</strong> reveals the description, capabilities, and links below.</p><p>Hover a frame to replay its drawing sequence without turning the page. You can also focus the frame and press Enter, or tap its drawing. Press a screenshot to zoom in.</p><p>Arrow keys move between thumbnails when the catalog has focus, or between frames when the player has focus. Space plays or pauses a focused player. Ink and the guide pause playback. Back restores your collection; your browser's Back button works too.</p>`,
        `<p>Switch <strong>Ink</strong> on to draw on either screen. Links and buttons stay usable. Turn Ink off to scroll long content; pinch to zoom works either way.</p><p>Each destination has its own remembered ink. Returning brings your marks back. Category, library selection, and project detail pages each have their own surface.</p><p>Marks stay in this tab's memory, are never uploaded, and reset on reload. Save exports this destination's two transparent ink layers, not the portfolio.</p>`,
        `<p>Open the tool tray for pen, dithered paint, eraser, colors, nib sizes, optional mouse-hover painting, and a keyboard-accessible star stamp.</p><p><strong>Undo</strong> restores strokes and cleared ink on this screen. Escape closes tools first, then exits Ink, then goes Back.</p><p>Sound starts on. If your browser blocks autoplay, the entry jingle waits for your first interaction. The speaker controls mute all effects, including the frog. Motion follows your device's reduced-motion preference.</p><p class="independent-note">An independent, original homage. Not affiliated with Nintendo. No Nintendo artwork or recordings are used.</p>`,
      ];
      return {
        label: 'STUDIO HELP',
        title: `Help — ${titles[screen.page - 1]}`,
        upper: `<div class="help-screen"><span class="help-glyph" aria-hidden="true">${icon(screen.page === 1 ? 'book' : screen.page === 2 ? 'pen' : 'brush')}</span><h2>${titles[screen.page - 1]}</h2><p>Play a little. Explore a lot.</p></div>`,
        lower: `<article class="help-content"><div class="detail-heading">${heading(titles[screen.page - 1])}<span>${screen.page} / 3</span></div>${help[screen.page - 1]}<div class="help-pagination">${pageArrow(screen.page > 1 ? `#help/${screen.page - 1}` : undefined, 'Previous help page', true)}<span>STUDIO MANUAL</span>${pageArrow(screen.page < 3 ? `#help/${screen.page + 1}` : undefined, 'Next help page')}</div></article>`,
      };
    }
    case 'not-found':
      return {
        label: 'PAGE NOT FOUND',
        title: 'Page not found',
        upper: `<div class="help-screen"><span class="missing-page" aria-hidden="true">?</span><h2>A loose page.</h2><p>Let's get you back to the sketchbook.</p></div>`,
        lower: `<div class="error-content">${heading('That page is not here.')}<p>The address doesn't match a studio screen or project. Choose a destination below.</p><a class="primary-button" href="#projects">View projects ${icon('arrow')}</a><a class="action-link" href="#home">Main menu ${icon('home')}</a></div>`,
      };
  }
}
