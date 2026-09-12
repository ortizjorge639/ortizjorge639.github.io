export type InkTool = 'pen' | 'paint' | 'eraser';
export type InkPoint = { x: number; y: number; pressure: number };
export type InkStroke = { kind: 'stroke'; tool: InkTool; color: string; size: number; points: InkPoint[] };
export type InkAction = InkStroke | { kind: 'clear' };

function dab(ctx: CanvasRenderingContext2D, stroke: InkStroke, point: InkPoint) {
  const base = stroke.tool === 'pen' ? 3 : stroke.tool === 'paint' ? 18 : 26;
  const width = Math.max(2, Math.round(base * stroke.size * (0.6 + point.pressure * 0.65)));
  const x = Math.round(point.x - width / 2);
  const y = Math.round(point.y - width / 2);
  if (stroke.tool !== 'paint') {
    ctx.fillRect(x, y, width, width);
    return;
  }
  // A document-aligned checker nib preserves the original ink's pixel texture.
  for (let py = y - y % 2; py < y + width; py += 2) {
    for (let px = x - x % 2; px < x + width; px += 2) {
      const inside = Math.abs(px - point.x) + Math.abs(py - point.y) < width * 0.8;
      if (inside && (px / 2 + py / 2) % 2 === 0) ctx.fillRect(px, py, 2, 2);
    }
  }
}

export function paintSegment(ctx: CanvasRenderingContext2D, stroke: InkStroke, from: InkPoint, to = from) {
  ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.fillStyle = stroke.color;
  const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / 2));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    dab(ctx, stroke, {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      pressure: from.pressure + (to.pressure - from.pressure) * t,
    });
  }
  ctx.globalCompositeOperation = 'source-over';
}

export function replayInk(ctx: CanvasRenderingContext2D, actions: InkAction[], width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  let lastClear = -1;
  for (let i = actions.length - 1; i >= 0; i--) {
    if (actions[i].kind === 'clear') { lastClear = i; break; }
  }
  for (const action of actions.slice(lastClear + 1)) {
    if (action.kind === 'clear') continue;
    action.points.forEach((point, i) => paintSegment(ctx, action, action.points[Math.max(0, i - 1)], point));
  }
}
