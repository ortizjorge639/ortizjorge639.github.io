import catalog from './project-catalog.json' with { type: 'json' };

export type Category = 'AI' | 'Tech' | 'Media' | 'Gaming';
export interface Project {
  id: string;
  title: string;
  subtitle: string;
  categories: Category[];
  description: string;
  capabilities: string[];
  stack: string[];
  status: string;
  note: string;
  updated: string;
  illustration: 'tree' | 'inbox' | 'bot' | 'blocks' | 'canvas' | 'film' | 'game' | 'memory' | 'decks' | 'broker' | 'prompt' | 'inventory' | 'evidence' | 'auth-probe' | 'gestures' | 'session-dj' | 'recurrence' | 'recall' | 'migration' | 'connections';
  color: 'blue' | 'red';
  image?: string;
  imageAlt?: string;
  site?: string;
  repo?: string;
  sourceType?: 'curated-case-study';
  problem?: string;
  how?: string;
  contribution?: string;
  sources?: { label: string; url: string; reviewed: string }[];
}

// One build-time catalog: no runtime GitHub API or private data access.
export const projects = catalog as Project[];
export const repoUrl = (project: Project) => project.repo ?? `https://github.com/ortizjorge639/${project.id}`;
export const readingUrl = (project: Project) => `/read/${project.id}/`;
