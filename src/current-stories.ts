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

const compact: Record<string, { how: string; note: string }> = {
  'just-play': { how: 'Next.js powers the app. A local setup needs your own Supabase and IGDB credentials. The public landing shows a curated shortlist and StandBy.', note: 'V2 is still in progress. The landing is live; authenticated play was not audited. Steam sync and Canopy relationships are not promised.' },
  firstmind: { how: 'The public onboarding introduces ephemeral notes, memory exercises, and essential insights. Storage architecture and real user outcomes were not inspected.', note: 'A public prototype, not a medical treatment or a clinically validated intervention. No personal notes, account data, or exercise outcomes were accessed.' },
  flowlog: { how: 'The public landing describes Steam import, themed decks, and sorting cards. It links to two different MVP origins; neither account workflow was verified.', note: 'The primary MVP returned a Flowlog page. The different footer MVP returned HTTP 403 to a direct check. Neither response proves a working Steam account workflow.' },
  'apim-credential-broker-poc': { how: 'The Foundry caller authenticates to APIM. Credential Manager supplies a token; APIM calls Graph and returns a tool result, not the credential.', note: 'A bounded proof of concept. Per-user isolation / per-user OAuth passthrough is not proven. The portfolio did not redeploy or independently repeat provider checks.' },
  oneshottober: { how: 'Plain HTML and CSS form the site, with an embedded generative-canvas example. The repository has no install or build step.', note: 'A public creative challenge and example, not a hosted AI backend or a claim that 31 results were completed. No participation metrics are invented.' },
};

export const currentStories: Record<string, ProjectStory> = Object.fromEntries(
  projects.filter(p => maps[p.id]).map(p => {
    const ordered = p.id === 'just-play' ? [...p.sources!].sort((a,b) => Number(b.url.includes('github.com')) - Number(a.url.includes('github.com'))) : p.sources!;
    const sources = ordered.map((s, i) => ({ id: `${p.id}-source-${i + 1}`, title: s.label, url: s.url }));
    const cite = sources.map(s => s.id);
    const nodes: StoryNode[] = maps[p.id].map((label, i) => ({ id: `step-${i + 1}`, label, detail: 'Public concept map' }));
    return [p.id, {
      projectId: p.id, sources,
      scenes: [
        { id: 'public-problem', beat: 'need', duration: 8, headline: 'Start with the problem', body: p.problem!, visual: { type: 'contrast', before: 'The friction this project explores', after: p.subtitle }, sources: cite },
        { id: 'public-approach', beat: 'approach', duration: 8, headline: p.title, body: p.description, visual: { type: 'outcome', result: p.subtitle }, sources: cite },
        { id: 'public-concept-map', beat: 'flow', duration: 9, headline: 'An original concept map', body: 'An original concept map based on public sources, not a screenshot, deployment trace, or independently verified account workflow.', visual: { type: 'flow', nodes, edges: [{ from: 'step-1', to: 'step-2' }, { from: 'step-2', to: 'step-3' }] }, sources: cite },
        { id: 'public-implementation', beat: 'build', duration: 8, headline: 'What sits behind the idea', body: compact[p.id].how, visual: { type: 'roles', items: p.stack.slice(0, 3).map(name => ({ name, role: name === 'Web prototype' ? 'Public prototype; implementation not established' : 'Technology named in the public project sources' })) }, sources: cite },
        { id: 'public-features', beat: 'details', duration: 9, headline: 'The public feature picture', body: 'The linked sources describe these capabilities. Project notes and marketing surfaces are not an independent production certification.', visual: { type: 'steps', items: p.capabilities.map((detail, i) => ({ title: `Part ${i + 1}`, detail })) }, sources: cite },
        { id: 'public-boundaries', beat: 'use', duration: 8, headline: 'The honest edges', body: compact[p.id].note, visual: { type: 'outcome', result: p.status }, sources: cite },
      ],
    } satisfies ProjectStory];
  }),
);
