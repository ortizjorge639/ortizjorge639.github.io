export type StoryBeat = 'need' | 'approach' | 'flow' | 'build' | 'details' | 'use';

export interface StorySource {
  id: string;
  title: string;
  url: string;
}

export interface StoryNode {
  id: string;
  label: string;
  detail: string;
}

export type StoryVisual =
  | { type: 'contrast'; before: string; after: string }
  | { type: 'flow'; nodes: StoryNode[]; edges: { from: string; to: string }[] }
  | { type: 'roles'; items: { name: string; role: string }[] }
  | { type: 'steps'; items: { title: string; detail: string }[] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'outcome'; result: string };

export interface StoryScene {
  id: string;
  beat: StoryBeat;
  headline: string;
  body: string;
  duration: number;
  visual: StoryVisual;
  sources: string[];
}

export interface ProjectStory {
  projectId: string;
  sources: StorySource[];
  scenes: StoryScene[];
}
