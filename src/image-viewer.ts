import './image-viewer.css';

export function setupImageViewer(hooks: { beforeOpen: () => void; canOpen: () => boolean }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-labelledby', 'image-viewer-title');
  dialog.innerHTML = `<header class="image-viewer-header"><h2 id="image-viewer-title"></h2><button type="button" data-image-close aria-label="Close image" autofocus>Close</button></header>
    <div class="image-viewer-viewport" tabindex="0" aria-label="Image. Scroll to pan when zoomed."><div class="image-viewer-stage" hidden></div><p class="image-viewer-message" role="status"></p></div>
    <div class="image-viewer-tools" role="group" aria-label="Image zoom">
      <button type="button" data-image-zoom="-1" aria-label="Zoom out">−</button>
      <output aria-live="polite" aria-label="Zoom level">100%</output>
      <button type="button" data-image-zoom="1" aria-label="Zoom in">+</button>
      <button type="button" data-image-fit>Fit</button>
    </div>`;
  document.body.append(dialog);
  const viewport = dialog.querySelector<HTMLElement>('.image-viewer-viewport')!;
  const stage = dialog.querySelector<HTMLElement>('.image-viewer-stage')!;
  const image = new Image();
  image.draggable = false;
  stage.append(image);
  const message = dialog.querySelector<HTMLElement>('.image-viewer-message')!;
  const zoomOut = dialog.querySelector<HTMLButtonElement>('[data-image-zoom="-1"]')!;
  const zoomIn = dialog.querySelector<HTMLButtonElement>('[data-image-zoom="1"]')!;
  const fit = dialog.querySelector<HTMLButtonElement>('[data-image-fit]')!;
  const levels = [1, 1.5, 2, 3, 4];
  let level = 0;
  let loaded = false;
  let trigger: HTMLButtonElement | undefined;
  let drag: { id: number; x: number; y: number; left: number; top: number } | undefined;
  let backdropDown = false;

  function paint() {
    zoomOut.disabled = !loaded || level === 0;
    zoomIn.disabled = !loaded || level === levels.length - 1;
    fit.disabled = !loaded;
    if ((document.activeElement === zoomOut && zoomOut.disabled) || (document.activeElement === zoomIn && zoomIn.disabled)) {
      viewport.focus({ preventScroll: true });
    }
    dialog.querySelector('output')!.textContent = `${levels[level] * 100}%`;
    if (!loaded || !dialog.open) return;
    const width = viewport.clientWidth, height = viewport.clientHeight;
    const oldWidth = image.width, oldHeight = image.height;
    const centerX = oldWidth ? (viewport.scrollLeft + width / 2 - (stage.clientWidth - oldWidth) / 2) / oldWidth : .5;
    const centerY = oldHeight ? (viewport.scrollTop + height / 2 - (stage.clientHeight - oldHeight) / 2) / oldHeight : .5;
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight) * levels[level];
    const nextWidth = image.naturalWidth * scale, nextHeight = image.naturalHeight * scale;
    image.style.width = `${nextWidth}px`;
    image.style.height = `${nextHeight}px`;
    stage.style.width = `${Math.max(width, nextWidth)}px`;
    stage.style.height = `${Math.max(height, nextHeight)}px`;
    viewport.scrollLeft = (stage.clientWidth - nextWidth) / 2 + centerX * nextWidth - width / 2;
    viewport.scrollTop = (stage.clientHeight - nextHeight) / 2 + centerY * nextHeight - height / 2;
    viewport.dataset.zoomed = String(level > 0);
  }

  function close(restoreFocus = true) {
    if (!dialog.open) return;
    dialog.close();
    drag = undefined;
    viewport.classList.remove('is-dragging');
    if (restoreFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
    trigger = undefined;
  }
  function zoom(delta: number) {
    if (!loaded) return;
    level = Math.max(0, Math.min(levels.length - 1, level + delta));
    paint();
  }
  function syncAvailability() {
    document.querySelectorAll<HTMLButtonElement>('[data-image-open]').forEach(button => {
      button.disabled = !hooks.canOpen() || button.querySelector('img')?.hidden === true;
    });
  }
  image.addEventListener('load', () => {
    loaded = true;
    stage.hidden = false;
    message.hidden = true;
    paint();
  });
  image.addEventListener('error', () => {
    loaded = false;
    stage.hidden = true;
    message.textContent = 'This image could not load. Close the viewer and try opening it again.';
    message.hidden = false;
    paint();
  });
  document.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-image-open]') : null;
    if (!button || button.disabled || !hooks.canOpen()) return;
    const source = button.querySelector<HTMLImageElement>('img')!;
    hooks.beforeOpen();
    trigger = button;
    level = 0;
    loaded = false;
    stage.hidden = true;
    stage.removeAttribute('style');
    image.removeAttribute('style');
    image.alt = source.alt;
    image.classList.toggle('pixel-art', source.classList.contains('flipnote-art'));
    dialog.querySelector('h2')!.textContent = button.closest('figure')?.querySelector('figcaption')?.textContent ?? source.alt;
    message.textContent = 'Loading image...';
    message.hidden = false;
    dialog.showModal();
    viewport.scrollTo(0, 0);
    paint();
    image.src = source.currentSrc || source.src;
  });
  dialog.querySelector('[data-image-close]')!.addEventListener('click', () => close());
  zoomOut.addEventListener('click', () => zoom(-1));
  zoomIn.addEventListener('click', () => zoom(1));
  fit.addEventListener('click', () => { level = 0; paint(); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')];
      const first = controls[0], last = controls.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    if (['+', '=', '-', '0'].includes(event.key)) {
      event.preventDefault();
      if (event.key === '0') { level = 0; paint(); }
      else zoom(event.key === '-' ? -1 : 1);
    }
  });
  const outside = (event: MouseEvent) => {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropDown = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => { if (backdropDown && event.target === dialog && outside(event)) close(); });
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !loaded || !level) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    viewport.scrollLeft = drag.left - event.clientX + drag.x;
    viewport.scrollTop = drag.top - event.clientY + drag.y;
  });
  viewport.addEventListener('lostpointercapture', () => { drag = undefined; viewport.classList.remove('is-dragging'); });
  new ResizeObserver(() => { if (dialog.open) paint(); }).observe(viewport);
  return { close, syncAvailability, isOpen: () => dialog.open };
}
