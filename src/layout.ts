import { icon } from './art';

export const layout = `
  <!-- THESIS: A portfolio entered as an app, never a scrolling landing page.
  OWN-WORLD: Blue title fields, cream graph paper, red ink, pixel controls; no hardware enclosure.
  STORY: Enter, choose a project, turn through its evidence, follow its source, leave a doodle.
  FIRST VIEWPORT: Two frameless displays share a portrait 1878:2670 canvas. Title above; touch menu below.
  FORM: User-pinned DSi application grammar in a modern portrait canvas; no random concept seed. -->
  <main class="studio-app" aria-label="Joji's sketchbook">
    <section class="display-panel upper-screen" aria-label="Preview screen">
      <div id="upper-scroll" class="screen-body" tabindex="0" aria-label="Preview content">
        <div id="upper-content" class="ink-surface"></div>
      </div>
    </section>
    <section class="display-panel lower-screen" aria-label="Touch screen">
      <div class="screen-status">
        <button id="guide-access" data-guide-ui aria-label="Show studio guide" aria-controls="guide-panel" aria-expanded="false">Guide</button>
        <span id="screen-label">MAIN MENU</span>
        <div class="status-time"><time id="studio-date" aria-label="Current date"></time><time id="studio-clock" aria-label="Current local time"></time></div>
        <button id="sound-toggle" aria-label="Sound on" aria-pressed="true" title="Sound on">${icon('sound')}</button>
        <a id="open-help" href="#help" aria-label="Studio help" title="Studio help">?</a>
      </div>
      <div id="lower-scroll" class="screen-body" tabindex="0" aria-label="Screen content">
        <div id="lower-content" class="ink-surface"></div>
      </div>
      <nav class="screen-navigation" aria-label="Screen navigation">
        <a id="back-button" href="#home" aria-label="Back to main menu">${icon('arrow', 'reverse')}</a>
        <a id="home-button" href="#home" aria-label="Home">${icon('home')}</a>
        <div id="library-pagination" hidden></div>
        <div id="ink-mount"></div>
      </nav>
    </section>
  </main>
  <p id="navigation-status" class="sr-only" role="status" aria-live="polite"></p>
  <p id="app-notice" class="app-notice" role="status" hidden></p>
`;
