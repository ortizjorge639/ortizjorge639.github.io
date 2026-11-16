import { setupStudioGuide } from './guide';
import { StudioAudio } from './audio';
import { projects, readingUrl } from './projects';
import './reading-guide.css';

export function setupLandingGuide(access: HTMLButtonElement) {
  const host = document.querySelector<HTMLElement>('#reading-guide-host')!;
  const audio = new StudioAudio();
  audio.setEnabled(false, false);
  document.body.classList.add('reading-app');
  const guide = setupStudioGuide(audio, id => {
    const project = projects.find(project => project.id === id);
    if (project) location.assign(readingUrl(project));
  }, { host, app: document.body, preview: document.querySelector('main')!, access, reading: true });
  access.setAttribute('aria-controls', 'guide-panel');
  guide.setScreen({ kind: 'home' });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && guide.handleEscape(event.target)) event.preventDefault();
  });
  // Open only after the visitor's explicit ask; never greet or start audio on load.
  host.querySelector<HTMLButtonElement>('#frog-trigger')!.click();
}
