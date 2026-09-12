import './ink.css';
import { icon } from './art';
import { StudioAudio } from './audio';
import { paintSegment, replayInk, type InkAction, type InkPoint, type InkStroke, type InkTool } from './ink-renderer';

const excluded = 'a,button,input,select,textarea,label,summary,[contenteditable],[role="button"],[data-ink-ui],dialog';
const toolNames: Record<InkTool, string> = { pen: 'Pen', paint: 'Paint', eraser: 'Eraser' };
const toolIcons = { pen: 'pen', paint: 'brush', eraser: 'eraser' } as const;
const colors = [
  { name: 'Blue', value: '#3157bc' },
  { name: 'Red', value: '#d44836' },
  { name: 'Black', value: '#292b30' },
];

export function setupPageInk(audio: StudioAudio) {
  const app = document.querySelector<HTMLElement>('#app')!;
  const canvas = document.createElement('canvas');
  canvas.id = 'page-ink-canvas';
  canvas.className = 'page-ink-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const widget = document.createElement('aside');
  widget.className = 'ink-widget';
  widget.dataset.inkUi = '';
  widget.setAttribute('aria-label', 'Page ink');
  widget.innerHTML = `
    <div id="ink-panel" class="ink-panel" aria-label="Ink options" hidden>
      <div class="ink-panel-heading"><span>YOUR POCKET STUDIO</span><button id="ink-close-panel" aria-label="Close ink tools">×</button></div>
      <div class="ink-tool-choices" role="group" aria-label="Drawing tool">
        ${(['pen', 'paint', 'eraser'] as const).map((tool) => `<button data-ink-tool="${tool}" aria-pressed="${tool === 'pen'}">${icon(toolIcons[tool])}<span>${toolNames[tool]}</span></button>`).join('')}
      </div>
      <div class="ink-options-row">
        <div class="ink-colors" role="group" aria-label="Ink color">${colors.map((color, i) => `<button data-ink-color="${color.value}" style="--swatch:${color.value}" aria-label="${color.name} ink" aria-pressed="${i === 0}"></button>`).join('')}</div>
        <div class="ink-sizes" role="group" aria-label="Nib size">${[1, 1.6, 2.2].map((size, i) => `<button data-ink-size="${size}" aria-label="${['Fine', 'Medium', 'Broad'][i]} nib" aria-pressed="${i === 0}"><i style="--nib:${4 + i * 4}px"></i></button>`).join('')}</div>
      </div>
      <label class="ink-hover-option"><span>Paint on hover <small>Mouse only · no click needed</small></span><input id="ink-hover" type="checkbox" role="switch" /></label>
      <div class="ink-utility-row"><button id="ink-stamp">Star stamp ✳</button><button id="ink-save" disabled>${icon('download')} Save ink</button><button id="ink-clear" disabled>Clear</button></div>
      <p class="ink-privacy">Only in this tab. Save exports your ink, not the page.</p>
    </div>
    <div class="ink-dock">
      <button id="ink-toggle" aria-label="Enable page ink" aria-pressed="false">${icon('pen')}<span>Ink</span><i class="ink-switch" aria-hidden="true"></i></button>
      <div id="ink-actions" class="ink-dock-actions" hidden>
        <button id="ink-tools-toggle" aria-label="Open ink tools" aria-controls="ink-panel" aria-expanded="false" title="Tools and colors">${icon('pen')}<i class="ink-color-dot"></i></button>
        <button id="ink-undo" aria-label="Undo last ink action" title="Undo" disabled>${icon('undo')}</button>
        <button id="ink-sound" aria-label="Enable drawing sounds" aria-pressed="false" title="Sound effects">${icon('mute')}</button>
      </div>
    </div>
    <p id="ink-status" class="ink-status" role="status" aria-live="polite"></p>`;
  document.body.append(widget);

  function element<T extends HTMLElement>(selector: string) {
    return widget.querySelector<T>(selector)!;
  }
  const toggle = element<HTMLButtonElement>('#ink-toggle');
  const actions = element<HTMLElement>('#ink-actions');
  const panel = element<HTMLElement>('#ink-panel');
  const toolsToggle = element<HTMLButtonElement>('#ink-tools-toggle');
  const soundToggle = element<HTMLButtonElement>('#ink-sound');
  const undo = element<HTMLButtonElement>('#ink-undo');
  const save = element<HTMLButtonElement>('#ink-save');
  const clear = element<HTMLButtonElement>('#ink-clear');
  const status = element<HTMLElement>('#ink-status');
  const hoverInput = element<HTMLInputElement>('#ink-hover');
  const context = canvas.getContext('2d');
  if (!context) {
    toggle.disabled = true;
    status.textContent = 'Page ink is unavailable in this browser.';
    console.warn('Page ink could not create a 2D canvas context');
    return;
  }
  const ctx = context;
  const history: InkAction[] = [];
  let active: { stroke: InkStroke; pointerId: number } | undefined;
  let pressedPointer: number | undefined;
  let enabled = false;
  let tool: InkTool = 'pen';
  let color = colors[0];
  let size = 1;
  let width = 0;
  let height = 0;
  let scale = 1;
  let resizeFrame = 0;
  let statusTimer: ReturnType<typeof setTimeout> | undefined;

  function announce(message: string) {
    clearTimeout(statusTimer);
    status.textContent = message;
    status.classList.add('is-visible');
    statusTimer = setTimeout(() => status.classList.remove('is-visible'), 6500);
  }
  function syncHistory() {
    undo.disabled = history.length === 0;
    let visibleInk = false;
    for (const action of history) {
      if (action.kind === 'clear') visibleInk = false;
      else if (action.tool !== 'eraser') visibleInk = true;
    }
    clear.disabled = !visibleInk;
    save.disabled = !visibleInk;
    canvas.dataset.actionCount = String(history.length);
  }
  function replay() {
    replayInk(ctx, history, width, height);
    if (active) replayInkStroke(active.stroke);
  }
  function replayInkStroke(stroke: InkStroke) {
    stroke.points.forEach((point, index) => paintSegment(ctx, stroke, stroke.points[Math.max(0, index - 1)], point));
  }
  function resize() {
    resizeFrame = 0;
    const nextWidth = document.documentElement.clientWidth;
    const nextHeight = Math.ceil(Math.max(window.innerHeight, app.getBoundingClientRect().bottom + window.scrollY));
    if (nextWidth === width && nextHeight === height) return;
    width = nextWidth;
    height = nextHeight;
    // One backing pixel per CSS pixel keeps the nib crisp and the full-page layer bounded.
    scale = Math.min(1, 16000 / width, 16000 / height, Math.sqrt(16_000_000 / (width * height)));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    replay();
  }
  function requestResize() {
    if (!resizeFrame) resizeFrame = requestAnimationFrame(resize);
  }
  function finishStroke() {
    if (!active) return;
    history.push(active.stroke);
    active = undefined;
    syncHistory();
  }
  function interruptStroke() {
    finishStroke();
    pressedPointer = undefined;
  }
  function setPanel(open: boolean, focus = false) {
    finishStroke();
    panel.hidden = !open;
    toolsToggle.setAttribute('aria-expanded', String(open));
    toolsToggle.setAttribute('aria-label', open ? 'Close ink tools' : 'Open ink tools');
    if (focus) (open ? element<HTMLButtonElement>('[data-ink-tool]') : toolsToggle).focus();
  }
  function setEnabled(value: boolean) {
    interruptStroke();
    enabled = value;
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? 'Disable page ink' : 'Enable page ink');
    actions.hidden = !enabled;
    document.body.classList.toggle('ink-enabled', enabled);
    canvas.dataset.enabled = String(enabled);
    if (enabled) {
      resize();
      announce(matchMedia('(pointer: coarse)').matches
        ? 'Drag to draw. Turn Ink off to scroll; pinching still zooms.'
        : 'Drag or click to draw. Open tools for paint, hover, and colors.');
      audio.enableForInk();
    } else {
      setPanel(false);
      announce('Ink off. Your marks stay until you clear them.');
    }
    audio.playUI();
  }
  function eligible(event: PointerEvent) {
    if (!enabled || !event.isPrimary || document.querySelector('dialog[open]')) return false;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    return target !== null && !target.closest(excluded);
  }
  function point(event: PointerEvent): InkPoint {
    return {
      x: Math.round(event.clientX + window.scrollX),
      y: Math.round(event.clientY + window.scrollY),
      pressure: event.pointerType === 'pen' ? Math.max(0.1, event.pressure) : event.buttons & 1 ? 0.8 : 0.3,
    };
  }
  function draw(event: PointerEvent) {
    const next = point(event);
    if (!active || active.pointerId !== event.pointerId) {
      finishStroke();
      active = { pointerId: event.pointerId, stroke: { kind: 'stroke', tool, color: color.value, size, points: [next] } };
      paintSegment(ctx, active.stroke, next);
    } else {
      const previous = active.stroke.points[active.stroke.points.length - 1];
      if (Math.hypot(next.x - previous.x, next.y - previous.y) < 1) return;
      active.stroke.points.push(next);
      paintSegment(ctx, active.stroke, previous, next);
    }
    audio.draw(tool, next.pressure);
  }
  document.addEventListener('pointerdown', (event) => {
    if (!enabled) return;
    interruptStroke();
    if (event.button !== 0 || !eligible(event)) return;
    if (!panel.hidden) setPanel(false);
    pressedPointer = event.pointerId;
    event.preventDefault();
    draw(event);
  }, { capture: true });
  document.addEventListener('pointermove', (event) => {
    if (!eligible(event)) { finishStroke(); return; }
    const dragging = pressedPointer === event.pointerId && (event.buttons & 1) !== 0;
    const hovering = hoverInput.checked && event.pointerType === 'mouse' && event.buttons === 0;
    if (!dragging && !hovering) { finishStroke(); return; }
    draw(event);
  }, { passive: true });
  document.addEventListener('pointerup', (event) => {
    if (event.pointerId === pressedPointer) interruptStroke();
  });
  document.addEventListener('pointercancel', interruptStroke);
  document.addEventListener('pointerout', (event) => { if (event.relatedTarget === null) interruptStroke(); });
  window.addEventListener('blur', interruptStroke);
  window.addEventListener('scroll', interruptStroke, { passive: true });
  document.addEventListener('visibilitychange', interruptStroke);
  document.addEventListener('pointerover', (event) => {
    if (!enabled || !(event.target instanceof Element)) return;
    const control = event.target.closest('button,a');
    const previous = event.relatedTarget instanceof Element ? event.relatedTarget.closest('button,a') : null;
    if (control && control !== previous) audio.playUI(true);
  });
  document.addEventListener('click', (event) => {
    if (enabled && event.target instanceof Element && event.target.closest('button,a')) audio.playUI();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
    if (!panel.hidden) {
      event.preventDefault();
      setPanel(false, true);
    } else if (enabled) {
      event.preventDefault();
      setEnabled(false);
      toggle.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!panel.hidden && event.target instanceof Node && !widget.contains(event.target)) setPanel(false);
  });
  toggle.addEventListener('click', () => setEnabled(!enabled));
  toolsToggle.addEventListener('click', (event) => setPanel(panel.hidden, event.detail === 0));
  element<HTMLButtonElement>('#ink-close-panel').addEventListener('click', () => setPanel(false, true));
  soundToggle.addEventListener('click', () => audio.toggle());
  audio.subscribe((state) => {
    soundToggle.innerHTML = icon(state.enabled ? 'sound' : 'mute');
    soundToggle.setAttribute('aria-label', state.enabled ? 'Mute drawing sounds' : 'Enable drawing sounds');
    soundToggle.setAttribute('aria-pressed', String(state.enabled));
    if (state.error) announce(state.error);
  });
  widget.querySelectorAll<HTMLButtonElement>('[data-ink-tool]').forEach((button) => button.addEventListener('click', () => {
    finishStroke();
    tool = button.dataset.inkTool as InkTool;
    widget.querySelectorAll('[data-ink-tool]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    toolsToggle.innerHTML = `${icon(toolIcons[tool])}<i class="ink-color-dot"></i>`;
    canvas.dataset.tool = tool;
    announce(`${toolNames[tool]} selected.`);
  }));
  widget.querySelectorAll<HTMLButtonElement>('[data-ink-color]').forEach((button) => button.addEventListener('click', () => {
    finishStroke();
    color = colors.find((candidate) => candidate.value === button.dataset.inkColor)!;
    widget.querySelectorAll('[data-ink-color]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    widget.style.setProperty('--ink-color', color.value);
    announce(`${color.name} ink selected.`);
  }));
  widget.querySelectorAll<HTMLButtonElement>('[data-ink-size]').forEach((button) => button.addEventListener('click', () => {
    finishStroke();
    size = Number(button.dataset.inkSize);
    widget.querySelectorAll('[data-ink-size]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  }));
  hoverInput.addEventListener('change', () => {
    interruptStroke();
    announce(hoverInput.checked ? 'Mouse hover paints now. Links and tools remain clickable.' : 'Hover off. Drag or click to draw.');
  });
  undo.addEventListener('click', () => {
    finishStroke();
    history.pop();
    replay();
    syncHistory();
    announce('Last ink action undone.');
  });
  clear.addEventListener('click', () => {
    finishStroke();
    history.push({ kind: 'clear' });
    replay();
    syncHistory();
    announce('Ink cleared. Undo brings it back.');
  });
  element<HTMLButtonElement>('#ink-stamp').addEventListener('click', () => {
    finishStroke();
    const center = { x: window.innerWidth / 2, y: window.scrollY + window.innerHeight / 2 };
    const points: InkPoint[] = [];
    for (let i = 0; i <= 10; i++) {
      const angle = i * Math.PI / 5 - Math.PI / 2;
      const radius = i % 2 ? 14 : 32;
      points.push({ x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius, pressure: 0.8 });
    }
    const stroke: InkStroke = { kind: 'stroke', tool: 'pen', color: color.value, size: 1, points };
    history.push(stroke);
    replayInkStroke(stroke);
    syncHistory();
    announce('Star stamped in the center of the visible page.');
  });
  save.addEventListener('click', () => {
    finishStroke();
    canvas.toBlob((blob) => {
      if (!blob) { announce('Could not export your ink. Please try again.'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'joji-page-ink.png';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      announce('Ink saved as a transparent PNG. Page content is not included.');
    }, 'image/png');
  });
  new ResizeObserver(requestResize).observe(app);
  window.addEventListener('resize', () => { interruptStroke(); requestResize(); });
  resize();
  syncHistory();
  canvas.dataset.enabled = 'false';
  canvas.dataset.tool = 'pen';
}
