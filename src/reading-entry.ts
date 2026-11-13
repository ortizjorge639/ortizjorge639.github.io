import { projects, readingUrl } from './projects';
import { setupStudioGuide } from './guide';
import { StudioAudio } from './audio';
import './reading-guide.css';

// Progressive enhancement: every project and source already exists in static HTML.
const search = document.querySelector<HTMLInputElement>('#project-search');
const items = [...document.querySelectorAll<HTMLElement>('[data-search-item]')];
if (search) {
  const status = document.querySelector<HTMLElement>('#search-status')!;
  const texts = items.map(item => item.textContent?.toLocaleLowerCase() ?? '');
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase();
    let found = 0;
    items.forEach((item, index) => { item.hidden = !texts[index].includes(query); if (!item.hidden) found++; });
    status.textContent = found ? `${found} ${found === 1 ? 'project' : 'projects'} found` : 'No projects found. Try a topic like games, AI, or notes.';
  };
  search.addEventListener('input', update);
  search.form!.addEventListener('reset', () => { search.value = ''; update(); search.focus(); });
  update();
}
const browse = document.querySelector<HTMLDetailsElement>('.project-nav details');
if (browse && matchMedia('(max-width: 740px)').matches) browse.open = false;

const host = document.querySelector<HTMLElement>('#reading-guide-host');
if (host) {
  const audio = new StudioAudio();
  audio.setEnabled(false, false); // Reading stays quiet; no entry jingle or implicit audio.
  const guide = setupStudioGuide(audio, id => {
    const project = projects.find(p => p.id === id);
    if (project) location.assign(readingUrl(project));
  }, { host, app: document.body, preview: document.querySelector('main')!, access: host.querySelector<HTMLButtonElement>('#guide-access')!, reading: true });
  const project = projects.find(p => p.id === document.body.dataset.project);
  guide.setScreen(project ? { kind: 'project', project, page: 'overview' } : { kind: 'home' });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && guide.handleEscape(event.target)) event.preventDefault(); });
}
