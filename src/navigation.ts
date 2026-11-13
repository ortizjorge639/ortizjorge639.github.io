import { projects, type Category, type Project } from './projects';
import { flipnotes } from './flipnotes';
import { projectStories } from './stories';

export const categories = ['All', 'AI', 'Tech', 'Media', 'Gaming'] as const;
export type Filter = Category | 'All';
export const detailPages = ['overview', 'inside', 'links'] as const;
export type DetailPage = typeof detailPages[number];
export const pageSize = 4;
export type Library = { kind: 'projects'; filter: Filter; page: number; selected: Project; scene?: string };
export type Screen =
  | { kind: 'home' | 'opening' }
  | { kind: 'about'; page: number }
  | Library
  | { kind: 'project'; project: Project; page: DetailPage; scene?: string }
  | { kind: 'help'; page: number }
  | { kind: 'not-found' };

export function filteredProjects(filter: Filter) {
  return projects.filter((project) => filter === 'All' || project.categories.includes(filter));
}

export function libraryPage(filter: Filter, page: number) {
  return filteredProjects(filter).slice((page - 1) * pageSize, page * pageSize);
}

export function libraryHash(filter: Filter = 'All', page = 1, selected?: string, scene?: string) {
  const query = new URLSearchParams({ category: filter, page: String(page) });
  if (selected) query.set('selected', selected);
  if (scene) query.set('scene', scene);
  return `#projects?${query}`;
}

export function projectHash(id: string, page: DetailPage = 'overview', scene?: string) {
  return `#project/${encodeURIComponent(id)}/${page}${scene ? `?${new URLSearchParams({ scene })}` : ''}`;
}
const validScene = (id: string, scene: string | null) =>
  scene === null || !!projectStories[id]?.scenes.some(item => item.id === scene);

export function readScreen(hash: string): Screen {
  const invalid: Screen = { kind: 'not-found' };
  try {
    const [path, query = '', extra] = hash.replace(/^#/, '').split('?');
    if (extra !== undefined) return invalid;
    if (!path || path === 'home') {
      return query ? invalid : { kind: 'home' };
    }
    if (path === 'about') return query ? invalid : { kind: 'about', page: 0 };
    if (path === 'projects') {
      const params = new URLSearchParams(query);
      if ([...params.keys()].some((key) => !['category', 'page', 'selected', 'scene'].includes(key) || params.getAll(key).length !== 1)) return invalid;
      const category = params.get('category') ?? 'All';
      const filter = categories.find((candidate) => candidate === category);
      const pageValue = params.get('page') ?? '1';
      if (!filter || !/^[1-9]\d*$/.test(pageValue)) return invalid;
      const page = Number(pageValue);
      const items = libraryPage(filter, page);
      if (!items.length) return invalid;
      const selected = params.has('selected')
        ? items.find((project) => project.id === params.get('selected'))
        : items.find((project) => project.id === 'web-context-graph') ?? items[0];
      const scene = params.get('scene');
      return selected && validScene(selected.id, scene) ? { kind: 'projects', filter, page, selected, ...(scene ? { scene } : {}) } : invalid;
    }
    const parts = path.split('/');
    if (parts[0] === 'about' && parts[1] === 'flipnotes' && parts.length === 3 && !query) {
      const page = Number(parts[2]);
      return /^[1-9]\d*$/.test(parts[2]) && page <= flipnotes.length ? { kind: 'about', page } : invalid;
    }
    if (parts[0] === 'project' && parts.length >= 2 && parts.length <= 3) {
      const project = projects.find((item) => item.id === decodeURIComponent(parts[1]));
      const page = detailPages.find((item) => item === (parts[2] ?? 'overview'));
      const params = new URLSearchParams(query);
      if ([...params.keys()].some(key => key !== 'scene' || params.getAll(key).length !== 1)) return invalid;
      const scene = params.get('scene');
      return project && page && validScene(project.id, scene) ? { kind: 'project', project, page, ...(scene ? { scene } : {}) } : invalid;
    }
    if (parts[0] === 'help' && parts.length <= 2 && !query) {
      const page = parts[1] ?? '1';
      return /^[1-3]$/.test(page) ? { kind: 'help', page: Number(page) } : invalid;
    }
    return invalid;
  } catch (error) {
    if (!(error instanceof URIError)) throw error;
    return invalid;
  }
}

export function surfaceKey(screen: Screen): string {
  switch (screen.kind) {
    case 'projects': return `projects:${screen.filter}:${screen.page}:${screen.selected.id}${screen.scene ? `:scene:${screen.scene}` : ''}`;
    case 'project': return `project:${screen.project.id}:${screen.page}${screen.scene ? `:scene:${screen.scene}` : ''}`;
    case 'help': return `help:${screen.page}`;
    case 'about': return screen.page ? `about:flipnotes:${screen.page}` : 'about';
    default: return screen.kind;
  }
}
