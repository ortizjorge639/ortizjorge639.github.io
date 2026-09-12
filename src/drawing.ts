type Point = { x: number; y: number };
type Tool = 'pen' | 'brush' | 'eraser';
type Stroke = { points: Point[]; color: string; tool: Tool; stamp?: boolean };

export function setupDrawing() {
  const canvas = document.querySelector<HTMLCanvasElement>('#drawing')!;
  const context = canvas.getContext('2d');
  const status = document.querySelector<HTMLElement>('#drawing-status')!;
  if (!context) {
    status.textContent = 'Drawing is unavailable in this browser.';
    document.querySelectorAll<HTMLButtonElement>('.drawing-desk button').forEach((button) => { button.disabled = true; });
    return;
  }
  const ctx = context;
  const history: Stroke[] = [];
  let active: Stroke | undefined;
  let pointerId: number | undefined;
  let tool: Tool = 'pen';
  let color = '#3157bc';
  const undo = document.querySelector<HTMLButtonElement>('#undo')!;
  const hint = document.querySelector<HTMLElement>('.canvas-hint')!;
  const names: Record<string, string> = { '#3157bc': 'Blue', '#d44836': 'Red', '#292b30': 'Black' };

  function describe() {
    status.textContent = `${tool === 'eraser' ? 'Eraser' : `${names[color]} ${tool}`} · ${history.length} ${history.length === 1 ? 'mark' : 'marks'}`;
  }
  function paint(stroke: Stroke) {
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.tool === 'brush' ? 15 : stroke.tool === 'eraser' ? 32 : 4;
    ctx.globalAlpha = stroke.tool === 'brush' ? 0.55 : 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (stroke.stamp) {
      const center = stroke.points[0];
      for (let i = 0; i < 10; i++) {
        const angle = i * Math.PI / 5 - Math.PI / 2;
        const radius = i % 2 ? 15 : 35;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else {
      stroke.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      if (stroke.points.length === 1) {
        ctx.arc(stroke.points[0].x, stroke.points[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
    }
    ctx.stroke();
  }
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.forEach(paint);
    if (active) paint(active);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    undo.disabled = history.length === 0;
    hint.hidden = history.length > 0 || !!active;
  }
  function point(event: PointerEvent): Point {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (active || event.button !== 0) return;
    pointerId = event.pointerId;
    canvas.setPointerCapture(pointerId);
    active = { tool, color, points: [point(event)] };
    render();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!active || event.pointerId !== pointerId) return;
    active.points.push(point(event));
    render();
  });
  function finish(event: PointerEvent) {
    if (!active || event.pointerId !== pointerId) return;
    history.push(active);
    active = undefined;
    pointerId = undefined;
    render();
    describe();
  }
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  canvas.addEventListener('lostpointercapture', finish);
  document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => button.addEventListener('click', () => {
    tool = button.dataset.tool as Tool;
    document.querySelectorAll('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    canvas.dataset.tool = tool;
    describe();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach((button) => button.addEventListener('click', () => {
    color = button.dataset.color!;
    document.querySelectorAll('[data-color]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    describe();
  }));
  undo.addEventListener('click', () => {
    history.pop();
    render();
    describe();
  });
  document.querySelector('#stamp')!.addEventListener('click', () => {
    history.push({ color, tool: 'pen', stamp: true, points: [{ x: 85 + (history.length * 131) % 830, y: 85 + (history.length * 67) % 280 }] });
    render();
    describe();
  });
  document.querySelector('#save-drawing')!.addEventListener('click', () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportContext = exportCanvas.getContext('2d');
    if (!exportContext) {
      status.textContent = 'Could not prepare your drawing for download.';
      return;
    }
    exportContext.fillStyle = '#fffdf6';
    exportContext.fillRect(0, 0, canvas.width, canvas.height);
    exportContext.drawImage(canvas, 0, 0);
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        status.textContent = 'Could not export the drawing. Please try again.';
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'a-little-scribble.png';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'Your PNG is ready · keep making things!';
    }, 'image/png');
  });
}
