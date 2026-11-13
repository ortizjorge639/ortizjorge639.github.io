// One short, stepped drawing sequence per visual. Text and the base diagram
// stay readable; the lightbox traces explain relationships, never loading state.
export function createStoryMotion(root: HTMLElement) {
  const scene = root.querySelector<HTMLElement>('.story-scene')!;
  const animations: Animation[] = [];
  const cleanup: (() => void)[] = [];
  const cues = new Map<HTMLElement, { start: number; end: number }[]>();
  let duration = 0;

  function animate(element: Element, frames: Keyframe[], start: number, length: number, steps = 4) {
    const animation = element.animate(frames, {
      duration: length, delay: start, fill: 'both', easing: `steps(${steps}, end)`,
    });
    animation.pause();
    animations.push(animation);
    duration = Math.max(duration, start + length);
  }
  function cue(element: HTMLElement, start: number, length = 380) {
    cues.set(element, [...(cues.get(element) ?? []), { start, end: start + length }]);
    duration = Math.max(duration, start + length);
  }
  function trace(svg: Element, start: number) {
    svg.querySelectorAll<SVGGeometryElement>('path, circle, rect, polyline').forEach((stroke, index) => {
      const ghost = stroke.cloneNode(true) as SVGElement;
      ghost.classList.add('story-lightbox-stroke');
      stroke.before(ghost);
      const originalLength = stroke.getAttribute('pathLength');
      stroke.setAttribute('pathLength', '100');
      cleanup.push(() => {
        ghost.remove();
        if (originalLength === null) stroke.removeAttribute('pathLength');
        else stroke.setAttribute('pathLength', originalLength);
      });
      animate(stroke, [
        { strokeDasharray: '100 100', strokeDashoffset: '100' },
        { strokeDasharray: '100 100', strokeDashoffset: '0' },
      ], start + Math.min(index * 55, 220), 420, 6);
    });
  }

  if (scene.classList.contains('story-scene--contrast')) {
    trace(scene.querySelector('.story-before svg')!, 0);
    animate(scene.querySelector('.story-transform-arrow')!, [
      { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' },
    ], 240, 180, 3);
    const after = scene.querySelector('.story-after svg')!;
    trace(after, 460);
    animate(after, [
      { transform: 'rotate(-3deg) scale(.96)' },
      { transform: 'rotate(1deg) scale(1.03)', offset: .7 },
      { transform: 'none' },
    ], 460, 340);
  } else if (scene.classList.contains('story-scene--flow')) {
    const nodes = [...scene.querySelectorAll<HTMLElement>('[data-node]')];
    nodes.forEach((node, index) => cue(node, index * 400, 400));
    scene.querySelectorAll<SVGPathElement>('.story-wire').forEach(wire => {
      const from = nodes.findIndex(node => node.dataset.node === wire.dataset.from);
      const to = nodes.find(node => node.dataset.node === wire.dataset.to)!;
      const start = from * 400 + 160;
      const ink = wire.cloneNode(true) as SVGPathElement;
      ink.classList.replace('story-wire', 'story-wire-ink');
      ink.setAttribute('pathLength', '100');
      wire.after(ink);
      cleanup.push(() => ink.remove());
      animate(ink, [
        { strokeDasharray: '100 100', strokeDashoffset: '100', opacity: 1 },
        { strokeDasharray: '100 100', strokeDashoffset: '0', opacity: 1, offset: .65 },
        { strokeDasharray: '100 100', strokeDashoffset: '0', opacity: 0 },
      ], start, 360, 6);
      cue(to, start + 240, 320);
    });
  } else if (scene.classList.contains('story-scene--roles') || scene.classList.contains('story-scene--steps')) {
    scene.querySelectorAll<HTMLElement>('[data-story-step]').forEach((step, index) => {
      cue(step, index * 420, 420);
      const underline = document.createElement('span');
      underline.className = 'story-pencil-line';
      underline.setAttribute('aria-hidden', 'true');
      step.append(underline);
      cleanup.push(() => underline.remove());
      animate(underline, [
        { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
        { clipPath: 'inset(0)', opacity: 1, offset: .6 },
        { clipPath: 'inset(0)', opacity: 0 },
      ], index * 420, 420, 5);
    });
  } else if (scene.classList.contains('story-scene--outcome')) {
    const symbol = scene.querySelector('.story-project-symbol')!;
    trace(symbol, 0);
    animate(symbol, [
      { transform: 'rotate(-4deg) scale(.94)' },
      { transform: 'rotate(2deg) scale(1.03)', offset: .65 },
      { transform: 'none' },
    ], 0, 460);
  } else if (scene.classList.contains('story-scene--image')) {
    const corners = scene.querySelector('.story-image-corners')!;
    trace(corners, 0);
    animate(corners, [{ opacity: 1 }, { opacity: 1, offset: .65 }, { opacity: 0 }], 0, 640);
  }

  return {
    duration,
    seek(time: number) {
      animations.forEach(animation => { animation.currentTime = Math.min(time, duration); });
      cues.forEach((ranges, element) => {
        element.dataset.active = String(ranges.some(range => time >= range.start && time < range.end));
      });
    },
    dispose() {
      animations.forEach(animation => animation.cancel());
      cues.forEach((_ranges, element) => { delete element.dataset.active; });
      cleanup.forEach(remove => remove());
    },
  };
}
