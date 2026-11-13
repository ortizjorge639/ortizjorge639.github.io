import { projects } from './projects.ts';
import { currentStories } from './current-stories.ts';
import type { ProjectStory } from './story-types';

// Authored from the curated catalog and the pinned public README snapshots.
export const projectStories: Record<string, ProjectStory> = {
  repoquest: {
    projectId: 'repoquest',
    sources: [{
      id: 'repoquest-readme',
      title: 'RepoQuest README',
      url: 'https://github.com/ortizjorge639/repoquest/blob/eb712c1fa34690d2f772f06afd81c82d73482553/README.md',
    }],
    scenes: [
      {
        id: 'setup-across-files', beat: 'need', duration: 8,
        headline: 'Setup instructions live across several files',
        body: 'RepoQuest brings README instructions, package scripts, and environment examples into a single setup guide.',
        visual: { type: 'contrast', before: 'README, package scripts, environment examples', after: 'One self-contained HTML walkthrough' },
        sources: ['repoquest-readme'],
      },
      {
        id: 'watch-the-guide', beat: 'approach', duration: 8,
        headline: 'A repository becomes a guided walkthrough',
        body: 'The TypeScript CLI generates an animated, ten-scene tutorial with navigation for revisiting setup details.',
        visual: { type: 'image', src: '/images/repoquest.jpg', alt: 'RepoQuest tutorial showing repository setup requirements and sidebar navigation' },
        sources: ['repoquest-readme'],
      },
      {
        id: 'files-to-html', beat: 'flow', duration: 9,
        headline: 'Read files, collect setup data, generate HTML',
        body: 'The parser produces RepoData. The generator combines that data with a selected theme to write the tutorial artifact.',
        visual: {
          type: 'flow',
          nodes: [
            { id: 'repo-files', label: 'Repository', detail: 'README, package, env, tree' },
            { id: 'parser', label: 'Parser', detail: 'Read setup signals' },
            { id: 'repo-data', label: 'RepoData', detail: 'Structured project details' },
            { id: 'generator', label: 'Generator', detail: 'Apply a selected theme' },
            { id: 'html-guide', label: 'HTML guide', detail: 'Self-contained tutorial' },
          ],
          edges: [
            { from: 'repo-files', to: 'parser' }, { from: 'parser', to: 'repo-data' },
            { from: 'repo-data', to: 'generator' }, { from: 'generator', to: 'html-guide' },
          ],
        },
        sources: ['repoquest-readme'],
      },
      {
        id: 'cli-and-rendering', beat: 'build', duration: 8,
        headline: 'A CLI creates the guide; video is optional',
        body: 'TypeScript and Node.js power the CLI. Its HTML composition can also be rendered to video through HyperFrames.',
        visual: {
          type: 'roles',
          items: [
            { name: 'TypeScript', role: 'Parser, generator, and shared data types' },
            { name: 'Node.js', role: 'Run the command-line tool' },
            { name: 'HyperFrames', role: 'Render the HTML composition to video' },
          ],
        },
        sources: ['repoquest-readme'],
      },
      {
        id: 'choose-guide-output', beat: 'details', duration: 9,
        headline: 'Choose the repository, theme, and output',
        body: 'Point the CLI at a local checkout. Repository inputs are optional, so a guide can be generated even when some setup files are absent.',
        visual: {
          type: 'steps',
          items: [
            { title: 'Select a directory', detail: 'Use --dir to choose the local repository.' },
            { title: 'Choose a theme', detail: 'Tutorial, quest, minimal, or pitch.' },
            { title: 'Open the artifact', detail: 'Write repoquest.html and open it in a browser.' },
          ],
        },
        sources: ['repoquest-readme'],
      },
      {
        id: 'tutorial-not-app', beat: 'use', duration: 8,
        headline: 'Share the guide, not a running application',
        body: 'Available as npx repoquest. The result explains setup; it does not install, configure, or run the source application for you.',
        visual: { type: 'outcome', result: 'A portable HTML tutorial artifact, not a running copy of the source app.' },
        sources: ['repoquest-readme'],
      },
    ],
  },
  'weekend-batch': {
    projectId: 'weekend-batch',
    sources: [{
      id: 'batch-readme',
      title: 'The Batch README',
      url: 'https://github.com/ortizjorge639/weekend-batch/blob/5febeb13b59cdae1dc0f29b877236c620f393f92/README.md',
    }],
    scenes: [
      {
        id: 'saved-items-apart', beat: 'need', duration: 8,
        headline: 'Saved items need somewhere to be revisited',
        body: 'The Batch brings starred Gmail and X bookmarks into a phone-friendly weekly feed, with state that carries over between weeks.',
        visual: { type: 'contrast', before: 'Starred mail and bookmarks in separate places', after: 'A weekly feed with persistent item state' },
        sources: ['batch-readme'],
      },
      {
        id: 'weekly-feed', beat: 'approach', duration: 8,
        headline: 'Keep the item and its conversation together',
        body: 'A shared JSON context store holds item state and discussion threads for the static feed and a desktop client.',
        visual: { type: 'outcome', result: 'New, seen, sparred, acted, and dismissed states carry forward with the item.' },
        sources: ['batch-readme'],
      },
      {
        id: 'sources-to-feed', beat: 'flow', duration: 9,
        headline: 'A Saturday batch reads the existing memory',
        body: 'The scheduled gather reads prior item state from the context store before writing the new batch for the static feed.',
        visual: {
          type: 'flow',
          nodes: [
            { id: 'saved-inputs', label: 'Saved items', detail: 'Gmail stars and X bookmarks' },
            { id: 'saturday-gather', label: 'Gather', detail: 'Saturday GitHub Actions run' },
            { id: 'context-store', label: 'JSON store', detail: 'Item state and threads' },
            { id: 'phone-feed', label: 'Static feed', detail: 'Read the weekly batch' },
          ],
          edges: [
            { from: 'saved-inputs', to: 'saturday-gather' },
            { from: 'context-store', to: 'saturday-gather' },
            { from: 'saturday-gather', to: 'context-store' },
            { from: 'context-store', to: 'phone-feed' },
          ],
        },
        sources: ['batch-readme'],
      },
      {
        id: 'scheduled-static-stack', beat: 'build', duration: 8,
        headline: 'Scheduled gathering, static reading',
        body: 'JavaScript gathers the batch, GitHub Actions schedules the refresh, and static HTML presents the feed.',
        visual: {
          type: 'roles',
          items: [
            { name: 'JavaScript', role: 'Gather saved items and preserve their state' },
            { name: 'GitHub Actions', role: 'Schedule the Saturday batch refresh' },
            { name: 'Static HTML', role: 'Present the phone-friendly feed' },
          ],
        },
        sources: ['batch-readme'],
      },
      {
        id: 'manual-writeback', beat: 'details', duration: 9,
        headline: 'Browser changes take the manual way back',
        body: 'The static feed cannot write to the repository server-side. Pending marks must be copied into updates.json for the next batch.',
        visual: {
          type: 'steps',
          items: [
            { title: 'Mark an item', detail: 'The browser queues changes in localStorage.' },
            { title: 'Copy updates.json', detail: 'Manually paste or commit the pending marks to the repo.' },
            { title: 'Wait for the batch', detail: 'The next Saturday run folds updates into the store.' },
          ],
        },
        sources: ['batch-readme'],
      },
      {
        id: 'personal-feed-setup', beat: 'use', duration: 8,
        headline: 'A personal feed with asynchronous updates',
        body: 'Configure your own Gmail OAuth credentials and repository secrets. Write-back is manual and asynchronous; no private saved items are shown here.',
        visual: { type: 'outcome', result: 'A personal weekly feed, not a live synchronized inbox.' },
        sources: ['batch-readme'],
      },
    ],
  },
  'web-context-graph': {
    projectId: 'web-context-graph',
    sources: [{
      id: 'lineage-readme',
      title: 'Lineage README',
      url: 'https://github.com/ortizjorge639/web-context-graph/blob/259037c89becdb88b2b9c69002c6efe5a6e9167b/README.md',
    }],
    scenes: [
      {
        id: 'keep-the-fork-point', beat: 'need', duration: 8,
        headline: 'Explore a tangent without losing its origin',
        body: 'Lineage turns Copilot CLI conversations into a branching knowledge tree, preserving the path that led to each new direction.',
        visual: { type: 'contrast', before: 'A conversation with another direction to explore', after: 'A child branch with its parent and fork point intact' },
        sources: ['lineage-readme'],
      },
      {
        id: 'branch-a-block', beat: 'approach', duration: 8,
        headline: 'Start a branch from a response block',
        body: 'Choose a whole Markdown block or list item. The child receives root-to-fork context, without content from sibling conversations.',
        visual: { type: 'image', src: '/images/lineage.webp', alt: 'Lineage workspace showing a conversation beside its branching knowledge tree' },
        sources: ['lineage-readme'],
      },
      {
        id: 'prompt-to-vault', beat: 'flow', duration: 9,
        headline: 'A branch becomes files you can inspect',
        body: 'The workspace assembles ancestor context, invokes Copilot CLI, and records the conversation and relationships in a local Git-backed vault.',
        visual: {
          type: 'flow',
          nodes: [
            { id: 'branch-prompt', label: 'Branch prompt', detail: 'Selected block and new request' },
            { id: 'lineage-context', label: 'Context', detail: 'Root to fork; no siblings' },
            { id: 'copilot-cli', label: 'Copilot CLI', detail: 'Generate the response' },
            { id: 'local-vault', label: 'Local vault', detail: 'Markdown, YAML, Git history' },
            { id: 'knowledge-tree', label: 'Tree view', detail: 'Revisit branches and files' },
          ],
          edges: [
            { from: 'branch-prompt', to: 'lineage-context' }, { from: 'lineage-context', to: 'copilot-cli' },
            { from: 'copilot-cli', to: 'local-vault' }, { from: 'local-vault', to: 'knowledge-tree' },
          ],
        },
        sources: ['lineage-readme'],
      },
      {
        id: 'local-workspace-stack', beat: 'build', duration: 8,
        headline: 'A browser workspace backed by a local agent',
        body: 'React supplies the interface. FastAPI serves it on localhost and invokes the installed, authenticated Copilot CLI.',
        visual: {
          type: 'roles',
          items: [
            { name: 'React', role: 'Conversation and Knowledge Tree interface' },
            { name: 'FastAPI', role: 'Local backend and vault mutations' },
            { name: 'Copilot CLI', role: 'Installed agent invoked as a subprocess' },
          ],
        },
        sources: ['lineage-readme'],
      },
      {
        id: 'plain-file-boundaries', beat: 'details', duration: 9,
        headline: 'Keep content, relationships, and history distinct',
        body: 'The vault remains inspectable outside the UI. Git records local mutations; a remote is not configured or pushed automatically.',
        visual: {
          type: 'steps',
          items: [
            { title: 'Read thread.md', detail: 'Conversation content lives in Markdown.' },
            { title: 'Inspect meta.yaml', detail: 'Parent and fork relationships are authoritative here.' },
            { title: 'Review local Git', detail: 'Mutations are committed in the separate vault.' },
          ],
        },
        sources: ['lineage-readme'],
      },
      {
        id: 'trusted-localhost', beat: 'use', duration: 8,
        headline: 'Run it on trusted localhost',
        body: 'Requires an installed, authenticated Copilot CLI with active access. The project site is a walkthrough, not a hosted multi-user service.',
        visual: { type: 'outcome', result: 'A single-user local workspace. Do not expose the backend publicly.' },
        sources: ['lineage-readme'],
      },
    ],
  },
  'bot-meetings-dotnet': {
    projectId: 'bot-meetings-dotnet',
    sources: [{
      id: 'meetings-readme',
      title: 'Meeting Transcript Copilot README',
      url: 'https://github.com/ortizjorge639/bot-meetings-dotnet/blob/a06b0cdb75978413edff44987f863ccc67749cd7/README.md',
    }],
    scenes: [
      {
        id: 'find-the-discussion', beat: 'need', duration: 8,
        headline: 'Ask about the meeting after it ends',
        body: 'This Teams bot retrieves meeting transcripts and answers questions about the latest completed conversation with Azure OpenAI.',
        visual: { type: 'contrast', before: 'Search through the completed meeting transcript', after: 'Ask a transcript-grounded question in the meeting chat' },
        sources: ['meetings-readme'],
      },
      {
        id: 'ready-then-ask', beat: 'approach', duration: 8,
        headline: 'Wait for the transcript, then ask in chat',
        body: 'The bot handles meeting events, polls for the transcript, and posts a readiness card before post-meeting Q&A.',
        visual: {
          type: 'steps',
          items: [
            { title: 'Finish the meeting', detail: 'A meeting-end event queues transcript retrieval.' },
            { title: 'Watch for readiness', detail: 'The bot announces the available transcript in chat.' },
            { title: 'Ask a question', detail: 'Answers draw on the completed transcript.' },
          ],
        },
        sources: ['meetings-readme'],
      },
      {
        id: 'transcript-to-answer', beat: 'flow', duration: 9,
        headline: 'Transcript chunks supply the answer context',
        body: 'Graph polling retrieves the transcript. Speaker-aware chunks are stored locally, selected for the question, and sent to Azure OpenAI.',
        visual: {
          type: 'flow',
          nodes: [
            { id: 'meeting-chat', label: 'Teams chat', detail: 'Meeting end and questions' },
            { id: 'graph-worker', label: 'Graph worker', detail: 'Poll for the transcript' },
            { id: 'chunk-store', label: 'Chunk store', detail: 'Parsed VTT, configured path' },
            { id: 'openai', label: 'Azure OpenAI', detail: 'Answer from relevant chunks' },
            { id: 'chat-answer', label: 'Chat answer', detail: 'Source labels and timestamps' },
          ],
          edges: [
            { from: 'meeting-chat', to: 'graph-worker' }, { from: 'graph-worker', to: 'chunk-store' },
            { from: 'chunk-store', to: 'openai' }, { from: 'meeting-chat', to: 'openai' },
            { from: 'openai', to: 'chat-answer' },
          ],
        },
        sources: ['meetings-readme'],
      },
      {
        id: 'bot-retrieval-model', beat: 'build', duration: 8,
        headline: 'Separate the bot, retrieval, and model roles',
        body: 'The .NET sample handles Teams activity, Microsoft Graph supplies transcript access, and Azure OpenAI generates answers.',
        visual: {
          type: 'roles',
          items: [
            { name: '.NET 10', role: 'Bot handlers and background transcript worker' },
            { name: 'Microsoft Graph', role: 'Retrieve authorized meeting transcripts' },
            { name: 'Azure OpenAI', role: 'Answer questions from selected transcript chunks' },
          ],
        },
        sources: ['meetings-readme'],
      },
      {
        id: 'retrieval-boundaries', beat: 'details', duration: 9,
        headline: 'Readiness and citations have defined limits',
        body: 'Transcript polling is bounded. Questions stay scoped to tenant and conversation, and citation checks do not prove every answer claim.',
        visual: {
          type: 'steps',
          items: [
            { title: 'Bound the wait', detail: 'Transcript polling uses a retry limit and time window.' },
            { title: 'Scope retrieval', detail: 'Select context for this tenant and conversation.' },
            { title: 'Check references', detail: 'Known source labels are required, not factual guarantees.' },
          ],
        },
        sources: ['meetings-readme'],
      },
      {
        id: 'tenant-setup-required', beat: 'use', duration: 8,
        headline: 'A reusable sample with administrator setup',
        body: 'Based on a Microsoft Teams sample. Requires tenant admin consent, a transcript access policy, and your own Teams and Azure service configuration.',
        visual: { type: 'outcome', result: 'Configure permissions and services in your tenant before using real meeting transcripts.' },
        sources: ['meetings-readme'],
      },
    ],
  },
  'mcreator-workspace-harness': {
    projectId: 'mcreator-workspace-harness',
    sources: [{
      id: 'mcreator-readme',
      title: 'MCreator Workspace Harness README',
      url: 'https://github.com/ortizjorge639/mcreator-workspace-harness/blob/547eaf435bed89ca7eadaa56407723a556a48ebb/README.md',
    }],
    scenes: [
      {
        id: 'generated-edits-drift', beat: 'need', duration: 8,
        headline: 'A Java edit can disappear on regeneration',
        body: 'MCreator work spans workspace metadata, Blockly definitions, generated Java, and runtime behavior. Changing only one layer can leave the others behind.',
        visual: { type: 'contrast', before: 'An external edit to generated Java alone', after: 'Coordinated workspace layers and a runtime check' },
        sources: ['mcreator-readme'],
      },
      {
        id: 'coordinate-workspace-layers', beat: 'approach', duration: 8,
        headline: 'Give the agent a regeneration-aware workflow',
        body: 'The harness is an agent skill and field guide for procedure edits, Blockly and Java coordination, and live Minecraft log tracing.',
        visual: { type: 'outcome', result: 'Guidance for editing the whole workspace path, rather than treating generated Java as durable.' },
        sources: ['mcreator-readme'],
      },
      {
        id: 'workspace-to-runtime-check', beat: 'flow', duration: 9,
        headline: 'Follow an edit all the way to a runtime check',
        body: 'Inspect the workspace, close MCreator before editing, validate and compile, then trace the requested behavior during Run Client.',
        visual: {
          type: 'flow',
          nodes: [
            { id: 'workspace-files', label: 'Workspace', detail: 'Index, elements, Blockly, Java' },
            { id: 'coordinated-edit', label: 'Inspect and edit', detail: 'MCreator closed for writes' },
            { id: 'validation', label: 'Validate', detail: 'JSON/XML and compilation' },
            { id: 'run-client', label: 'Run Client', detail: 'User performs the exact test' },
            { id: 'runtime-evidence', label: 'Runtime evidence', detail: 'Logs and registry state' },
          ],
          edges: [
            { from: 'workspace-files', to: 'coordinated-edit' }, { from: 'coordinated-edit', to: 'validation' },
            { from: 'validation', to: 'run-client' }, { from: 'run-client', to: 'runtime-evidence' },
          ],
        },
        sources: ['mcreator-readme'],
      },
      {
        id: 'skill-tools-editor', beat: 'build', duration: 8,
        headline: 'A skill, helper scripts, and the existing editor',
        body: 'The toolkit teaches agents how to work with MCreator files and use PowerShell helpers for inspection and real-time log tracing.',
        visual: {
          type: 'roles',
          items: [
            { name: 'Agent skills', role: 'Teach the safe workspace editing workflow' },
            { name: 'PowerShell', role: 'Inspect workspaces and trace runtime logs' },
            { name: 'MCreator', role: 'Edit Blockly procedures and regenerate Java' },
          ],
        },
        sources: ['mcreator-readme'],
      },
      {
        id: 'protect-and-prove-edits', beat: 'details', duration: 9,
        headline: 'Compilation is not a runtime verdict',
        body: 'Back up first, inspect the installed version, and verify the requested behavior in Minecraft instead of claiming success from a build alone.',
        visual: {
          type: 'steps',
          items: [
            { title: 'Back up and close', detail: 'An open MCreator session can overwrite external changes.' },
            { title: 'Respect regeneration', detail: 'Generated Java is not durable unless code-locked.' },
            { title: 'Trace the test', detail: 'Check live logs and registry IDs, not appearance alone.' },
          ],
        },
        sources: ['mcreator-readme'],
      },
      {
        id: 'independent-toolkit', beat: 'use', duration: 8,
        headline: 'Use the guide with your local workspace',
        body: 'An independent developer toolkit, not an official MCreator automation API. File formats and generator behavior must be checked for your installed version.',
        visual: { type: 'outcome', result: 'A regeneration-aware editing skill; it does not replace MCreator or its runtime tests.' },
        sources: ['mcreator-readme'],
      },
    ],
  },
  'reset-canvas': {
    projectId: 'reset-canvas',
    sources: [{
      id: 'reset-readme',
      title: 'Grand Reset README',
      url: 'https://github.com/ortizjorge639/reset-canvas/blob/24a5cd964306ba740bb9c94610e61e670265ec04/README.md',
    }],
    scenes: [
      {
        id: 'see-the-loose-ends', beat: 'need', duration: 8,
        headline: 'Make room to see what occupies your world',
        body: 'Grand Reset maps physical and digital loose ends without turning them into deadlines, overdue items, or urgency scores.',
        visual: { type: 'contrast', before: 'Physical and digital loose ends to make sense of', after: 'A local map of thoughts, possibilities, and closure' },
        sources: ['reset-readme'],
      },
      {
        id: 'one-map-three-views', beat: 'approach', duration: 8,
        headline: 'Change perspective without changing the cards',
        body: 'Canvas, Grid, and Flow offer different ways to explore the same map. Search, filter, and edit across lifecycle spaces.',
        visual: {
          type: 'steps',
          items: [
            { title: 'Canvas', detail: 'Arrange cards and move through the map.' },
            { title: 'Grid', detail: 'Scan the same cards in a responsive layout.' },
            { title: 'Flow', detail: 'Review cards one at a time in a carousel.' },
          ],
        },
        sources: ['reset-readme'],
      },
      {
        id: 'proposal-to-local-map', beat: 'flow', duration: 9,
        headline: 'An agent proposal waits for your approval',
        body: 'Proposals are validated before entering the inbox. Approved changes update the browser-local snapshot that supplies the map views.',
        visual: {
          type: 'flow',
          nodes: [
            { id: 'proposals', label: 'Proposals', detail: 'JSON import or browser API' },
            { id: 'validation', label: 'Validation', detail: 'Check the proposal contract' },
            { id: 'human-review', label: 'Agent inbox', detail: 'Approve or dismiss' },
            { id: 'browser-store', label: 'localStorage', detail: 'Canonical local snapshot' },
            { id: 'map-views', label: 'Map views', detail: 'Canvas, Grid, Flow' },
          ],
          edges: [
            { from: 'proposals', to: 'validation' }, { from: 'validation', to: 'human-review' },
            { from: 'human-review', to: 'browser-store' }, { from: 'browser-store', to: 'map-views' },
          ],
        },
        sources: ['reset-readme'],
      },
      {
        id: 'browser-only-stack', beat: 'build', duration: 8,
        headline: 'The browser owns the state',
        body: 'JavaScript handles the map and inbox. JSON Schema documents the proposal contract, and localStorage keeps the current snapshot.',
        visual: {
          type: 'roles',
          items: [
            { name: 'JavaScript', role: 'Map interactions, state, and proposal review' },
            { name: 'JSON Schema', role: 'Document the agent proposal contract' },
            { name: 'localStorage', role: 'Persist the snapshot in this browser origin' },
          ],
        },
        sources: ['reset-readme'],
      },
      {
        id: 'lifecycle-without-deadlines', beat: 'details', duration: 9,
        headline: 'Leave space for now, later, and closure',
        body: 'Cards are observations, not todos. Lifecycle spaces separate what is present from possibilities and preserve reflection when a loop closes.',
        visual: {
          type: 'steps',
          items: [
            { title: 'Keep perspective', detail: 'Compass holds principles; Radar holds up to seven thoughts.' },
            { title: 'Allow not now', detail: 'Horizon keeps possibilities without urgency scoring.' },
            { title: 'Close with reflection', detail: 'Stowed and Released require an outcome and lesson.' },
          ],
        },
        sources: ['reset-readme'],
      },
      {
        id: 'local-origin-not-account', beat: 'use', duration: 8,
        headline: 'Your map stays in this browser origin',
        body: 'Serve the files over HTTP. There is no remote backend or synced account; the origin, including its port, owns the saved state. Export a snapshot to keep a copy.',
        visual: { type: 'outcome', result: 'A browser-local map with explicit exports, not automatic cross-device sync.' },
        sources: ['reset-readme'],
      },
    ],
  },
  ...currentStories,
};

// Keep original authored scenes, but cite the newly reviewed README revisions.
for (const project of projects) {
  if (currentStories[project.id]) continue;
  const story = projectStories[project.id];
  const reviewed = project.sources?.find(source => source.url.startsWith('https://github.com/'));
  if (story && reviewed) story.sources[0].url = reviewed.url;
}
const meetingPreview = projectStories['bot-meetings-dotnet'].scenes[5];
meetingPreview.body = 'Preview, not production-ready. Requires tenant admin consent, a transcript access policy, and your own service configuration. Use non-sensitive test meetings only.';
meetingPreview.visual = { type: 'outcome', result: 'Preview, not production-ready. Use non-sensitive test meetings only; one App Service instance.' };
