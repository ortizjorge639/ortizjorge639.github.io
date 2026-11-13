---
name: Joji's sketchbook
description: An original screen-based portfolio with DSi application grammar
colors:
  blue: "#3157bc"
  red: "#c53f2e"
  paper: "#fffdf6"
  background: "#f6f3e9"
  ink: "#292b30"
  muted: "#66645e"
  line: "#d8d5ca"
  launcher-rule: "#ffffff55"
typography:
  interface:
    fontFamily: "VT323, monospace"
    fontSize: "22px"
    fontWeight: 400
  body:
    fontFamily: "Trebuchet MS, system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.65
  wordmark:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(48px, 15cqw, 96px)"
    fontWeight: 900
    letterSpacing: "-0.04em"
  wordmark-subline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(30px, 10cqw, 66px)"
    fontWeight: 900
  menu-title:
    fontSize: "clamp(20px, 4.4cqw, 28px)"
  compact-title:
    fontSize: "27px"
  creator-title:
    fontSize: "32px"
  body-emphasis:
    fontSize: "16px"
  body-compact:
    fontSize: "15px"
  caption:
    fontSize: "10px"
  credit:
    fontSize: "12px"
  preview-caption:
    fontSize: "18px"
  compact-tab:
    fontSize: "19px"
  compact-action:
    fontSize: "21px"
  action:
    fontSize: "23px"
  guide-options:
    fontSize: "26px"
  guide-label:
    fontSize: "13px"
  guide-compact-control:
    fontSize: "17px"
  guide-privacy:
    fontSize: "11px"
  annotation:
    fontFamily: "Kalam, cursive"
rounded:
  control: "0px"
  ink-tray: "4px"
  ink-tool: "6px"
  ink-tool-group: "9px"
  ink-indicator: "10px"
  ink-switch: "20px"
components:
  primary-button:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "6px 14px"
---

# Design system: Joji's sketchbook

## Overview

An application you enter, not a website you scroll. The original DSi Flipnote
Studio supplies the screen-based navigation grammar; Jorge's palette, identity,
content, illustrations, and synthesized sounds remain original. The reference
is the software, never a plastic handheld enclosure.

## Colors

Blue carries the title screen, status bands, active selection, and navigation.
Red distinguishes the creator launcher and selected projects. Cream graph
paper provides drawing space; ordinary reading text uses dark ink. Source and
sketch labels remain visible rather than relying on color alone.

## Typography

VT323 gives controls and screen titles a compact pixel character. The existing
DM Sans wordmark is retained as an identity asset, not reused for interface
headings. Kalam marks the creator signature and occasional handwritten aside.
Descriptions use a system sans-serif for readable prose rather than small
monospaced text. Google Fonts have local fallbacks.

## Layout

The combined application canvas uses portrait width:height **1878:2670**, sized
to available width and height, capped at 660px wide. Two displays remain
vertically stacked on every device. Desktop uses equal panels; phones allocate
45% to preview and 55% to touch controls. This preserves the chosen combined
ratio without shrinking controls into a screenshot.

There is no bezel, external navigation header, hinge, hero section, or website
footer. The lower display contains a persistent status strip, a local content
viewport, and a persistent Back/Home/Ink strip. Long text scrolls within a
display; the document normally does not scroll. Short landscapes relax the outer
ratio. At 360 CSS pixels of viewport height or less, a scrollable 600px shell
preserves access to both displays instead of collapsing them. Below 300px of
width, launchers and project thumbnails use one column and tool groups wrap.
Browser zoom and enlarged content retain accessible overflow and controls.

The status strip groups the live date beside the clock, stacking them below
350px of canvas width. Guide, screen label, date, time, and Help share its
18px interface size (16px on compact canvases), rather than separate text scales.

All grid tracks and shell widths have explicit shrink constraints, including
WebKit's aspect-ratio sizing. Source chips wrap even when their title is an
unbroken string. Scrolling content accounts for sticky detail tabs.

Browsers exposing two physical viewport segments place the complete studio in
the first usable pane; controls never occupy the hinge. Other browsers use the
normal reflow layout. Opening the guide reserves a usable minimum for its upper
display and retains lower-screen browsing space. Keyboard fitting uses a focused
composer and near-unit visual-viewport scale, not pinch magnification.

## Elevation & Depth

Thin rules, saturated fields, and small inset bevels distinguish controls.
Depth is functional rather than decorative. The temporary ink tray uses a
small offset shadow; the app itself has no hardware-like outline or shadow.

## Shapes

Navigation and thumbnail controls are square. The ink tray uses small-radius
corners, with rounded forms limited to switches and tool grouping. Pixel pen
and checker-dither paint stay deliberately crisp.

## Components

- The menu has two primary launchers and a secondary row of GitHub/LinkedIn
  logo links. Each has an accessible name, tooltip, and at least a 44px target.
  Use only confirmed profile URLs; do not invent handles or add dead placeholders.
- Library thumbnails select the first fully readable frame of an upper-screen
  HTML flipbook, paused; Open enters the supporting details below.
  Four thumbnails form a finite page. Category and selection changes replace
  the current browser-history entry; page arrows do not wrap.
  Library pagination belongs in the persistent footer, while Open remains below
  the thumbnail grid. Footer groups wrap when needed rather than clipping Ink.
- Project details use Overview, What's inside, and Links, with all factual
  content preserved. The detail tabs stay visible during internal overflow.
- The six-scene story template uses problem/approach contrasts, actual project
  captures, explicit input/module/output connections, technology roles,
  feature sequences, and a final availability state. Display project-specific
  headlines, not authoring labels. Sources are accessible through a quiet
  player action, not badges or commentary attached to the visual.
- Image frames dedicate the canvas to an uncropped capture with one short
  caption underneath. They have no competing heading or paragraph; supporting
  copy remains available with Sources. Contrast/outcome artwork describes each
  project's subject: feed, branching conversation, grounded chat, workspace
  layers, canvas organization, completed-game collection, or generated guide.
  No shared scribble/checkmark decoration substitutes for those distinctions.
- Playback controls stay with the upper display, leaving the catalog and its
  footer pagination untouched. Manual frame navigation pauses timed playback;
  the final frame remains readable. Expand trades some lower-screen height
  for reading room without replacing the catalog. The player responds to its
  container rather than scaling down a fixed video canvas.
- Within-scene choreography uses original pen traces over faint lightbox guides,
  checker accents, short held poses, and temporary pencil underlines. Flow
  strokes follow the authored connections and cue receiving nodes. Individual
  marks take 180–460ms; a sequence settles within 2.5 seconds. Text stays still
  and readable; captures never simulate application activity.
  Hover replays the current frame once, without advancing the story or moving
  focus. Enter on the focused frame or tapping its non-interactive canvas gives
  deliberate replay. Frame changes and timed Play share these same recipes.
  Reduced motion uses static frames. Ink, Guide, Sources, the image viewer,
  hidden tabs and route changes stop motion without automatic resumption.
  Scene-local ink survives Open/Back; hover never redraws the content.
- Back restores the invoking collection or Help origin. Home is always explicit
  outside the menu. Focus follows navigation and returns to its invoking control.
- About's upper display is a five-page flipbook: portrait/tagline, then four
  supplied archived drawings. Subtle paper corners reveal it without a page
  count or pagination bar: lower-right advances, upper-left returns. An 18px
  fold sits within each 44px tap target and emphasizes on hover/focus. The bio
  below stays in place. Artwork keeps its original 4:3 ratio, uses crisp pixel rendering,
  and has an approximate date beneath it. A bounded 220ms directional page-fold
  effect is omitted for reduced motion. Keep the lower-left frog perch clear,
  and do not intercept arrows inside the guide or ink tools.
- Ink is destination-local; tools and sound are shared. The bottom strip reserves
  space for its controls, and the temporary tray is bounded by the viewport.
- The home opening is a button-free, full-viewport blue splash with a frog
  sprite rotating around its Y-axis and a compact “Opening studio” label.
  Critical inline styling and system typography render it before app scripts
  or external fonts. After styles settle, it holds for 1.1 seconds and fades
  over 320ms into the already styled app. It repeats on a home document reload,
  not on in-app navigation. No fabricated progress or percentage is shown.
- Only after the reveal completes, the default-on four-note square-wave jingle
  plays, followed by a roughly 260ms silence and two pulsed frog-croak syllables.
  Browser autoplay restrictions defer the entire cue until a permitted
  interaction without delaying the visual sequence. Shared mute cancels it.
  Reduced motion removes the spin, deliberate hold, and fade independently
  of the sound preference. The sequence is original, not Nintendo's recording.
- The original studio frog is cream/blue pixel art with glasses, splayed feet,
  and a red neckerchief. Its greeting moves through crouch, leap, landing, wave,
  and rest poses rather than looping a single translated icon. Idle blinks are
  sparse, silent, and disabled for reduced motion and hidden tabs.
- The pitched-up entry ribbit and greeting share the audio clock, including
  autoplay-delayed starts. Mouse/stylus gaze changes only the pupil group,
  bounded to two horizontal and one vertical sprite units inside the glasses;
  it survives pose changes and recalculates after moving the mascot.
- Hover/focus swaps instantly to one raised-hands grin frame, held while active,
  with a fill tinted with 18% of the existing blue. No bounce or frame sequence
  runs on hover, and the hit target does not move. It does not steal focus, play
  extra sound, or interrupt a greeting/answer state. Reduced motion retains
  this static frame change and instantaneous gaze feedback.
- The frog lives near the home flipbook mark, then on the upper display's
  bottom-left edge. Its 180ms panel reveal uses the same paper-and-pixel
  language. The persistent, non-modal conversation never disables lower-screen
  browsing; obscured preview content is inert while chat is open.
- Minimize preserves conversation and draft; Hide can be reversed with the
  status-strip Guide button. Clear conversation requires confirmation and
  never clears portfolio ink. A source chip is a real link, not an AI-invented
  URL. Error and unavailable states are explicit.
- Expand allocates more of the same paired canvas to chat. Keyboard-aware
  fitting preserves the composer and a lower navigation strip rather than
  silently opening a blocking full-screen modal. Body prose remains readable;
  the compact mobile welcome prioritizes useful starting questions.

## Do's and Don'ts

- Keep the work and its sources discoverable without understanding Flipnote.
- Preserve the blue/red identity and the frameless stacked display relationship.
- Use real links, named buttons, focus indicators, and current-selection states.
- Keep actual captures distinguishable from original sketches.
- Do not turn the interface back into vertically stacked website sections.
- Do not copy Nintendo branding, artwork, recordings, or hardware chrome.
- Do not hide evidence, disable zoom, or shrink text to preserve a rigid ratio.
