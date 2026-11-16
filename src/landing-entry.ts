// Keep the front door independent: no catalog, canvas, audio or app imports.
export {};

const access = document.querySelector<HTMLButtonElement>('#guide-access')!;
const status = document.querySelector<HTMLElement>('#landing-guide-status')!;

// Also cover a same-document visit to an old /#… link after landing has loaded.
window.addEventListener('hashchange', () => {
  if (location.hash) location.replace('/sketchbook/' + location.search + location.hash);
});

if (!location.hash) {
  access.hidden = false;
  document.querySelector<HTMLElement>('#landing-guide-note')!.hidden = false;
  const loadGuide = async () => {
    access.disabled = true;
    access.setAttribute('aria-busy', 'true');
    status.textContent = 'Opening the public-notes guide…';
    try {
      const { setupLandingGuide } = await import('./landing-guide');
      setupLandingGuide(access);
      // The shared guide now owns this same access button, including reopen/hide.
      access.removeEventListener('click', loadGuide);
      status.textContent = '';
    } catch {
      status.textContent = 'The guide could not load. The notes and sketchbook are still available. Reload to try the guide again.';
    } finally {
      access.disabled = false;
      access.removeAttribute('aria-busy');
    }
  };
  access.addEventListener('click', loadGuide);
}
