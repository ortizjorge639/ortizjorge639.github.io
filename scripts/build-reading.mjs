import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escapeHTML;
export const readingUrl = p => `/read/${p.id}/`;
const repository = p => p.repo ?? `https://github.com/ortizjorge639/${p.id}`;
const sourceList = p => p.sources ?? [{ label: 'Public repository README', url: `${repository(p)}#readme`, reviewed: '2026-09-12' }];
const sections = ['Overview', 'The problem', 'What it does', 'How it works', "Joji’s contribution", 'Current status', 'Sources and links'];
const anchors = ['overview','problem','what-it-does','how-it-works','contribution','status','sources'];
const link = (url, label, attrs='') => `<a href="${e(url)}" ${attrs}>${e(label)}</a>`;

export function validateCatalog(catalog) {
  if (!Array.isArray(catalog) || !catalog.length || catalog.length > 100) throw new Error('Invalid public catalog');
  const ids = new Set();
  const safeURL = value => {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password) throw new Error('Unsafe public URL');
  };
  for (const p of catalog) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id) || ids.has(p.id)) throw new Error('Unsafe or duplicate project slug');
    ids.add(p.id);
    for (const key of ['title','subtitle','description','problem','how','contribution','note','status']) {
      if (typeof p[key] !== 'string' || !p[key].trim() || p[key].length > 5000) throw new Error(`Missing or oversized ${key}`);
    }
    if (!p.sources?.length) throw new Error('Missing public evidence');
    for (const source of p.sources) safeURL(source.url);
    for (const value of [p.repo,p.site].filter(Boolean)) safeURL(value);
  }
}

export function renderPage(catalog, project, assets = '') {
  const title = project?.title ?? 'Projects, opened up.';
  const nav = catalog.map(p=>`<li>${link(readingUrl(p),p.title,p.id===project?.id?'aria-current="page"':'')}</li>`).join('');
  const body = project ? `
    <p class="kicker">${e(project.categories.join(' / '))} · Project notes</p>
    <h1>${e(title)}</h1><p class="lede">${e(project.subtitle)}</p>
    <div class="article-meta">${e(project.status)} <span>Content reviewed ${e(sourceList(project)[0].reviewed)}</span></div>
    <section id="overview"><h2>Overview</h2><p>${e(project.description)}</p></section>
    ${project.problem ? `<section id="problem"><h2>The problem</h2><p>${e(project.problem)}</p></section>` : ''}
    <section id="what-it-does"><h2>What it does</h2><ul>${project.capabilities.map(c=>`<li>${e(c)}</li>`).join('')}</ul></section>
    <section id="how-it-works"><h2>How it works</h2><p>${e(project.how ?? project.description)}</p><p class="stack">${e(project.stack.join(' · '))}</p></section>
    <section id="contribution"><h2>Joji’s contribution</h2><p>${e(project.contribution ?? 'This project is in Jorge’s public repository collection. This overview does not establish sole authorship; consult the linked history for individual changes.')}</p></section>
    <section id="status"><h2>Current status</h2><p>${e(project.note)}</p></section>
    <section id="sources"><h2>Sources and links</h2><ul class="source-list">${sourceList(project).map(s=>`<li>${link(s.url,s.label)}<small>Reviewed ${e(s.reviewed)}</small></li>`).join('')}</ul>
    <div class="project-links">${project.repo !== '' ? link(repository(project),'Public repository') : ''}${project.site?link(project.site,'Public landing page'):''}</div>
    <p class="source-disclosure">Descriptions summarize the linked public sources, not a production audit. Features described by a landing page are not a verified account workflow.</p></section>
    <div class="article-end">${link('/read/','All projects')}${link('/#projects','Back to the sketchbook')}</div>` : `
    <p class="kicker">Joji’s project notebook</p><h1>${title}</h1>
    <p class="lede">The ideas, the moving parts, and the honest edges. A quieter way to explore what I’m making.</p>
    <p>These are public-source project notes, not a claim that every experiment is a finished service. Pick a project to see what it does, how it fits together, and what is still in progress.</p>
    <form class="project-search" role="search"><label for="project-search">Find a project</label><div><input id="project-search" type="search" placeholder="Try games, AI, or notes" autocomplete="off"><button type="reset">Clear search</button></div><p id="search-status" role="status" aria-live="polite"></p></form><div class="project-index">${catalog.map(p=>`<article data-search-item><p class="kicker">${e(p.categories.join(' / '))} · ${e(p.status)}</p><h2>${link(readingUrl(p),p.title)}</h2><p>${e(p.subtitle)}</p><p>${e(p.description)}</p></article>`).join('')}</div>`;
  const toc = project ? `<aside class="on-this-page" aria-label="On this page"><p>On this page</p>${sections.map((s,i)=>i===1&&!project.problem?'':link(`#${anchors[i]}`,s)).join('')}</aside>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${e(project?.description ?? 'Public project notes by Jorge: context, implementation, limitations and sources.')}"><meta name="theme-color" content="#fffdf8"><title>${e(title)} — Joji’s project notes</title><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/read/reading.css">${assets}</head><body class="reading-app" data-project="${e(project?.id ?? '')}">
  <a class="skip-link" href="#content">Skip to content</a>
  <header class="reading-header">${link('/read/',"joji’s project notes",'class="reading-brand"')}<nav aria-label="Site navigation">${link('/read/','Projects')}${link('/','Sketchbook ↗')}</nav></header>
  <div class="reading-layout"><aside class="project-nav"><details open><summary>Browse projects</summary><nav aria-label="Project navigation"><ul><li>${link('/read/','Start here',!project?'aria-current="page"':'')}</li>${nav}</ul></nav></details></aside>
  <main id="content" tabindex="-1">${body}</main>${toc}</div>
  <footer>Built with curiosity. Published sources, clear limits. ${link('/','Back to play ↗')}</footer>
  <aside id="reading-guide-host" aria-label="Optional studio guide"><button id="guide-access" aria-label="Show studio guide" hidden>Guide</button></aside>
  </body></html>`;
}

export async function buildReading(root=process.cwd()) {
  const catalog=JSON.parse(await readFile(resolve(root,'src/project-catalog.json'),'utf8'));
  validateCatalog(catalog);
  const shell=await readFile(resolve(root,'dist/reading-shell.html'),'utf8');
  const assets=(shell.match(/<script[^>]*type="module"[^>]*><\/script>|<link[^>]*rel="stylesheet"[^>]*>/g) ?? []).join('');
  if (!assets.includes('type="module"')) throw new Error('Missing built reading entry');
  await mkdir(resolve(root,'dist/read'),{recursive:true});
  await copyFile(resolve(root,'src/reading.css'),resolve(root,'dist/read/reading.css'));
  await writeFile(resolve(root,'dist/read/index.html'),renderPage(catalog,undefined,assets));
  for(const p of catalog) {
    await mkdir(resolve(root,'dist/read',p.id),{recursive:true});
    await writeFile(resolve(root,'dist/read',p.id,'index.html'),renderPage(catalog,p,assets));
  }
  console.log(`Generated ${catalog.length} static project notes and index.`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) await buildReading();
