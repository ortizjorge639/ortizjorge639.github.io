import './guide.css';
import { icon } from './art';
import { createFrog } from './frog';
import { projects } from './projects';
import type { StudioAudio } from './audio';
import type { Screen } from './navigation';

interface Citation { id: string; title: string; url: string; projectId: string | null }
interface Answer { grounded?: boolean; answer: string; citations: Citation[]; suggestedProjects?: string[]; contextProjectId: string | null }
interface Message { role: 'user' | 'assistant'; content: string }
interface Question { question: string; projectId: string | null; history: Message[] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}
function projectExists(id: unknown): id is string {
  return typeof id === 'string' && projects.some((project) => project.id === id);
}
function validSource(url: string, id: string | null) {
  try {
    const parsed = new URL(url);
    const project = projects.find(p => p.id === id);
    const repoPath = project?.repo ? new URL(project.repo).pathname : `/ortizjorge639/${id}`;
    const approvedPage = !!project?.sources?.some(s => s.url === url && ['https://v0-just-play-app.vercel.app/about','https://firstmind.app','https://getflowlog.lovable.app'].includes(s.url));
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password
      && (approvedPage || (id !== null && project?.repo !== '' && parsed.hostname === 'github.com' && parsed.pathname.startsWith(`${repoPath}/`))
        || parsed.hostname === 'ortizjorge639.github.io');
  } catch { return false; }
}
function readAnswer(value: unknown): Answer {
  if (!isRecord(value) || typeof value.answer !== 'string' || !value.answer.trim() || value.answer.length > 10000
    || !Array.isArray(value.citations) || value.citations.length > 12
    || !(value.contextProjectId === null || projectExists(value.contextProjectId))) {
    throw new Error('The guide returned an unreadable answer. Please try again.');
  }
  const citations: Citation[] = value.citations.map((citation: unknown) => {
    if (!isRecord(citation) || typeof citation.id !== 'string' || typeof citation.title !== 'string'
      || typeof citation.url !== 'string' || !(citation.projectId === null || projectExists(citation.projectId)) || !validSource(citation.url, citation.projectId)) {
      throw new Error("I couldn't verify the answer's source links. Please try again.");
    }
    return { id: citation.id, title: citation.title, url: citation.url, projectId: citation.projectId };
  });
  return {
    answer: value.answer,
    grounded: value.grounded === true,
    citations,
    contextProjectId: value.contextProjectId,
    suggestedProjects: Array.isArray(value.suggestedProjects) ? value.suggestedProjects.filter(projectExists) : [],
  };
}

interface GuideSurface { host: HTMLElement; app: HTMLElement; preview: HTMLElement; access: HTMLButtonElement; reading?: boolean }
export function setupStudioGuide(audio: StudioAudio, onProject: (id: string) => void, surface?: GuideSurface) {
  const host = surface?.host ?? document.querySelector<HTMLElement>('.upper-screen')!;
  const app = surface?.app ?? document.querySelector<HTMLElement>('.studio-app')!;
  const preview = surface?.preview ?? document.querySelector<HTMLElement>('#upper-scroll')!;
  const access = surface?.access ?? document.querySelector<HTMLButtonElement>('#guide-access')!;
  const root = document.createElement('div');
  root.className = 'guide-root';
  root.dataset.guideUi = '';
  root.dataset.open = 'false';
  root.dataset.phase = 'idle';
  root.innerHTML = `
    <button class="frog-trigger" id="frog-trigger" aria-label="Ask the studio frog" aria-controls="guide-panel" aria-expanded="false">
      <span class="frog-sprite"></span><span class="frog-invitation" hidden>Ask me!</span><span class="frog-unread" hidden aria-label="New answer"></span>
    </button>
    <section id="guide-panel" class="guide-panel" aria-labelledby="guide-title" hidden>
      <div class="guide-header">
        <div><h2 id="guide-title" tabindex="-1">Studio guide</h2><span class="guide-byline">SMALL FROG. PUBLIC NOTES.</span></div>
        <button id="guide-expand" aria-label="Expand guide" aria-pressed="false" title="More room">${icon('external')}</button>
        <details class="guide-menu"><summary aria-label="Guide options" title="Guide options">···</summary><div><button id="guide-clear">Clear conversation</button><button id="guide-hide">Hide guide</button></div></details>
        <button id="guide-minimize" aria-label="Minimize guide" title="Minimize">−</button>
      </div>
      <div class="guide-context"><span class="guide-signal" aria-hidden="true"></span><span id="guide-context-label">Next question: all projects</span><span class="guide-ai-label">AI</span></div>
      <div class="guide-log" id="guide-log" role="log" aria-label="Conversation with the studio guide" aria-live="polite" tabindex="0">
        <div class="guide-welcome"><p class="guide-hello"><span class="guide-hello-full">A curious little<br>source of direction.</span><span class="guide-hello-compact">Let's look it up.</span></p><p class="guide-welcome-note">Ask about the work. I'll bring the receipts.</p><div class="guide-starters"><button data-question="Which projects run locally?">Which projects run locally? ${icon('arrow')}</button><button data-question="Where should I start exploring this portfolio?">Find me a starting point ${icon('arrow')}</button></div></div>
      </div>
      <div class="guide-feedback" hidden><p id="guide-feedback-text" role="status"></p><button id="guide-retry" hidden>Try again</button><button id="guide-connect" hidden>Reconnect</button></div>
      <form class="guide-composer" aria-label="Ask a portfolio question">
        <label class="sr-only" for="guide-question">Your question</label>
        <textarea id="guide-question" rows="1" maxlength="1200" placeholder="What are you curious about?" aria-describedby="guide-privacy"></textarea>
        <button id="guide-send" type="submit" aria-label="Send question" disabled>${icon('arrow')}</button>
        <button id="guide-stop" type="button" hidden>Stop</button>
      </form>
      <p class="guide-public-links"><a href="/read/">Browse public project notes</a></p><details class="guide-privacy"><summary id="guide-connection">Local Copilot CLI · privacy</summary><p id="guide-privacy">Questions and relevant public project excerpts are sent to GitHub Copilot through the local CLI. Copilot may retain local session records. This is an AI guide, not Jorge. Chat stays in this tab’s memory and resets on reload or a change between reading pages. No chat transcript is uploaded to this site’s storage.</p></details>
    </section>`;
  host.append(root);

  const find = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const trigger = find<HTMLButtonElement>('#frog-trigger');
  const frog = createFrog(find('.frog-sprite'));
  const panel = find<HTMLElement>('#guide-panel');
  const log = find<HTMLElement>('#guide-log');
  const input = find<HTMLTextAreaElement>('#guide-question');
  const send = find<HTMLButtonElement>('#guide-send');
  const stop = find<HTMLButtonElement>('#guide-stop');
  const feedback = find<HTMLElement>('.guide-feedback');
  const retry = find<HTMLButtonElement>('#guide-retry');
  const connect = find<HTMLButtonElement>('#guide-connect');
  const invitation = find<HTMLElement>('.frog-invitation');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const configuredApi = (import.meta as ImportMeta & { env?: Record<string,string> }).env?.VITE_GUIDE_API ?? '';
  const publicApi = /^https:\/\/[a-z0-9-]+\.azurewebsites\.net$/.test(configuredApi) ? configuredApi : '';
  const api = publicApi;
  const hostedUnavailable = 'Live answers are temporarily unavailable. Browse the public project notes below.';
  if (publicApi) {
    find('#guide-connection').textContent = 'Azure OpenAI · privacy';
    find('#guide-privacy').textContent = 'Questions, up to six recent messages and relevant public project excerpts are sent to Azure OpenAI only when you send. This site stores no chat transcripts. Microsoft may process flagged content for abuse monitoring and human review; Global Standard may process outside the resource region. Do not send sensitive information. This is AI, not Jorge; citations identify supplied notes, not a guarantee of factual correctness. Chat stays in tab memory and resets on page changes or reload. The service has a small global budget and may be unavailable.';
  }
  const transcript: Message[] = [];
  let current: Screen = { kind: 'home' };
  let contextProjectId: string | null = null;
  let open = false;
  let hidden = false;
  let expanded = false;
  let available = false;
  let greeted = false;
  let request: AbortController | undefined;
  let lastQuestion: Question | undefined;
  let health: AbortController | undefined;
  let positionAnimation: Animation | undefined;
  let panelAnimation: Animation | undefined;
  let clearArmed = false;
  let greetingTimer: ReturnType<typeof setTimeout> | undefined;
  const openListeners = new Set<(open: boolean) => void>();

  function feedbackMessage(message: string, retryable = false, reconnect = false) {
    feedback.hidden = !message;
    find('#guide-feedback-text').textContent = message;
    retry.hidden = !retryable;
    connect.hidden = !reconnect;
  }
  function position(animate = false) {
    if (surface?.reading) { frog.refreshGaze(); return; }
    const before = trigger.getBoundingClientRect();
    const bounds = host.getBoundingClientRect();
    const mark = current.kind === 'home' && !open ? host.querySelector<HTMLElement>('.flipbook-mark') : null;
    const size = open ? 44 : bounds.width < 450 ? 48 : 58;
    let x = 8;
    let y = bounds.height - size - 4;
    if (open) { x = 7; y = 3; }
    else if (mark) {
      const rect = mark.getBoundingClientRect();
      x = Math.min(bounds.width - size - 80, rect.right - bounds.left + 12);
      y = Math.max(8, rect.top - bounds.top + (rect.height - size) / 2);
    }
    const left = `${Math.round(x)}px`;
    const top = `${Math.round(y)}px`;
    const changed = trigger.style.left !== left || trigger.style.top !== top || trigger.style.width !== `${size}px`;
    if (!changed) return;
    trigger.style.width = `${size}px`;
    trigger.style.height = `${size}px`;
    trigger.style.left = left;
    trigger.style.top = top;
    frog.refreshGaze();
    positionAnimation?.cancel();
    if (animate && !reduced.matches && !hidden && !document.hidden) {
      const after = trigger.getBoundingClientRect();
      positionAnimation = trigger.animate([
        { transform: `translate(${before.left - after.left}px, ${before.top - after.top}px)` },
        { transform: 'translate(0, -7px)', offset: .7 },
        { transform: 'none' },
      ], { duration: 280, easing: 'steps(5, end)' });
      frog.play('hop');
    }
  }
  function syncViewport() {
    const viewport = window.visualViewport;
    const keyboard = open && document.activeElement === input && (viewport?.scale ?? 1) <= 1.05
      && (viewport?.height ?? innerHeight) < innerHeight - 100;
    app.dataset.guideKeyboard = String(keyboard);
    document.documentElement.style.setProperty('--guide-viewport-height', `${Math.round(viewport?.height ?? innerHeight)}px`);
    document.documentElement.style.setProperty('--guide-viewport-top', `${Math.round(viewport?.offsetTop ?? 0)}px`);
    position();
  }
  function setExpanded(value: boolean) {
    expanded = value;
    app.dataset.guideExpanded = String(open && expanded);
    const button = find<HTMLButtonElement>('#guide-expand');
    button.setAttribute('aria-pressed', String(value));
    button.setAttribute('aria-label', value ? 'Reduce guide' : 'Expand guide');
    requestAnimationFrame(syncViewport);
  }
  function setOpen(value: boolean, focus = true) {
    if (value) hidden = false;
    open = value;
    openListeners.forEach(listener => listener(open));
    root.hidden = hidden;
    root.dataset.open = String(open);
    app.dataset.guideOpen = String(open);
    panel.hidden = !open;
    if (!surface?.reading) preview.inert = open;
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Minimize studio guide' : 'Ask the studio frog');
    access.setAttribute('aria-expanded', String(open));
    access.setAttribute('aria-label', open ? 'Minimize studio guide' : 'Show studio guide');
    find<HTMLElement>('.frog-unread').hidden = true;
    invitation.hidden = true;
    if (!open) find<HTMLDetailsElement>('.guide-menu').open = false;
    setExpanded(expanded);
    frog.setVisible(!hidden);
    position(true);
    panelAnimation?.cancel();
    if (open && !reduced.matches) panelAnimation = panel.animate(
      [{ clipPath: 'inset(92% 0 0 0)' }, { clipPath: 'inset(0)' }],
      { duration: 180, easing: 'steps(5, end)' },
    );
    if (focus) (open ? find('#guide-title') : hidden ? access : trigger).focus({ preventScroll: true });
    syncViewport();
    audio.playGuide(open ? 'open' : 'close');
    if (open && !available && !request) void checkBridge();
  }
  async function checkBridge() {
    health?.abort();
    available = false;
    send.disabled = true;
    if ((!local && !publicApi) || (configuredApi && !publicApi)) {
      find('#guide-connection').textContent = 'Local rehearsal · privacy';
      feedbackMessage('Live answers are being rehearsed locally. Browse the projects and sources below; no public AI service is connected yet.');
      return;
    }
    const controller = new AbortController();
    health = controller;
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${api}/api/guide/status`, { signal: controller.signal, credentials: 'omit' });
      const data: unknown = response.ok ? await response.json() : null;
      if (!isRecord(data) || data.available !== true || !['copilot-cli','model-api'].includes(String(data.mode)) || (publicApi && (data.mode !== 'model-api' || data.provider !== 'azure-openai'))) throw new Error(publicApi ? hostedUnavailable : 'The local Copilot bridge is not running. Start npm run dev:guide, then reconnect.');
      available = true;
      send.disabled = !!request;
      feedbackMessage('');
      if (data.mode === 'model-api' && data.provider === 'azure-openai') {
        find('#guide-connection').textContent = 'Azure OpenAI · privacy';
        find('#guide-privacy').textContent = 'Questions, up to six recent messages and relevant public project excerpts are sent to Azure OpenAI. This site stores no chat transcripts. Microsoft may process flagged content for abuse monitoring and human review; Global Standard may process outside the resource region. Do not send sensitive information. This is AI, not Jorge; citations identify supplied notes, not a guarantee of factual correctness. Chat stays in tab memory and resets on page changes or reload. The service has a small global budget and may be unavailable.';
      } else find('#guide-connection').textContent = 'Local Copilot CLI · privacy';
    } catch (error) {
      if (health !== controller) return;
      const message = publicApi ? hostedUnavailable : controller.signal.aborted ? 'The local bridge did not respond. Start npm run dev:guide, then reconnect.'
        : error instanceof Error && !error.message.includes('JSON') ? error.message
          : 'The local Copilot bridge is not running. Start npm run dev:guide, then reconnect.';
      feedbackMessage(message, false, true);
    } finally {
      clearTimeout(timeout);
      if (health === controller) health = undefined;
    }
  }
  function addMessage(role: 'user' | 'assistant', text: string, projectId: string | null, answer?: Answer) {
    find('.guide-welcome')?.remove();
    const article = document.createElement('article');
    article.className = `guide-message guide-message-${role}`;
    const label = document.createElement('div');
    label.className = 'guide-message-label';
    label.textContent = `${role === 'user' ? 'YOU' : 'STUDIO FROG'} · ${projects.find((project) => project.id === projectId)?.title ?? 'All projects'}`;
    const body = document.createElement('p');
    body.textContent = text;
    article.append(label, body);
    if (answer) {
      const sources = document.createElement('div');
      sources.className = 'guide-sources';
      sources.setAttribute('aria-label', 'Answer sources');
      for (const citation of answer.citations) {
        const link = document.createElement('a');
        link.href = citation.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = citation.title;
        link.setAttribute('aria-label', citation.title);
        sources.append(link);
      }
      if (!answer.grounded || !answer.citations.length) {
        const note = document.createElement('small');
        note.textContent = answer.citations.length ? 'Not fully established by the available notes.' : 'Not established by the available notes.';
        sources.append(note);
      }
      article.append(sources);
      const destinations = [...new Set(answer.suggestedProjects?.length ? answer.suggestedProjects : answer.citations.map((citation) => citation.projectId).filter(projectExists))].slice(0, 2);
      for (const id of destinations) {
        const project = projects.find((item) => item.id === id)!;
        const button = document.createElement('button');
        button.className = 'guide-project-link';
        button.textContent = `Open ${project.title} →`;
        button.addEventListener('click', () => onProject(id));
        article.append(button);
      }
    }
    log.append(article);
    log.scrollTop = log.scrollHeight;
  }
  async function ask(question: Question, repeating = false) {
    if (request) return;
    if (!available) {
      feedbackMessage(publicApi ? hostedUnavailable : 'Connect the local Copilot bridge before sending a question.', false, !!publicApi || local);
      return;
    }
    const controller = new AbortController();
    request = controller;
    lastQuestion = question;
    send.hidden = true;
    stop.hidden = false;
    input.disabled = true;
    root.dataset.phase = 'thinking';
    feedbackMessage('Checking the project notes…');
    frog.setMood('read');
    if (!repeating) {
      addMessage('user', question.question, question.projectId);
      transcript.push({ role: 'user', content: question.question });
      input.value = '';
    }
    const timeout = setTimeout(() => controller.abort('timeout'), 95000);
    try {
      const response = await fetch(`${api}/api/guide/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit',
        signal: controller.signal, body: JSON.stringify(question),
      });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(isRecord(data) && typeof data.error === 'string' ? data.error : (publicApi ? hostedUnavailable : 'The local guide could not answer. Please try again.'));
      const answer = readAnswer(data);
      if (answer.contextProjectId !== question.projectId) throw new Error('The answer did not match the requested project context. Please try again.');
      if (request !== controller) return;
      addMessage('assistant', answer.answer, question.projectId, answer);
      transcript.push({ role: 'assistant', content: answer.answer });
      root.dataset.phase = 'answered';
      feedbackMessage('');
      frog.setMood(answer.citations.length ? 'rest' : 'puzzled');
      if (answer.citations.length) frog.play('answer');
      if (open && !document.hidden) audio.playGuide('answer');
      else find<HTMLElement>('.frog-unread').hidden = false;
    } catch (error) {
      if (request !== controller) return;
      root.dataset.phase = controller.signal.aborted && controller.signal.reason !== 'timeout' ? 'idle' : 'error';
      const message = controller.signal.aborted
        ? controller.signal.reason === 'timeout' ? 'The answer took too long. Try a shorter question.' : 'Stopped. Your question is still here if you want to try again.'
        : publicApi ? hostedUnavailable : error instanceof SyntaxError ? 'The local bridge returned an unreadable response. Please reconnect.'
          : error instanceof Error ? error.message : 'Could not reach the local guide. Please reconnect.';
      feedbackMessage(message, true);
      frog.setMood('puzzled');
    } finally {
      clearTimeout(timeout);
      if (request === controller) {
        request = undefined;
        send.hidden = false;
        stop.hidden = true;
        send.disabled = !available;
        input.disabled = false;
      }
    }
  }
  function submit() {
    const question = input.value.trim();
    if (!question) { input.focus(); return; }
    void ask({ question, projectId: contextProjectId, history: transcript.slice(-6).map((message) => ({ ...message, content: message.content.slice(0, 1000) })) });
  }
  function setScreen(screen: Screen) {
    current = screen;
    contextProjectId = screen.kind === 'project' ? screen.project.id : screen.kind === 'projects' ? screen.selected.id : null;
    find('#guide-context-label').textContent = `Next question: ${projects.find((project) => project.id === contextProjectId)?.title ?? 'all projects'}`;
    root.dataset.home = String(screen.kind === 'home');
    root.hidden = hidden || screen.kind === 'opening';
    frog.setVisible(!root.hidden);
    position(screen.kind !== 'opening' && greeted);
    if (!greeted && screen.kind === 'home' && !hidden) {
      greeted = true;
      invitation.hidden = false;
      greetingTimer = setTimeout(() => { invitation.hidden = true; }, 4500);
    }
    requestAnimationFrame(() => position());
  }
  trigger.addEventListener('click', () => setOpen(!open));
  audio.onEntryRibbit(() => {
    if (!root.hidden && !request) frog.play('hello');
  });
  function delight() {
    trigger.dataset.delighted = 'true';
    if (!request) frog.play('delight');
  }
  trigger.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') delight(); });
  trigger.addEventListener('pointerleave', () => {
    if (trigger.matches(':focus-visible')) return;
    trigger.dataset.delighted = 'false';
    frog.endDelight();
  });
  trigger.addEventListener('focus', () => { if (trigger.matches(':focus-visible')) delight(); });
  trigger.addEventListener('blur', () => {
    trigger.dataset.delighted = 'false';
    frog.endDelight();
  });
  access.addEventListener('click', () => setOpen(!open));
  find('#guide-minimize').addEventListener('click', () => setOpen(false));
  find('#guide-expand').addEventListener('click', () => setExpanded(!expanded));
  find('#guide-hide').addEventListener('click', () => {
    hidden = true;
    setOpen(false);
    root.hidden = true;
    frog.setVisible(false);
    request?.abort('hidden');
    access.focus({ preventScroll: true });
  });
  find('#guide-clear').addEventListener('click', () => {
    const button = find<HTMLButtonElement>('#guide-clear');
    if (!clearArmed) { clearArmed = true; button.textContent = 'Confirm clear'; return; }
    clearArmed = false;
    button.textContent = 'Clear conversation';
    request?.abort('cleared');
    request = undefined;
    lastQuestion = undefined;
    transcript.length = 0;
    log.replaceChildren();
    input.value = '';
    input.disabled = false;
    send.hidden = false;
    send.disabled = !available;
    stop.hidden = true;
    feedbackMessage('Conversation cleared. Your portfolio ink is untouched.');
    root.dataset.phase = 'idle';
    frog.setMood('rest');
    find<HTMLDetailsElement>('.guide-menu').open = false;
    input.focus();
  });
  find('form').addEventListener('submit', (event) => { event.preventDefault(); submit(); });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); submit(); }
  });
  stop.addEventListener('click', () => request?.abort('stopped'));
  retry.addEventListener('click', () => { if (lastQuestion) void ask(lastQuestion, true); });
  connect.addEventListener('click', () => void checkBridge());
  root.querySelectorAll<HTMLButtonElement>('[data-question]').forEach((button) => button.addEventListener('click', () => {
    input.value = button.dataset.question!;
    input.focus();
  }));
  find<HTMLDetailsElement>('.guide-menu').addEventListener('toggle', (event) => {
    if (!(event.target instanceof HTMLDetailsElement) || event.target.open) return;
    clearArmed = false;
    find('#guide-clear').textContent = 'Clear conversation';
  });
  root.addEventListener('focusin', syncViewport);
  root.addEventListener('focusout', () => requestAnimationFrame(syncViewport));
  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button,a,summary') : null;
    if (target && target !== trigger && target.id !== 'guide-minimize') audio.playUI();
  });
  window.visualViewport?.addEventListener('resize', syncViewport);
  window.visualViewport?.addEventListener('scroll', syncViewport);
  new ResizeObserver(() => position()).observe(host);
  reduced.addEventListener('change', () => {
    if (reduced.matches) { positionAnimation?.cancel(); panelAnimation?.cancel(); clearTimeout(greetingTimer); invitation.hidden = true; }
  });

  return {
    setScreen,
    isOpen: () => open,
    onOpen(listener: (open: boolean) => void) { openListeners.add(listener); return () => { openListeners.delete(listener); }; },
    handleEscape(target: EventTarget | null) {
      if (!open || !(target instanceof Node) || !root.contains(target)) return false;
      const menu = find<HTMLDetailsElement>('.guide-menu');
      if (menu.open) { menu.open = false; menu.querySelector<HTMLElement>('summary')!.focus(); }
      else setOpen(false);
      return true;
    },
  };
}
