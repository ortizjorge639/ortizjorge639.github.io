# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Joji's sketchbook is Jorge's portfolio of public experiments in AI, technology,
media, and gaming. Visitors explore the work, understand what each project
actually does, and follow its public repository or walkthrough.

## Users

People exploring Jorge's public work on desktop or mobile. No narrower audience
or recruiting-specific goal has been established.

## Capabilities and Constraints

- Seven curated projects in `src/projects.ts`, with descriptions and caveats
  grounded in public READMEs.
- Original project sketches and two actual project captures, clearly distinguished.
- Screen-based browsing and paged project details in a static GitHub Pages app.
- Every project has a source-backed six-scene HTML flipbook with manual and
  opt-in timed playback. Selecting it changes only the upper display; the
  catalog stays below until Open reveals supporting details and links.
- Project entries share a typed visual/content template with build validation.
  No visitor-time content generation or video encoding is required. MP4 export
  remains outside the implemented scope.
- Optional drawing throughout the portfolio, with separate in-memory ink for
  each destination/content page, transparent export, and undo.
- The published portfolio remains static: no accounts, analytics, runtime GitHub
  API, or uploaded ink. An optional localhost-only Copilot CLI bridge supplies
  real AI guide answers during local development; public AI hosting is deferred.
  The [agreed production direction](docs/frog-production.md) retains the static
  site and proposes a disabled-by-default YAML selection between hosted Copilot
  CLI and a direct model API, sharing the same guide and evidence safeguards.
  This is not implemented or authorized for public activation; credentials,
  spending controls, hosting, and GitHub-backed public entitlement remain open.
- An original animated frog opens a non-modal upper-screen guide. Answers use
  portfolio facts and pinned snapshots of the seven approved public READMEs,
  with validated source links. Questions and public excerpts are sent to
  GitHub Copilot only when a visitor explicitly submits a question locally.
- Keyboard and touch interaction, browser history, reduced motion, readable
  zoom, explicit sound controls, and native-touch coverage must remain usable.
- Home entry/reload has a button-free blue spinning-frog splash. After the
  smooth reveal, an original chiptune plays, pauses, and ends with a ribbit.
  Sound is enabled by default at the user's request; browser autoplay policy
  may defer playback until interaction. Mute silences all sound and cancels a
  pending opening cue. Reduced motion skips the visual delay.
- Extremely short windows may scroll the paired shell to keep controls
  reachable. Hardware segment-aware layouts avoid hinges when the browser
  exposes them. Browser emulation does not establish universal physical-device
  compatibility; the README records tested ranges and outstanding coverage.

## Brand Commitments

Preserve Joji's identity, existing blue/red/cream palette, factual content, and
original assets. The chosen reference is the original DSi Flipnote Studio's
application behavior, not its hardware enclosure. The experience uses frameless,
stacked dual displays in a combined portrait 1878:2670 canvas, with accessible
overflow where necessary. Nintendo logos, artwork, and recorded audio are not
shipping assets.

## Evidence on Hand

Project data and links are in `src/projects.ts`; original vector artwork is in
`src/art.ts`. Actual captures are `public/images/lineage.webp` and
`public/images/repoquest.jpg`. The README records their provenance.

The creator intro's Microsoft affiliation, cloud/AI background, and
human-centered design experience were checked against the publicly visible
[LinkedIn profile](https://www.linkedin.com/in/jorgeortizflores/) on September 16,
2026. Jorge confirmed the nickname Joji and that his gaming work is currently
backlog-completion tooling, not game development. Keep the tagline
“Always making. Always learning.”

Jorge also confirmed that he is a former Flipnote Studio animator.
He supplied four archived 256×192 Flipnote images for the About flipbook, dated
approximately 2014, 2015, 2015, and 2015 in that order. Preserve the originals and
their approximate dates; do not invent titles, exact dates, or additional frames.

## Product Principles

- Make the portfolio feel like entering an app, not scrolling a themed document.
- Keep project facts and actions understandable without knowing Flipnote.
- Preserve creative play without obstructing navigation or accessibility.
- Distinguish original interpretation from historical replication.
