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
  illustration: 'tree' | 'inbox' | 'bot' | 'blocks' | 'canvas' | 'film' | 'game';
  color: 'blue' | 'red';
  image?: string;
  imageAlt?: string;
  site?: string;
}

// Descriptions are grounded in the linked public READMEs, not inferred outcomes.
export const projects: Project[] = [
  {
    id: 'weekend-batch', title: 'The Batch', subtitle: 'Save it. Revisit it. Make it count.',
    categories: ['Tech', 'Media'], updated: '2026-09-12', illustration: 'inbox', color: 'red',
    description: 'A phone-friendly weekly feed that brings starred Gmail and X bookmarks into one place, with item state and discussion threads that carry over from week to week.',
    capabilities: ['Saturday refresh through GitHub Actions', 'Persistent new, seen, sparred, acted, and dismissed states', 'Portable JSON context store shared by the feed and a desktop client'],
    stack: ['JavaScript', 'GitHub Actions', 'Static HTML'],
    status: 'Personal tool',
    note: 'Write-back is asynchronous: browser changes are exported manually and folded into the next scheduled batch. No private saved items are reproduced here.',
  },
  {
    id: 'web-context-graph', title: 'Lineage', subtitle: 'Give your conversations room to branch.',
    categories: ['AI', 'Tech'], updated: '2026-09-01', illustration: 'tree', color: 'blue',
    description: 'A local-first workspace that turns GitHub Copilot CLI conversations into a branching knowledge tree. Explore a new direction without losing where an idea came from.',
    capabilities: ['Branch from addressable Markdown blocks', 'Keep parent context without leaking sibling conversations', 'Own an inspectable, Git-backed vault of Markdown and metadata'],
    stack: ['React', 'FastAPI', 'Copilot CLI'],
    status: 'Local-first app',
    note: 'The application runs on localhost. The project site is a walkthrough, not a hosted multi-user app.',
    image: '/images/lineage.webp', imageAlt: 'Lineage application showing a conversation alongside its branching knowledge tree',
    site: 'https://ortizjorge639.github.io/web-context-graph/',
  },
  {
    id: 'bot-meetings-dotnet', title: 'After the meeting', subtitle: 'Less transcript digging. More answers.',
    categories: ['AI', 'Tech'], updated: '2026-08-31', illustration: 'bot', color: 'blue',
    description: 'A Microsoft Teams bot that retrieves meeting transcripts and answers questions about the latest completed conversation using Azure OpenAI.',
    capabilities: ['Respond to meeting and participant events', 'Poll Microsoft Graph for transcripts and announce readiness', 'Answer post-meeting questions from the latest completed transcript'],
    stack: ['.NET 10', 'Microsoft Graph', 'Azure OpenAI'],
    status: 'Reusable sample',
    note: 'Based on a Microsoft Teams sample. Requires tenant admin consent, transcript access policy, and your own service configuration.',
  },
  {
    id: 'mcreator-workspace-harness', title: 'Modding, with guardrails', subtitle: 'A better co-op partner for Minecraft tools.',
    categories: ['Gaming', 'AI'], updated: '2026-08-23', illustration: 'blocks', color: 'red',
    description: 'An agent skill for working safely inside MCreator: editing procedures, coordinating Blockly and generated Java, and tracing what happens in a live Minecraft session.',
    capabilities: ['Regeneration-aware workspace editing guidance', 'Blockly procedure and Java coordination', 'Real-time Minecraft log tracing with PowerShell helpers'],
    stack: ['Agent skills', 'PowerShell', 'MCreator'],
    status: 'Developer toolkit',
    note: 'Not an official MCreator automation API. The skill documents where regeneration can overwrite external edits.',
  },
  {
    id: 'reset-canvas', title: 'Grand Reset', subtitle: 'A little space to see the bigger picture.',
    categories: ['Tech'], updated: '2026-07-11', illustration: 'canvas', color: 'blue',
    description: 'A calm, local-first canvas for mapping a physical and digital declutter. Switch perspectives, organize the loose ends, and review agent proposals before accepting them.',
    capabilities: ['Canvas, grid, and flow views', 'Search, filter, and edit across lifecycle spaces', 'Browser-local snapshots and an agent proposal inbox'],
    stack: ['JavaScript', 'JSON Schema', 'localStorage'],
    status: 'Browser-local tool',
    note: 'There is no remote backend. Saved state belongs to the browser origin rather than a synced account.',
  },
  {
    id: 'just-play', title: 'Just Play', subtitle: 'Your backlog deserves a happy ending.',
    categories: ['Gaming'], updated: '2026-07-10', illustration: 'game', color: 'red',
    description: 'A game tracker that makes completed games part of a lasting treehouse collection. Track your backlog, play sessions, and goals without losing the joy of playing.',
    capabilities: ['Backlog, in-progress, and completed game states', 'Session and goal tracking', 'IGDB game metadata with Supabase authentication and storage'],
    stack: ['Next.js', 'Supabase', 'IGDB'],
    status: 'V2 in progress',
    note: 'An evolving project; a local setup requires service credentials. The illustration here is an original portfolio sketch, not an app screenshot.',
  },
  {
    id: 'repoquest', title: 'RepoQuest', subtitle: 'Every repository has an opening scene.',
    categories: ['Media', 'Tech'], updated: '2026-04-19', illustration: 'film', color: 'blue',
    description: 'A TypeScript CLI that turns a GitHub repository into a cinematic setup guide: from README and package details to an animated, self-contained HTML tutorial.',
    capabilities: ['Read repository setup signals and environment examples', 'Generate a ten-scene animated HTML guide', 'Support video rendering through HyperFrames'],
    stack: ['TypeScript', 'Node.js', 'HyperFrames'],
    status: 'CLI tool',
    note: 'Produces a tutorial artifact, not a running copy of the source application. Available as npx repoquest.',
    image: '/images/repoquest.jpg', imageAlt: 'RepoQuest cinematic repository setup guide example',
  },
];

export const repoUrl = (project: Project) => `https://github.com/ortizjorge639/${project.id}`;
