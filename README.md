# Joji's sketchbook

A screen-based, original flipbook-inspired portfolio for Jorge's public projects in AI, technology, media, and gaming.

**Website:** https://ortizjorge639.github.io/

## Local development

Requires Node.js 22.12+.

```sh
npm ci
npm run dev
```

```sh
npm run build
npx playwright install chromium
npm test
```

Extended cross-engine responsive checks:

```sh
npx playwright install chromium firefox webkit
npm run test:responsive
```

GitHub Actions builds `main` and publishes `dist` to GitHub Pages. This is a user site, so assets use root-relative URLs.

CI runs the general browser and cross-engine responsive suites on Ubuntu and a required native-touch gate on macOS. The latter uses the same real swipe, drawing, and pinch-zoom assertions as local testing: Linux Chromium's CDP touch synthesis failed even on an untouched page, so those checks are not substituted with programmatic scrolling or skipped at release. The gesture check explicitly enables touch emulation on its own DevTools session and checks scrolling before Ink is enabled. Deployment requires both jobs; failed browser traces are retained for seven days.

## Content and interactions

- `src/project-catalog.json` is the shared eleven-project catalog, exposed by `src/projects.ts` and reviewed November13,2026 against approved public sources. Static `/read/` pages provide a separate documentation reading mode, direct links/refresh and no-JavaScript project browsing. Update descriptions against the public source READMEs before publishing. No private repositories, private saved items, or confidential project details are included.
- Project cards use original ink illustrations. The project flipbooks combine authored diagrams, source-backed copy, and actual captures for Lineage and RepoQuest. Capture sources: `web-context-graph/site/assets/product-knowledge-tree-desktop.webp` and `repoquest/docs/screenshot.jpg` in Jorge's public repositories.
- The main menu leads to View Projects and Meet Joji. Both displays change in place: there are no scrolling website sections or project-detail modals. The persistent status strip holds the local date and clock, sound control, and paged help. Date and time stack together in narrow layouts.
- Home and About share a compact row of GitHub and LinkedIn logo links to the confirmed profiles. X is intentionally omitted until its profile URL is supplied; no handle or contact address is guessed. The two SVG logos come from [Bootstrap Icons](https://github.com/twbs/icons), with the MIT license retained in `public/icons/LICENSE.txt`.
- Meet Joji retains “Always making. Always learning.” and distinguishes gaming-backlog tools from game development. Its professional summary draws on the publicly visible [LinkedIn profile](https://www.linkedin.com/in/jorgeortizflores/), reviewed September 16, 2026: Microsoft affiliation, cloud solutions/AI engineering, and human-centered design experience. Sign-in-only experience details are not reproduced or inferred. The nickname and gaming clarification were confirmed by Jorge.
- **About easter egg:** press Right Arrow on About, or tap the subtle folded-paper corner at the lower right, to turn the upper display from the portrait/tagline into four archived Flipnote images. Left Arrow or the upper-left corner turns back; the bio below stays in place. There is no visible page count or pagination bar. The small folds have 44px tap targets and keyboard focus indicators. Pages are bounded, not automatically looping, and arrows do not intercept chat editing or ink-tool controls. Each image has its supplied approximate date below it: **circa 2014, circa 2015, circa 2015, circa 2015**.
- The four 256×192 PNGs in `public/images/flipnotes/` are Jorge's supplied artwork, preserved unmodified and in attachment order. `src/flipnotes.ts` records their dates and paths. They are actual archived drawings, not generated portfolio illustrations or Nintendo interface assets. No exact creation dates or drawing titles have been inferred.
- A **button-free blue splash** is styled in the initial HTML, before the app module loads. An original frog sprite rotates around its Y-axis while the app's CSS/fonts settle. Home entry and home reload hold for **1.1 seconds** after readiness, then reveal the fully styled app with a **320 ms fade**. Direct project links omit the deliberate hold; reduced motion omits the spin, hold, and fade.
- The library shows four thumbnails per page and category filters. Selecting a thumbnail loads its **paused HTML flipbook** above without replacing the catalog. Play, frame arrows, a progress slider, restart, Sources, and Expand belong to the upper player. Catalog pagination remains in the footer; **Open** stays beneath the grid.
- Every project follows the same six-scene content contract: need, approach, system flow, technology roles, distinguishing details, and availability. Visitors see project-specific headlines and visuals, not those template labels. RepoQuest's story sequence informs the player; its fixed-size theme and video-rendering pipeline are not embedded.
- Image scenes fill the available upper player canvas with the uncropped capture and one short caption. Supporting copy lives behind Sources rather than competing for image space. The other scenes use project-specific workflow drawings, actual node/edge relationships, and technology responsibilities—not generic success icons.
- Press a project capture or archived Flipnote to open a zoomable modal. Use +/−, Fit, or the keyboard (+/−/0); pan enlarged images by dragging or scrolling. Close, Escape, or the backdrop returns to the same frame. Opening pauses playback; Ink keeps images drawable instead of opening the viewer.
- Left/Right navigates frames only while the player has focus and pauses playback. Space toggles a focused player's playback; catalog arrow keys still select thumbnails. Timed playback stops on a readable final scene. Long content remains scrollable and Expand gives the upper screen more room while retaining the lower catalog. Scrolling a frame pauses playback.
- Hover the upper frame for a single replay of its drawing sequence, without advancing the flipbook. Keyboard users can focus the frame and press Enter; touch users can tap its non-interactive canvas. Pen traces, checker accents, and short stepped poses explain the project's actual connections and responsibilities. Every visual type uses a shared recipe, including future entries; there are no per-project animation scripts. Hover is silent, stops on exit, and respects reduced motion and all playback blockers.
- **Open** keeps the selected frame and replaces only the lower catalog with the existing Overview / What's inside / Links details. Back restores the catalog's page, category, selection, and remembered frame. Preview playback never advances the lower detail tabs or changes catalog focus.
- Project details have **Overview**, **What's inside**, and **Links** pages. Existing descriptions, all capabilities and technology stacks, caveats, and source links are retained. Back restores the library selection; browser Back/Forward works. Filters, selection, and detail-page changes replace the current history entry rather than filling history with every preview.
- **Ink** in the bottom control strip lets visitors draw on either display without entering a separate editor. Mouse, stylus, and touch are supported; links and controls remain interactive. Ink off permits screen-local scrolling; pinch zoom remains available. There is no document scroll between portfolio sections.
- Each destination/content page remembers its own ink in the current tab. Story ink belongs to the project and scene and follows that frame between preview and Open; lower-screen ink stays tied to the catalog/detail destination. Changing frames never clears or redistributes the lower marks. Tool, nib, color, hover, and sound preferences remain shared.
- Enabling Ink, opening the frog guide, hiding the browser tab, or leaving the story pauses playback. Closing tools/guide does not restart it. Reduced-motion visitors get the same complete frames with manual navigation; autoplay is disabled. Missing images produce an explicit message with the surrounding story and sources intact.
- The tool tray offers square pixel pen, checker-dither paint, eraser, three original ink colors, three nib sizes, optional mouse-hover painting, and a keyboard-accessible star stamp. Undo and undoable Clear affect only the current destination. Save exports **the current destination's transparent ink**, not a portfolio screenshot. Ink is never uploaded and resets on reload.
- Escape closes the tool tray first, then exits Ink, then goes Back. Focus is restored when returning from Help or project details. Inactive screens are not left in the keyboard or accessibility tree.
- **Sound is on by default.** Only after the splash-to-app transition completes, an original four-note square-wave jingle plays. A **roughly 260 ms silent pause** separates the melody from the two-syllable, stepped 8-bit-style frog ribbit. The audio sequence lasts about one second. If autoplay is blocked, the complete sequence waits for the first permitted interaction. Home document reloads replay the entry; in-app navigation and direct project loads do not.
- The dock and status-strip speaker controls share one setting. Muting immediately silences scheduled sounds and cancels any pending entry jingle; explicit mute survives navigation and Ink off/on. Synthesized UI clicks, frog cues, and filtered-noise drawing textures use the same output. No Nintendo recordings or external sound assets are used.
- The splash uses critical inline CSS and system typography, so neither JavaScript nor external fonts are needed for its first paint. The app is hidden and inert until ready to reveal. Web fonts have a 1.6-second readiness budget; if they are late, the app keeps system fallbacks for that document instead of swapping fonts afterward. A failed module load produces an explicit reload message rather than an endless spinner.
- The original **studio frog** greets visitors beside the home flipbook mark and perches on the upper screen's lower-left edge elsewhere. The higher-pitched entry ribbit (460/350 Hz starting pitches) triggers the greeting from the running audio clock, so autoplay delays do not separate the sound from the animation. Mute cancels the queued cue.
- The pupils follow mouse/stylus position across destinations, guide states, scrolling, and resizing, with small bounded movements inside the glasses. Only the pupils move; pointer events never capture clicks or interfere with ink. Touch and window exit reset the gaze.
- Hover instantly swaps the frog to one happy frame with a subtle blue-tinted fill, held until the pointer leaves; keyboard focus gets the same feedback. There is no hover bounce or multi-frame animation, and the hit target stays fixed. Hover cannot interrupt the timed greeting or an answer-in-progress pose. Reduced motion retains the static frame, tint, and direct pupil feedback. Idle blinks stop in hidden tabs. All artwork and sounds remain original.
- Clicking the frog or **Guide** opens a non-modal conversation over the upper screen. Browse the lower screen without losing the conversation. The visible context label applies to the next question; an in-flight answer stays bound to the project selected when it was sent.
- Minimize retains the transcript and draft. Guide options provide Hide and a confirmed Clear conversation; the status-strip Guide button restores a hidden companion. Clearing chat never clears ink. Expand gives the guide more of the paired canvas; keyboard-aware fitting keeps the composer and lower navigation reachable.
- Fonts are served by Google Fonts (VT323 for pixel-style interface text, DM Sans for the retained original wordmark, and Kalam for drawing annotations), with system fallbacks. Body descriptions use a readable system sans-serif stack. The static site has no analytics, API keys, or runtime GitHub API dependency. Production builds can connect the frog to the dedicated, bounded Azure OpenAI backend; normal local builds remain disconnected unless explicitly configured. The loopback Copilot rehearsal is separate and is never a public fallback.

## Local AI guide

The frog's live answers use the installed, authenticated **GitHub Copilot CLI**.
No model key or CLI connection is bundled into the browser. The agreed
[production deployment plan](docs/frog-production.md) keeps GitHub Pages and
adds a disabled-by-default YAML selection between hosted Copilot CLI and a
direct model API. The direct adapter, strict YAML switch, Cosmos conditional reservation, global limits and public-endpoint wiring are implemented; the repository YAML remains disabled by default. The dedicated host uses an explicit server-side configuration, separate from the public build-time API origin. Actual hosted managed-identity/Cosmos/Azure OpenAI answers have been verified in both staged browser modes; production publication and exact-byte acceptance are tracked separately. See the [current runbook](docs/hosted-frog-runbook.md) for the cumulative allowance, expiry, privacy and shutdown boundaries. The local CLI is never a public fallback.

```sh
npm run guide:sources   # Explicitly refresh approved public README snapshots
npm run dev:guide       # Local bridge + Vite, http://127.0.0.1:43190
npm run test:guide      # Backend checks; no paid model calls
```

The normal `npm run dev`/`npm run preview` commands do not launch Copilot.
`dev:guide` binds the app and bridge to loopback, and proxies `/api/guide` to
the local bridge. Opening the panel can check bridge availability, but only
**Send** invokes inference. Stop aborts the request. A missing bridge,
unavailable CLI, timeout, invalid citation, or busy service is reported
explicitly; the guide does not substitute fake AI answers.

The evidence boundary is the portfolio content (including authored flipbook scenes) and snapshots of the seven
approved public project READMEs. Source links come from validated snapshot
metadata, not arbitrary model-generated URLs. The guide cannot browse new URLs,
run repository tools, or act on a visitor's behalf. Readme refresh is an explicit
maintainer operation, not part of visitor requests.

Questions, bounded conversation context, and relevant public excerpts are sent
to GitHub Copilot through the local CLI. The panel discloses this before use.
Browser chat is held in memory and resets on reload; Copilot's own local records
and service policies are a separate boundary. Do not expose the local bridge on
a network interface or tunnel it publicly.

Browser guide tests use clearly controlled API fixtures for timing and error
cases. Those fixtures are test-only, not a fallback answer engine.

The bridge runs Copilot in a temporary working/configuration directory with no
model tools, custom instructions, built-in MCP access, or remote session export.
It inherits only supported authentication-token variables, not the user's
general shell or provider configuration. If isolated authentication is
unavailable, the UI reports it rather than falling back to an unrestricted CLI.
Health reports CLI availability separately from authentication verified by a
successful answer.

Requests are limited to one active answer, ten accepted requests per minute,
1,200 question characters, six bounded history messages, a 16 KB body, and a
90-second deadline. Cancellation terminates the inference process group and
removes its temporary state. These are local rehearsal safeguards, not a
public-service abuse or billing policy.

Each question may make at most two model calls: the initial answer and one
correction if its parsed output fails answer/citation validation. The correction
uses the same source set, request slot, cancellation signal, and original
90-second deadline. It does not fetch missing sources, remap guessed citations,
or automatically retry CLI/tool/isolation errors. Both calls use the local
Copilot account and can consume credits.

Copilot's JSONL envelope and the answer JSON are validated independently. A
single outer Markdown JSON fence is accepted because the CLI can emit one;
extra prose, tool calls, invalid payloads, and invented citation IDs remain
errors. The model receives explicit allowed IDs and output limits. Terminal
diagnostics distinguish validation reasons (for example `unknown_citation`)
without logging visitor questions or answer text. If the correction also fails,
the UI explains the failed check and retains the question for manual retry.
The backend tests exercise recorded response failures and run in CI without
calling a model.

## Routes and implementation

`src/navigation.ts` parses typed screen state and validates route values.
`src/screens.ts` renders content from the project catalog; `src/main.ts` owns
navigation, focus, the opening, and shared controllers. Drawing attaches to the
two screen-local content surfaces rather than the document.

`src/story-types.ts` defines the data-only story contract; `src/stories.ts`
contains all seven authored stories. `src/story-render.ts` owns the reusable
visuals, `src/story-clock.ts` the deterministic timeline, and
`src/story-player.ts` the persistent playback controller. Timers update that
controller rather than rerendering the catalog or resetting Ink every frame.

See [authoring project stories](docs/project-stories.md) to add an entry.
`npm run build` validates story data and image assets before compiling.
`npm run test:stories` covers schema constraints, long/no-screenshot entries,
and timeline behavior without model calls or a video renderer.
MP4 export and narration are not implemented; all playback is responsive
HTML/SVG using the existing portfolio design.

Examples:

```text
#home
#projects
#projects?category=Gaming&page=1&selected=just-play
#project/repoquest/overview
#project/repoquest/inside
#project/repoquest/links
#project/repoquest/overview?scene=files-to-html
#about
#about/flipnotes/1
#help
```

Hash routes work on GitHub Pages without server rewrites. Invalid routes show an
explicit recovery screen. Project detail-page and preview changes remain
shareable, including on reload.
An optional `scene` query selects a validated frame for either a library
selection or an opened project. Existing overview/inside/links addresses remain
valid; direct inside/links loads start at the corresponding details/use frame.
Scene navigation replaces the current history entry instead of creating
history entries for every playback frame.
About flipbook turns also replace the current history entry; its Back icon
returns from an archive image to the About intro. Ink is remembered separately
for each About page. Page-turn motion is a short 220ms perspective fold and is
removed when reduced motion is enabled.

## Design

The original **DSi Flipnote Studio application**, not the hardware launcher or
Flipnote Studio 3D, informs the task-based menu, preview/control relationship,
compact status strips, graph paper, square beveled controls, and numbered pages.
The [Nintendo-authored manual](https://archive.org/download/manuallib-id-2666710/2666710.pdf)
and [historical Nintendo product pages](https://www.nintendo.co.jp/ds/dsiware/kguj/index.html)
are behavioral references. Exact original opening choreography was not verified:
the spinning-frog splash, synthesized chiptune/pause/ribbit, and 160 ms screen changes are
original interpretations.

The two displays remain **vertically stacked and frameless**, with no fake DS
bezel or mechanical hinge. Their **combined** portrait width:height ratio is
1878:2670, using the requested
[iPhone Duo inner-display proportions](https://www.apple.com/iphone-duo/specs/).
Each panel normally occupies half the height; phones allocate 55% to the touch
screen so the menu and library actions fit. The app fits the available
viewport; short landscapes relax the ratio, and screen-local overflow preserves
readable content on small displays or with enlarged text. Navigation never
depends on scrolling to another section. Reduced motion removes transitions.

Below 300 CSS pixels wide, menu/library controls become a single column and
tool groups wrap. At 360 CSS pixels tall or less, the app uses a vertically
scrollable 600px shell: this accessibility fallback keeps both displays and all
controls available instead of crushing them into the window. Shorter layouts
may therefore scroll the document, but do not become a scrolling portfolio of
unrelated sections.

When a browser exposes two hardware viewport segments, the studio occupies the
first usable segment rather than putting text or controls across the hinge.
Without that API, ordinary responsive reflow still applies. Pinch magnification
is not classified as a keyboard opening; a keyboard-sized visual viewport with
a focused composer has separate fitting behavior.

### Responsive verification

`tests/responsive.spec.ts` and `playwright.responsive.config.ts` cover 19 viewport
sizes from **240×320 through 3840×2160**, portrait/landscape tablets, ultrawide
windows, fold/unfold-size transitions, long source titles and answers, expanded
chat, ink tools, enlarged text, and 200–400% desktop-zoom-equivalent reflow.
Assertions check horizontal clipping and actual hit-testable controls, not
only document width. Chromium additionally emulates both hinge orientations.

Local Chromium, Firefox, and WebKit passed this matrix on September 16, 2026:
**73 checks passed**, with two expected skips for the Chromium-only hardware
hinge probe in Firefox and WebKit.

Firefox initializes application-data storage separately from its temporary
browser profile. On this Mac, its default application-data startup failed with
“Could not find profile folder,” even with an existing test profile. The
worker-scoped fixture in `tests/fixtures/responsive.ts` gives Firefox fresh
`MOZ_APP_DATA` and `MOZ_LOCAL_APP_DATA` directories and removes them at teardown.
This uses Firefox's supported directory overrides; it does not change the
browser binary, touch personal profiles, or bypass any application assertions.

WebKit automation is not the same as testing Safari on a physical iPhone.
Keyboard viewport changes are simulated, and zoom-equivalent tests resize the
CSS viewport rather than controlling browser chrome. Physical keyboard/notch
behavior, actual foldable hardware, and arbitrary sizes outside the matrix
remain verification limits, not universal compatibility claims.

The retained palette is blue `#3157bc`, red `#c53f2e`, warm background `#f6f3e9`,
and paper `#fffdf6` (plus the existing drawing inks). This is an independent,
original homage, not an official Nintendo product. It includes no Nintendo
logos, artwork, or recorded sounds. `PRODUCT.md` records scope and `DESIGN.md`
records the implemented visual system.
