import { readFile } from 'node:fs/promises';

export const readingDepth = JSON.parse(await readFile(new URL('../src/reading-depth.json', import.meta.url), 'utf8'));
const e = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 2500;
const list = (value, min = 1) => Array.isArray(value) && value.length >= min && value.every(text);

export function validateDepth(catalog, data = readingDepth) {
  if (!data || typeof data !== 'object' || Object.keys(data).length !== catalog.length) throw new Error('Reading depth coverage mismatch');
  for (const project of catalog) {
    const d = data[project.id];
    const a = d?.architecture;
    if (!d || !text(d.orientation?.question) || !text(d.orientation?.answer) ||
        !text(a?.scope) || !text(a?.boundary) || !text(a?.caption) ||
        !Array.isArray(a.nodes) || a.nodes.length < 3 || a.nodes.length > 8 ||
        !Array.isArray(a.edges) || a.edges.length < 2 || a.edges.length > 12) throw new Error(`Missing architecture depth: ${project.id}`);
    const ids = new Set();
    for (const n of a.nodes) {
      if (!/^[a-z][a-z0-9-]*$/.test(n.id) || ids.has(n.id) || !text(n.label) || !text(n.detail)) throw new Error(`Invalid architecture node: ${project.id}`);
      ids.add(n.id);
    }
    for (const edge of a.edges) if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to || !text(edge.label)) throw new Error(`Invalid architecture connection: ${project.id}`);
    if (!Array.isArray(d.decisions) || d.decisions.length < 2 || d.decisions.length > 5 ||
        !d.decisions.every(v => text(v.choice) && text(v.why) && text(v.tradeoff))) throw new Error(`Missing decision rationale: ${project.id}`);
    if (!text(d.walkthrough?.input) || !list(d.walkthrough.steps, 2) || !text(d.walkthrough.output) || !text(d.walkthrough.caveat) ||
        !list(d.evidence?.established) || !list(d.evidence?.notEstablished)) throw new Error(`Missing walkthrough or evidence: ${project.id}`);
  }
}

// Decorative diagram duplicates the complete semantic component/connection text.
// Arrangement is conceptual, not a physical network or deployment topology.
function renderSystemDiagram(a) {
  const width=760, boxW=272, boxH=92, rowH=150;
  const positions=new Map(a.nodes.map((n,i)=>{
    const row=Math.floor(i/2), col=row%2 ? 1-i%2 : i%2;
    return [n.id,{x:col ? 454 : 34,y:35+row*rowH}];
  }));
  const paths=a.edges.map((edge,i)=>{
    const s=positions.get(edge.from),t=positions.get(edge.to);
    const sx=s.x+boxW/2,sy=s.y+boxH/2,tx=t.x+boxW/2,ty=t.y+boxH/2;
    const dx=tx-sx,dy=ty-sy,scale=1/Math.max(Math.abs(dx)/(boxW/2+4),Math.abs(dy)/(boxH/2+4));
    const x1=sx+dx*scale,y1=sy+dy*scale,x2=tx-dx*scale,y2=ty-dy*scale;
    const len=Math.hypot(dx,dy),bend=18+(i%3)*9,cx=(x1+x2)/2-dy/len*bend,cy=(y1+y2)/2+dx/len*bend;
    const mx=(x1+2*cx+x2)/4,my=(y1+2*cy+y2)/4;
    return `<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" marker-end="url(#reading-arrow)"/><circle cx="${mx}" cy="${my}" r="10"/><text class="edge-index" x="${mx}" y="${my+4}">${i+1}</text>`;
  }).join('');
  const nodes=a.nodes.map((node,i)=>{
    const p=positions.get(node.id),words=node.label.split(' '),lines=[''];
    for(const word of words){ const last=lines.length-1; if(lines[last] && lines[last].length+word.length>25) lines.push(word); else lines[last]+=(lines[last]?' ':'')+word; }
    const y=p.y+boxH/2-(lines.length-1)*10;
    return `<g><rect x="${p.x}" y="${p.y}" width="${boxW}" height="${boxH}" rx="6"/><text x="${p.x+20}" y="${p.y+22}" class="diagram-index">${i+1}</text><text x="${p.x+boxW/2}" y="${y}">${lines.map((line,j)=>`<tspan x="${p.x+boxW/2}" dy="${j?20:0}">${e(line)}</tspan>`).join('')}</text></g>`;
  }).join('');
  return `<svg class="system-diagram" viewBox="0 0 ${width} ${Math.ceil(a.nodes.length/2)*rowH+8}" aria-hidden="true" focusable="false"><defs><marker id="reading-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z"/></marker></defs>${paths}${nodes}</svg>`;
}

export function renderOrientation(d) {
  return `<aside class="reading-orientation" aria-label="The core idea"><p class="kicker">The core idea</p><p><strong>${e(d.orientation.question)}</strong></p><p>${e(d.orientation.answer)}</p></aside>`;
}

export function renderDepth(d) {
  const a = d.architecture;
  const label = id => a.nodes.find(n => n.id === id).label;
  return `<section id="architecture"><h2>Architecture at a glance</h2><p>${e(a.scope)}</p>
    <figure class="architecture-map" aria-labelledby="architecture-caption">
      ${renderSystemDiagram(a)}
      <ul class="architecture-nodes" aria-label="System components">${a.nodes.map((n, i) => `<li><span class="node-index" aria-hidden="true">${i + 1}</span><h3>${e(n.label)}</h3><p>${e(n.detail)}</p></li>`).join('')}</ul>
      <ul class="architecture-connections" aria-label="Labeled connections">${a.edges.map((edge, i) => `<li><span class="connection-route"><span class="connection-number" aria-hidden="true">${i + 1}.</span> <strong>${e(label(edge.from))}</strong> <span aria-label="to">→</span> <strong>${e(label(edge.to))}</strong></span><span>${e(edge.label)}</span></li>`).join('')}</ul>
      <p class="architecture-boundary"><strong>Boundary to notice</strong> ${e(a.boundary)}</p>
      <figcaption id="architecture-caption">${e(a.caption)}</figcaption>
    </figure></section>
    <section id="decisions"><h2>${e(d.decisionHeading ?? 'Design choices and trade-offs')}</h2>${d.decisionNote ? `<p>${e(d.decisionNote)}</p>` : ''}<div class="decision-list">${d.decisions.map(v => `<article><h3>${e(v.choice)}</h3><p><strong>Why this approach.</strong> ${e(v.why)}</p><p class="tradeoff"><strong>The trade-off.</strong> ${e(v.tradeoff)}</p></article>`).join('')}</div></section>
    <section id="walkthrough"><h2>Illustrative walkthrough</h2><p class="example-label">Hypothetical example · not a recorded run</p><p><strong>Start with:</strong> ${e(d.walkthrough.input)}</p><ol class="walkthrough-steps">${d.walkthrough.steps.map(step => `<li>${e(step)}</li>`).join('')}</ol><p><strong>The intended artifact:</strong> ${e(d.walkthrough.output)}</p><p class="example-caveat">${e(d.walkthrough.caveat)}</p></section>
    <section id="evidence"><h2>Evidence and limits</h2><div class="evidence-grid"><div><h3>What the reviewed material establishes</h3><ul>${d.evidence.established.map(v => `<li>${e(v)}</li>`).join('')}</ul></div><div><h3>Not established</h3><ul>${d.evidence.notEstablished.map(v => `<li>${e(v)}</li>`).join('')}</ul></div></div></section>`;
}
