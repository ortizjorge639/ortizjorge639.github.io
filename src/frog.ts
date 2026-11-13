export type FrogPose = 'rest' | 'blink' | 'peek' | 'crouch' | 'leap' | 'land' | 'wave' | 'glee' | 'read' | 'present' | 'puzzled' | 'sleep';

// Original 48-unit character: a bespectacled paper frog with a red neckerchief.
export function frogArt(pose: FrogPose = 'rest') {
  const crouch = pose === 'crouch' || pose === 'land';
  const leap = pose === 'leap';
  const reading = pose === 'read';
  const eyesClosed = pose === 'blink' || pose === 'sleep';
  const eyeX = pose === 'peek' ? 2 : pose === 'puzzled' ? -1 : 0;
  const headY = crouch ? 5 : leap ? -3 : pose === 'glee' ? -2 : reading ? 2 : 0;
  const headTilt = pose === 'puzzled' ? -7 : pose === 'present' ? 4 : 0;
  return `<svg class="frog-art" viewBox="0 0 48 48" aria-hidden="true" shape-rendering="crispEdges">
    <g fill="var(--blue)" opacity=".2"><path d="M8 44h32v2H8z"/></g>
    <g class="frog-body" stroke="var(--blue)" stroke-width="2" stroke-linejoin="miter">
      <path d="${leap ? 'M16 31 6 39H2v4h10l9-7M30 31l10 8h6v4H35l-9-7' : crouch ? 'M14 34H7v6H2v4h18v-9m14-1h7v6h5v4H28v-9' : 'M14 32H8l-5 7v5h17V33m14-1h6l5 7v5H28V33'}" fill="var(--paper)"/>
      <path d="${crouch ? 'M13 27h22v12H13z' : 'M12 27h24v9h-4v5H16v-5h-4z'}" fill="var(--paper)"/>
      <path d="${pose === 'wave' || pose === 'glee' ? 'M13 29H8V18H4v15h9' : leap ? 'M14 25 5 18l-2 4 9 10' : 'M14 28H8v9h5v-6'}" fill="var(--paper)"/>
      <path d="${pose === 'present' || pose === 'glee' ? 'M33 29h6V18h5v14H33' : leap ? 'M34 25l9-7 2 4-9 10' : 'M34 28h6v9h-5v-6'}" fill="var(--paper)"/>
    </g>
    <g class="frog-head" transform="translate(0 ${headY}) rotate(${headTilt} 24 20)">
      <path d="M6 20v-5h5v-5h3V6h7v6h6V6h7v4h3v5h5v5h2v7h-5v4H9v-4H4v-7z" fill="var(--paper)" stroke="var(--blue)" stroke-width="2"/>
      <path d="M10 13h12v10H10zm16 0h12v10H26z" fill="var(--paper)" stroke="var(--blue)" stroke-width="1.5"/>
      <path d="M22 17h4" stroke="var(--blue)" stroke-width="2"/>
      ${eyesClosed ? '<path d="M14 19h5m11 0h5" stroke="var(--blue)" stroke-width="2"/>' : `<g class="frog-pupils" transform="translate(${eyeX} ${reading ? 2 : 0})"><path d="M15 16h3v4h-3zm16 0h3v4h-3z" fill="var(--blue)"/></g>`}
      <path d="${pose === 'puzzled' ? 'M20 27h8' : pose === 'glee' ? 'M16 24v3h3v3h10v-3h3v-3' : 'M18 25v3h12v-3'}" fill="none" stroke="var(--blue)" stroke-width="2"/>
    </g>
    <path d="M13 ${crouch ? 34 : 30}h22v4H23v5h-6v-5h-4z" fill="var(--red)"/>
    ${reading || pose === 'present' ? `<g transform="translate(${pose === 'present' ? 9 : 0} ${pose === 'present' ? -10 : 0})"><path d="M15 31h18v12H15z" fill="var(--paper)" stroke="var(--blue)" stroke-width="2"/><path d="M19 35h10m-10 4h6" stroke="var(--red)" stroke-width="2"/></g>` : ''}
  </svg>`;
}

export function createFrog(host: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let timers: ReturnType<typeof setTimeout>[] = [];
  let idle: ReturnType<typeof setTimeout> | undefined;
  let mood: 'rest' | 'read' | 'puzzled' = 'rest';
  let visible = true;
  let pointer: { x: number; y: number } | undefined;
  let gazeFrame = 0;
  let greetingUntil = 0;
  let delighted = false;

  function updateGaze() {
    gazeFrame = 0;
    if (!visible || document.hidden) return;
    const pupils = host.querySelector<SVGGElement>('.frog-pupils');
    const head = host.querySelector<SVGGElement>('.frog-head');
    if (!pupils || !head) return;
    let x = 0, y = 0;
    const matrix = head.getScreenCTM();
    if (pointer && matrix && matrix.a * matrix.d - matrix.b * matrix.c !== 0) {
      const point = new DOMPoint(pointer.x, pointer.y).matrixTransform(matrix.inverse());
      const dx = point.x - 24, dy = point.y - 18;
      const distance = Math.max(24, Math.hypot(dx, dy));
      x = Math.round(2 * dx / distance);
      y = Math.round(dy / distance);
    }
    pupils.setAttribute('transform', `translate(${x} ${y})`);
  }
  function refreshGaze() {
    if (!gazeFrame && visible && !document.hidden) gazeFrame = requestAnimationFrame(updateGaze);
  }
  function resetGaze() {
    pointer = undefined;
    refreshGaze();
  }
  document.addEventListener('pointermove', (event) => {
    if (!event.isPrimary || event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    refreshGaze();
  }, { passive: true });
  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') resetGaze();
  }, { passive: true });
  document.addEventListener('pointerout', (event) => { if (event.relatedTarget === null) resetGaze(); });
  document.addEventListener('scroll', refreshGaze, { capture: true, passive: true });
  window.addEventListener('resize', refreshGaze);
  window.addEventListener('blur', resetGaze);

  function pose(value: FrogPose) {
    host.dataset.pose = value;
    host.innerHTML = frogArt(value);
    cancelAnimationFrame(gazeFrame);
    updateGaze();
  }
  function clear() {
    timers.forEach(clearTimeout);
    timers = [];
    clearTimeout(idle);
  }
  function scheduleIdle() {
    clearTimeout(idle);
    if (!visible || document.hidden || reduced.matches) return;
    idle = setTimeout(() => {
      if (mood === 'rest') {
        pose('blink');
        timers.push(setTimeout(() => pose('rest'), 140));
      } else if (mood === 'read') {
        pose('peek');
        timers.push(setTimeout(() => pose('read'), 280));
      }
      scheduleIdle();
    }, mood === 'read' ? 2400 : 9000);
  }
  function setMood(value: typeof mood) {
    clear();
    mood = value;
    pose(value);
    scheduleIdle();
  }
  function play(kind: 'hop' | 'hello' | 'answer' | 'peek' | 'delight') {
    if ((kind === 'peek' || kind === 'delight') && performance.now() < greetingUntil) return;
    clear();
    delighted = kind === 'delight';
    if (kind === 'hello') greetingUntil = performance.now() + 650;
    if (kind === 'delight') {
      pose(visible && !document.hidden ? 'glee' : mood);
      return;
    }
    if (!visible || reduced.matches || document.hidden) {
      pose(mood);
      return;
    }
    const sequence: [number, FrogPose][] = kind === 'hop'
      ? [[0, 'crouch'], [70, 'leap'], [180, 'land'], [260, 'rest']]
      : kind === 'hello'
        ? [[0, 'crouch'], [80, 'leap'], [210, 'land'], [300, 'wave'], [650, 'rest']]
        : kind === 'answer'
          ? [[0, 'present'], [650, 'rest']]
          : [[0, 'peek'], [380, mood]];
    for (const [delay, value] of sequence) timers.push(setTimeout(() => pose(value), delay));
    timers.push(setTimeout(scheduleIdle, 700));
  }
  function endDelight() {
    if (!delighted) return;
    delighted = false;
    setMood(mood);
  }
  function setVisible(value: boolean) {
    visible = value;
    clear();
    cancelAnimationFrame(gazeFrame);
    gazeFrame = 0;
    if (value) { pose(mood); scheduleIdle(); }
  }
  document.addEventListener('visibilitychange', () => {
    clear();
    cancelAnimationFrame(gazeFrame);
    gazeFrame = 0;
    if (!document.hidden && visible) { pose(mood); scheduleIdle(); }
  });
  reduced.addEventListener('change', () => { clear(); pose(mood); scheduleIdle(); });
  pose('rest');
  scheduleIdle();
  return { play, setMood, setVisible, refreshGaze, endDelight };
}
