import './ink.css';
import { icon } from './art';
import { StudioAudio } from './audio';
import { paintSegment, replayInk, type InkAction, type InkPoint, type InkStroke, type InkTool } from './ink-renderer';

const excluded = 'a,button,input,select,textarea,label,summary,[contenteditable],[role="button"],[data-ink-ui],[data-guide-ui],dialog';
const toolNames: Record<InkTool, string> = { pen: 'Pen', paint: 'Paint', eraser: 'Eraser' };
const toolIcons = { pen: 'pen', paint: 'brush', eraser: 'eraser' } as const;
const colors = [
  { name: 'Blue', value: '#3157bc' },
  { name: 'Red', value: '#d44836' },
  { name: 'Black', value: '#292b30' },
];

type Pane = 'upper' | 'lower';
type SurfaceAction = { id: number; action: InkAction };
type Surface = { root: HTMLElement; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; width: number; height: number; scale: number };

export interface PageInkController {
  setSurface(key: string, surfaces: { upper: HTMLElement; lower: HTMLElement }, upperKey?: string): void;
  suspend(): void;
  handleEscape(): boolean;
  isEnabled(): boolean;
  onEnabled(listener: (enabled: boolean) => void): () => void;
}

export function setupPageInk(audio: StudioAudio, mount: HTMLElement): PageInkController {
  const widget = document.createElement('aside');
  widget.className = 'ink-widget';
  widget.dataset.inkUi = '';
  widget.setAttribute('aria-label', 'Page ink');
  widget.innerHTML = `
    <div id="ink-panel" class="ink-panel" aria-label="Ink options" hidden>
      <div class="ink-panel-heading"><span>Ink tools</span><button id="ink-close-panel" aria-label="Close ink tools">×</button></div>
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
  mount.append(widget);

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
  const histories = new Map<string, SurfaceAction[]>();
  let paneHistory: Record<Pane, SurfaceAction[]> = { upper: [], lower: [] };
  let nextAction = 0;
  const enabledListeners = new Set<(enabled: boolean) => void>();
  let surfaces: Partial<Record<Pane, Surface>> = {};
  let listeners: AbortController | undefined;
  let observer: ResizeObserver | undefined;
  let active: { stroke: InkStroke; pointerId: number; pane: Pane } | undefined;
  let pressedPointer: number | undefined;
  let enabled = false;
  let tool: InkTool = 'pen';
  let color = colors[0];
  let size = 1;
  let resizeFrame = 0;
  let statusTimer: ReturnType<typeof setTimeout> | undefined;

  function announce(message: string) {
    clearTimeout(statusTimer);
    status.textContent = message;
    status.classList.add('is-visible');
    statusTimer = setTimeout(() => status.classList.remove('is-visible'), 6500);
  }
  function syncHistory() {
    const history = [...new Map(Object.values(paneHistory).flat().map(item => [item.id, item])).values()];
    undo.disabled = history.length === 0;
    let visibleInk = false;
    for (const pane of ['upper', 'lower'] as const) {
      let visible = false;
      for (const { action } of paneHistory[pane]) {
        if (action.kind === 'clear') visible = false;
        else if (action.tool !== 'eraser') visible = true;
      }
      visibleInk ||= visible;
    }
    clear.disabled = !visibleInk;
    save.disabled = !visibleInk;
    for (const surface of Object.values(surfaces)) surface.canvas.dataset.actionCount = String(history.length);
  }
  function replay() {
    for (const pane of ['upper', 'lower'] as const) {
      const surface = surfaces[pane];
      if (!surface) continue;
      const actions = paneHistory[pane].map(item => item.action);
      replayInk(surface.ctx, actions, surface.width, surface.height);
      if (active?.pane === pane) replayInkStroke(surface, active.stroke);
    }
  }
  function replayInkStroke(surface: Surface, stroke: InkStroke) {
    stroke.points.forEach((point, index) => paintSegment(surface.ctx, stroke, stroke.points[Math.max(0, index - 1)], point));
  }
  function resize() {
    resizeFrame = 0;
    for (const surface of Object.values(surfaces)) {
      const { root, canvas, ctx } = surface;
      // Exclude the previous canvas extent when measuring reflowed content.
      canvas.hidden = true;
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.scrollHeight, root.clientHeight);
      canvas.hidden = false;
      if (width === surface.width && height === surface.height) continue;
      interruptStroke();
      surface.width = width;
      surface.height = height;
      surface.scale = Math.min(1, 16000 / width, 16000 / height, Math.sqrt(8_000_000 / (width * height)));
      canvas.width = Math.max(1, Math.round(width * surface.scale));
      canvas.height = Math.max(1, Math.round(height * surface.scale));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(surface.scale, 0, 0, surface.scale, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }
    replay();
    positionTray();
  }
  function requestResize() {
    if (!resizeFrame) resizeFrame = requestAnimationFrame(resize);
  }
  function finishStroke() {
    if (!active) return;
    paneHistory[active.pane].push({ id: ++nextAction, action: active.stroke });
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
    if (open) positionTray();
    if (focus) (open ? element<HTMLButtonElement>('[data-ink-tool]') : toolsToggle).focus();
  }
  function setEnabled(value: boolean) {
    interruptStroke();
    enabled = value;
    enabledListeners.forEach(listener => listener(enabled));
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? 'Disable page ink' : 'Enable page ink');
    actions.hidden = !enabled;
    syncEnabled();
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
  }
  function syncEnabled() {
    for (const surface of Object.values(surfaces)) {
      surface.root.classList.toggle('ink-enabled', enabled);
      surface.canvas.dataset.enabled = String(enabled);
      surface.canvas.dataset.tool = tool;
    }
  }
  function eligible(event: PointerEvent): Pane | undefined {
    if (!enabled || !event.isPrimary || document.querySelector('dialog[open]')) return;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    if (!target || target.closest(excluded)) return;
    for (const pane of ['upper', 'lower'] as const) {
      if (surfaces[pane]?.root.contains(target)) return pane;
    }
  }
  function point(event: PointerEvent, surface: Surface): InkPoint {
    const bounds = surface.canvas.getBoundingClientRect();
    return {
      // Content-local CSS pixels are retained across resize, clipping, and scrolling.
      x: Math.round(event.clientX - bounds.left),
      y: Math.round(event.clientY - bounds.top),
      pressure: event.pointerType === 'pen' ? Math.max(0.1, event.pressure) : event.buttons & 1 ? 0.8 : 0.3,
    };
  }
  function draw(event: PointerEvent, pane: Pane) {
    const surface = surfaces[pane]!;
    const next = point(event, surface);
    if (!active || active.pointerId !== event.pointerId || active.pane !== pane) {
      finishStroke();
      active = { pane, pointerId: event.pointerId, stroke: { kind: 'stroke', tool, color: color.value, size, points: [next] } };
      paintSegment(surface.ctx, active.stroke, next);
    } else {
      const previous = active.stroke.points[active.stroke.points.length - 1];
      if (Math.hypot(next.x - previous.x, next.y - previous.y) < 1) return;
      active.stroke.points.push(next);
      paintSegment(surface.ctx, active.stroke, previous, next);
    }
    audio.draw(tool, next.pressure);
  }
  function pointerDown(event: PointerEvent) {
    if (!enabled) return;
    interruptStroke();
    const pane = eligible(event);
    if (event.button !== 0 || !pane) return;
    if (!panel.hidden) setPanel(false);
    pressedPointer = event.pointerId;
    if (event.pointerType !== 'touch') event.preventDefault();
    draw(event, pane);
  }
  function pointerMove(event: PointerEvent) {
    const pane = eligible(event);
    if (!pane || (active && active.pane !== pane)) { interruptStroke(); return; }
    const dragging = pressedPointer === event.pointerId && (event.buttons & 1) !== 0;
    const hovering = hoverInput.checked && event.pointerType === 'mouse' && event.buttons === 0;
    if (!dragging && !hovering) { finishStroke(); return; }
    draw(event, pane);
  }
  function handleEscape() {
    if (!panel.hidden) {
      setPanel(false, true);
      return true;
    } else if (enabled) {
      setEnabled(false);
      toggle.focus();
      return true;
    }
    return false;
  }
  toggle.addEventListener('click', () => setEnabled(!enabled));
  toolsToggle.addEventListener('click', (event) => setPanel(panel.hidden, event.detail === 0));
  element<HTMLButtonElement>('#ink-close-panel').addEventListener('click', () => setPanel(false, true));
  soundToggle.addEventListener('click', () => audio.toggle());
  widget.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (button && button !== soundToggle && !button.disabled) audio.playUI();
  });
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
    syncEnabled();
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
    const latest = Math.max(0, ...Object.values(paneHistory).map(history => history.at(-1)?.id ?? 0));
    for (const history of Object.values(paneHistory)) if (history.at(-1)?.id === latest) history.pop();
    replay();
    syncHistory();
    announce('Last ink action undone.');
  });
  clear.addEventListener('click', () => {
    finishStroke();
    const clearAction: SurfaceAction = { id: ++nextAction, action: { kind: 'clear' } };
    paneHistory.upper.push(clearAction);
    paneHistory.lower.push(clearAction);
    replay();
    syncHistory();
    announce('Ink cleared. Undo brings it back.');
  });
  element<HTMLButtonElement>('#ink-stamp').addEventListener('click', () => {
    finishStroke();
    const surface = surfaces.upper;
    if (!surface) return;
    const bounds = surface.canvas.getBoundingClientRect();
    const viewport = surface.root.parentElement!.getBoundingClientRect();
    const center = { x: surface.width / 2, y: (Math.max(bounds.top, viewport.top) + Math.min(bounds.bottom, viewport.bottom)) / 2 - bounds.top };
    const points: InkPoint[] = [];
    for (let i = 0; i <= 10; i++) {
      const angle = i * Math.PI / 5 - Math.PI / 2;
      const radius = i % 2 ? 14 : 32;
      points.push({ x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius, pressure: 0.8 });
    }
    const stroke: InkStroke = { kind: 'stroke', tool: 'pen', color: color.value, size: 1, points };
    paneHistory.upper.push({ id: ++nextAction, action: stroke });
    replayInkStroke(surface, stroke);
    syncHistory();
    announce('Star stamped in the visible upper screen.');
  });
  save.addEventListener('click', () => {
    finishStroke();
    const upper = surfaces.upper;
    const lower = surfaces.lower;
    if (!upper || !lower) return;
    const canvas = document.createElement('canvas');
    const width = Math.max(upper.width, lower.width);
    const height = upper.height + lower.height;
    const scale = Math.min(1, 16000 / width, 16000 / height, Math.sqrt(16_000_000 / (width * height)));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) { announce('Could not export your ink. Please try again.'); return; }
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(upper.canvas, 0, 0, upper.width, upper.height);
    ctx.drawImage(lower.canvas, 0, upper.height, lower.width, lower.height);
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
  function positionTray() {
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    const dock = widget.getBoundingClientRect();
    const bottom = Math.max(top + 8, Math.min(dock.top - 8, top + height - 8));
    for (const tray of [panel, status]) {
      tray.style.width = `${Math.max(0, Math.min(310, width - 16))}px`;
      tray.style.left = `${Math.max(left + 8, Math.min(dock.right - Math.min(310, width - 16), left + width - Math.min(310, width - 16) - 8))}px`;
      tray.style.bottom = `${Math.max(8, window.innerHeight - bottom)}px`;
      tray.style.maxHeight = `${Math.max(0, bottom - top - 8)}px`;
    }
  }
  function suspend() {
    interruptStroke();
    setPanel(false);
    listeners?.abort();
    observer?.disconnect();
    cancelAnimationFrame(resizeFrame);
    resizeFrame = 0;
    for (const surface of Object.values(surfaces)) {
      surface.root.classList.remove('ink-enabled');
      surface.canvas.remove();
    }
    surfaces = {};
  }
  function setSurface(key: string, roots: { upper: HTMLElement; lower: HTMLElement }, upperKey = key) {
    suspend();
    for (const pane of ['upper', 'lower'] as const) {
      const historyKey = `${pane}:${pane === 'upper' ? upperKey : key}`;
      paneHistory[pane] = histories.get(historyKey) ?? [];
      histories.set(historyKey, paneHistory[pane]);
      const root = roots[pane];
      const canvas = document.createElement('canvas');
      canvas.className = 'screen-ink-canvas';
      canvas.dataset.pane = pane;
      canvas.dataset.surfaceKey = pane === 'upper' ? upperKey : key;
      canvas.setAttribute('aria-hidden', 'true');
      root.append(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        canvas.remove();
        announce('Page ink is unavailable in this browser.');
        continue;
      }
      surfaces[pane] = { root, canvas, ctx, width: 0, height: 0, scale: 1 };
    }
    toggle.disabled = Object.keys(surfaces).length !== 2;
    listeners = new AbortController();
    const { signal } = listeners;
    document.addEventListener('pointerdown', (event) => {
      if (!panel.hidden && event.target instanceof Node && !widget.contains(event.target)) setPanel(false);
      pointerDown(event);
    }, { capture: true, signal });
    document.addEventListener('pointermove', pointerMove, { passive: true, signal });
    document.addEventListener('pointerup', interruptStroke, { signal });
    document.addEventListener('pointercancel', interruptStroke, { signal });
    document.addEventListener('pointerout', (event) => { if (event.relatedTarget === null) interruptStroke(); }, { signal });
    document.addEventListener('scroll', interruptStroke, { capture: true, passive: true, signal });
    document.addEventListener('visibilitychange', interruptStroke, { signal });
    window.addEventListener('blur', interruptStroke, { signal });
    window.addEventListener('resize', () => { interruptStroke(); requestResize(); }, { signal });
    window.visualViewport?.addEventListener('resize', positionTray, { signal });
    window.visualViewport?.addEventListener('scroll', positionTray, { signal });
    observer = new ResizeObserver(requestResize);
    Object.values(surfaces).forEach(({ root }) => {
      observer!.observe(root);
      if (root.parentElement) observer!.observe(root.parentElement);
    });
    syncEnabled();
    resize();
    syncHistory();
  }
  syncHistory();
  return { setSurface, suspend, handleEscape, isEnabled: () => enabled,
    onEnabled(listener) { enabledListeners.add(listener); return () => { enabledListeners.delete(listener); }; } };
}
