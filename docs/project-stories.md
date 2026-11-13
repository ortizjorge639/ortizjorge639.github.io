# Authoring project flipbooks

`src/stories.ts` exports `projectStories: Record<string, ProjectStory>`.
`src/story-types.ts` is the shared data contract. The catalog in `src/projects.ts`
owns project identity, descriptions, stack, status, links, and availability.
Stories supplement that catalog; they do not replace it.

## Add or revise an entry

1. Start with an approved catalog project. Read its actual public README text
   in `data/guide-sources.json`, not just snapshot metadata. RepoQuest is the
   reference story. Do not crawl or infer implementation details from a name.
2. Add a story keyed by the exact catalog ID, with the same `projectId`. Cite
   the snapshot's public README using its **commit** SHA, not the README blob
   SHA: `https://github.com/ortizjorge639/REPO/blob/COMMIT/README.md`.
3. Author six beats in order: `need`, `approach`, `flow`, `build`, `details`,
   `use`. Give each a stable lowercase hyphen-separated ID and a specific
   headline. IDs are route targets, not visitor-facing section titles.
4. Declare source metadata once and reference its IDs in every beat's `sources`.
   Keep claims within the curated facts or cited text. Preserve limitations:
   manual write-back, localhost boundaries, permissions, regeneration,
   browser-local state, in-progress work, and tutorial-versus-app distinctions.
5. Use the prescribed visuals below. Prefer the existing Lineage and RepoQuest
   images for their approach beats. Without a screenshot, use `steps` or
   `outcome`; do not invent screenshots, terminals, metrics, or success claims.
6. Run both checks from the repository root:

   ```sh
   node --experimental-strip-types scripts/validate-stories.mjs
   node --experimental-strip-types --test scripts/story-content.test.mjs
   ```

No dependencies or source refresh are needed. The validator checks actual
image files under `public/images`; it does not inspect image dimensions or
verify external URLs over the network. Tests compare the authored citations
with the pinned public snapshot. Human review is still required for claims.

## Data and rendering budgets

All text is nonempty plain text. The validator rejects missing, oversized, or
unsupported values rather than filling defaults. Unknown fields are rejected,
including custom HTML and JavaScript. Each story has 1–8 sources; each beat
references 1–8 unique declared source IDs.

| Field | Limit |
| --- | --- |
| Story, scene, source, and node IDs | 64 characters; lowercase letters/digits with single hyphens; start with a letter |
| Headline | 80 characters |
| Body | 400 characters maximum; target 180 or fewer |
| Source title / URL | 120 / 2048 characters |
| Scene duration | Finite number, 3–20 seconds; author 8 or 9 normally |
| Total duration | 45–60 seconds; current stories are 50 seconds each |

Scene/source IDs are unique within a story; flow node IDs are unique within a
visual. Sources must be HTTPS GitHub blob URLs in approved catalog repositories
under `ortizjorge639`, pinned to a lowercase 40-character commit SHA, or the
canonical `https://ortizjorge639.github.io/` URL with an optional route fragment.
Arbitrary external URLs, branch-based blob links, credentials, query strings,
and traversal paths are not supported.

| Beat | Visual | Bounds |
| --- | --- | --- |
| `need` | `contrast` | `before` and `after`: 140 characters each |
| `approach` | `image`, `steps`, or `outcome` | Use actual imagery or an honest description |
| `flow` | `flow` | 3–5 nodes: input, 1–3 processing/storage stages, output; 2–10 edges |
| `build` | `roles` | 1–3 items; `name`: 48, `role`: 120 characters |
| `details` | `steps` | 1–3 items; `title`: 64, `detail`: 160 characters |
| `use` | `outcome` | `result`: 240 characters; include an honest availability caveat |

Flow nodes use `{ id, label, detail }`, with label/detail limits of 40/80.
Edges use `{ from, to }` pointing to existing nodes; no self edges, duplicate
edges, or isolated nodes. Author nodes in reading order, beginning with actual
inputs and ending with actual outputs. A diagram is a bounded, sourced
explanation, not an inferred infrastructure topology.

Images use `{ type: 'image', src, alt }`. `src` is at most 240 characters and
must be a local `/images/` path using ordinary filename segments and a
`webp`, `png`, `jpg`, `jpeg`, `avif`, or `svg` extension. No query strings or
traversal. `alt` is required and at most 180 characters.

Image scenes are image-first: the capture fills the available player canvas
without cropping, and `headline` is the single short caption beneath it.
Do not add a second heading or paragraph over the image. Keep the headline
short enough for a sentence on a phone; allow wrapping at extreme widths rather
than truncating it. The authored `body` remains available with Sources and to
the guide's evidence loader. Image load errors retain the caption and an
explicit recovery message.
Pressing an image opens the shared modal viewer with zoom in/out (100–400%
relative to fit), Fit, mouse-drag/native touch-scroll panning, and Close.
Escape closes it and restores focus without changing the frame; playback pauses
and never resumes automatically. The same viewer handles archived Flipnotes,
retaining their pixel rendering. Image triggers are disabled while Ink is on,
so the image remains drawable. No extra scene data is needed.

The contrast and outcome drawings use project-specific paired artwork in
`src/story-art.ts`, selected by the catalog's `illustration` key. Current pairs
show saved items becoming a feed, a conversation fork, transcript-grounded chat,
workspace-layer coordination, organized canvas cards, a completed-game
treehouse, and repository files becoming a playable guide. Do not choose a
random available motif for a new project: reuse one only when it describes the
actual workflow, or add an original pair for its subject. Flow diagrams and
technology roles must likewise describe the project's sourced implementation,
not generic decorative symbols or invented integration logos.

Render all authored strings as text, never executable markup. Support wrapping,
scrolling, and the full validated maximums rather than assuming the shorter
current copy; do not truncate away caveats or sources. Keep images contained
with their alternative text. Make graphs and steps readable without animation.
Use scene durations as playback timing, not simulated completion or progress.
Respect pause, manual navigation, and reduced motion; no per-story custom
animation code, autoplay audio, or motion-dependent information.

## Shared motion recipes

`src/story-motion.ts` derives motion from the existing visual type and authored
data. New entries inherit it without project-ID branches or animation settings:

| Visual | Motion |
| --- | --- |
| `contrast` | Trace the original subject, draw the connecting arrow, then draw and settle the result |
| `flow` | Emphasize nodes in reading order; trace actual outgoing edges and cue their receiving nodes |
| `roles`, `steps` | Brief pencil underlines connect attention to each named responsibility or step |
| `outcome` | Draw the project's own symbol and settle its final pose |
| `image` | Brief viewfinder corners indicate an inspectable capture; never pan, crop, or fabricate activity inside the screenshot |

The material comes from Flipnote's pen strokes, patterned paint, and lightbox
guides: stepped stroke drawing over a faint guide, checker accents, and small
held poses. Individual strokes take 180–460ms; the complete sequence runs once
and settles within 2.5 seconds. These are explanatory sequences, never loading,
compilation, synchronization, or success indicators.

Hovering the upper frame replays only that frame once. Leaving ends the hover
sequence; moving within it does not restart it. Touch pointers do not trigger
hover. Tap a non-interactive part of the frame, or focus it and press Enter, to
replay deliberately. Tapping a screenshot still opens the image viewer.
Manual frame changes run the same recipe; Play drives it from the story clock.
Hover never changes the selected scene, timeline position, URL, lower catalog,
ink, or keyboard focus. It adds no sound.

Text and the base diagrams stay readable throughout. Reduced motion bypasses
the recipes entirely. Ink, Guide, Sources, the image modal, hidden tabs, and
navigation cancel motion without automatic resumption. Resize reconnects the
actual graph; it does not invent edges or keep animating detached elements.
Keep art original rather than copying Nintendo sprites.

Reference review:
- [Nintendo Life's original DSi review](https://www.nintendolife.com/reviews/dsiware/flipnote_studio): pen tips, spray patterns, lightbox, and separate frame-navigation/play controls.
- [Sudomemo: Advanced Tools](https://support.sudomemo.net/advanced-tools/): original tool/settings screenshots.
- [Sudomemo: Drafting Tool](https://support.sudomemo.net/drafting-tool/): temporary guides and layers, with original editor screenshots. The drafting layer is not exported with the Flipnote.

## Data-only example

This compact, complete RepoQuest example demonstrates the data shape. A new
project needs its own factual sources, IDs, and all six authored beats.

```ts
import type { ProjectStory } from './story-types';

const draft = {
  projectId: 'repoquest',
  sources: [{
    id: 'readme',
    title: 'RepoQuest README',
    url: 'https://github.com/ortizjorge639/repoquest/blob/eb712c1fa34690d2f772f06afd81c82d73482553/README.md',
  }],
  scenes: [
    {
      id: 'setup-files', beat: 'need', duration: 8,
      headline: 'Bring setup details together',
      body: 'Setup signals live in the README, package scripts, and environment examples.',
      visual: { type: 'contrast', before: 'Several setup files', after: 'One HTML guide' },
      sources: ['readme'],
    },
    {
      id: 'html-walkthrough', beat: 'approach', duration: 8,
      headline: 'Generate a walkthrough',
      body: 'The CLI produces a ten-scene animated tutorial.',
      visual: { type: 'outcome', result: 'A self-contained HTML guide.' },
      sources: ['readme'],
    },
    {
      id: 'parse-and-generate', beat: 'flow', duration: 8,
      headline: 'From files to HTML',
      body: 'The parser supplies repository data to the themed generator.',
      visual: {
        type: 'flow',
        nodes: [
          { id: 'files', label: 'Files', detail: 'Local repository' },
          { id: 'parse', label: 'Parse', detail: 'Collect RepoData' },
          { id: 'generate', label: 'Generate', detail: 'Apply a theme' },
          { id: 'html', label: 'HTML', detail: 'Tutorial artifact' },
        ],
        edges: [
          { from: 'files', to: 'parse' }, { from: 'parse', to: 'generate' },
          { from: 'generate', to: 'html' },
        ],
      },
      sources: ['readme'],
    },
    {
      id: 'cli-runtime', beat: 'build', duration: 8,
      headline: 'Run a TypeScript CLI',
      body: 'Node.js runs the command-line tool.',
      visual: { type: 'roles', items: [{ name: 'Node.js', role: 'CLI runtime' }] },
      sources: ['readme'],
    },
    {
      id: 'select-the-directory', beat: 'details', duration: 8,
      headline: 'Choose a local repository',
      body: 'Use --dir to select the checkout to read.',
      visual: { type: 'steps', items: [{ title: 'Select the directory', detail: 'Pass --dir ./my-project.' }] },
      sources: ['readme'],
    },
    {
      id: 'share-the-artifact', beat: 'use', duration: 8,
      headline: 'Share the tutorial artifact',
      body: 'Available as npx repoquest. It does not run the source application.',
      visual: { type: 'outcome', result: 'Open repoquest.html in a browser, not a running copy of the app.' },
      sources: ['readme'],
    },
  ],
} satisfies ProjectStory;
```

The production story file contains data and a type-only import, so it works
in the browser and Node's type-stripping mode without executable relative
imports. Do not introduce a code generator or source-generated inference as an
authoring shortcut. This portfolio uses bounded, author-supplied scene data,
not RepoQuest's custom HTML/JavaScript theme format.

MP4 export could be a future consumer of the same data; portfolio video
export is **not implemented**. RepoQuest's own HyperFrames capability is a
separate, source-backed project fact.
