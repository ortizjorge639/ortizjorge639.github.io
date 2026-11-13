import { projects } from './projects.ts';
import type { ProjectStory, StoryNode } from './story-types';

// Original, explicitly conceptual maps; not screenshots or measured runtime traces.
const maps: Record<string, [string, string, string]> = {
  'just-play': ['Mood / energy / time', 'A small shortlist', 'StandBy session'],
  firstmind: ['Ephemeral notes', 'Memory exercises', 'Essential insights'],
  flowlog: ['Steam library concept', 'Themed decks', 'Play / save / pass'],
  'apim-credential-broker-poc': ['Foundry caller', 'APIM token broker', 'Microsoft Graph'],
  oneshottober: ['One prompt', 'One attempt', 'Share the example'],
};

export const currentStories: Record<string, ProjectStory> = Object.fromEntries(
  projects.filter(p => maps[p.id]).map(p => {
    const sources = p.sources!.map((s, i) => ({ id: `${p.id}-source-${i + 1}`, title: s.label, url: s.url }));
    const cite = sources.map(s => s.id);
    const nodes: StoryNode[] = maps[p.id].map((label, i) => ({ id: `step-${i + 1}`, label, detail: 'Public concept map' }));
    const note = p.id === 'flowlog'
      ? 'The landing is public. Its primary MVP returns a Flowlog page, while the different footer MVP returned HTTP 403 to a direct check. Account workflows and Steam import were not verified.'
      : p.note;
    return [p.id, {
      projectId: p.id, sources,
      scenes: [
        { id: 'public-problem', beat: 'need', duration: 8, headline: 'Start with the problem', body: p.problem!, visual: { type: 'contrast', before: 'The friction this project explores', after: p.subtitle }, sources: cite },
        { id: 'public-approach', beat: 'approach', duration: 8, headline: p.title, body: p.description, visual: { type: 'outcome', result: p.subtitle }, sources: cite },
        { id: 'public-concept-map', beat: 'flow', duration: 9, headline: 'An original concept map', body: 'A simplified map of the idea described by the public sources. This is an original explanatory diagram, not a screenshot, deployment trace, or independently verified account workflow.', visual: { type: 'flow', nodes, edges: [{ from: 'step-1', to: 'step-2' }, { from: 'step-2', to: 'step-3' }] }, sources: cite },
        { id: 'public-implementation', beat: 'build', duration: 8, headline: 'What sits behind the idea', body: p.how!, visual: { type: 'roles', items: p.stack.slice(0, 3).map(name => ({ name, role: name === 'Web prototype' ? 'Public prototype; implementation not established' : 'Technology named in the public project sources' })) }, sources: cite },
        { id: 'public-features', beat: 'details', duration: 9, headline: 'The public feature picture', body: 'The linked sources describe these capabilities. Project notes and marketing surfaces are not an independent production certification.', visual: { type: 'steps', items: p.capabilities.map((detail, i) => ({ title: `Part ${i + 1}`, detail })) }, sources: cite },
        { id: 'public-boundaries', beat: 'use', duration: 9, headline: 'The honest edges', body: note, visual: { type: 'outcome', result: p.status }, sources: cite },
      ],
    } satisfies ProjectStory];
  }),
);
