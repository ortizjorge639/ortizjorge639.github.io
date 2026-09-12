# Joji's sketchbook

A responsive, original flipbook-inspired portfolio for Jorge's public projects in AI, technology, media, and gaming.

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

GitHub Actions builds `main` and publishes `dist` to GitHub Pages. This is a user site, so assets use root-relative URLs.

## Content and interactions

- `src/projects.ts` is the curated project catalog, ordered by repository update date at review time (September 12, 2026). Update descriptions against the public source READMEs before publishing. No private repositories, private saved items, or confidential project details are included.
- Project cards use original ink illustrations, clearly labeled as sketches. The Lineage and RepoQuest detail/feature images are actual public project captures. Sources: `web-context-graph/site/assets/product-knowledge-tree-desktop.webp` and `repoquest/docs/screenshot.jpg` in Jorge's public repositories.
- The featured flipbook supports buttons and arrow keys while focused; category filters and native dialogs work with keyboard navigation.
- The drawing page supports pen, translucent paintbrush, eraser, undo, keyboard-accessible star stamps, and PNG export. Drawings stay in memory in the current tab, are not uploaded, and reset on reload.
- Page sounds are optional and off by default. Motion respects the operating system's reduced-motion preference.
- Fonts are served by Google Fonts (DM Sans, IBM Plex Mono, Kalam), with system fallbacks. The application has no analytics, API keys, runtime GitHub API dependency, or backend.

## Design

Inspired by the tactile simplicity of handheld flipbook editors: warm paper, red/blue ink, dotted screens, binding loops, physical controls, and page-turn motion. This is an independent original design, not an official Nintendo product, and includes no Nintendo logos, sounds, or artwork.
