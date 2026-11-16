# Portfolio 2026–2027: front-door review

## Purpose

Give a first-time visitor a fast answer to who Jorge Ortiz Flores is, what kinds of problems interest him, and where to go next. The landing is a short orientation, not a third project catalog or an obligatory animation. The reading library and sketchbook remain distinct, directly addressable experiences.

## Reference: Jorge’s existing Super portfolio

Reviewed the public rendered page at https://jorgeortizflores.super.site/.

Keep:
- Jorge’s full name, a friendly greeting, and his own illustrated portrait.
- The connection between UX, AI, education, and creative work, without turning interests into unverified employment or impact claims.
- Human personality before a wall of tools; clear ways to explore and connect.

Change:
- Replace broad “Visionary / Innovation / Data-Driven Insights” positioning with concise, concrete problem-oriented language.
- Avoid duplicating an entire gallery before visitors reach the actual project library.
- Make the two destinations explicit: reading for context/architecture/evidence, sketchbook for playful interactive exploration.
- Do not copy stale availability or resume assertions without owner confirmation.
- Repair destinations rather than blindly copying links: the reference’s text contact links resolve to internal placeholder slugs; the “Stratos Landing Page” card points to an unrelated-looking happy-hour path. Direct checks of the LinkedIn placeholder and that card destination return HTTP 200 but contain “This page could not be found” (soft 404s). Preserve the correct external LinkedIn link, not its placeholder counterpart.
- Avoid autoplay, entry delays, mandatory chat, invented statistics, or an inflated authorship narrative.

## Observed operational gaps

- Main revision `cd0d48ad00b003c28123401fd015036235b5ef86` did not deploy. Actions run `43483905550` failed the desktop story-player aggregate catalog test at its 30-second test timeout. Existing assertions should be split per project, not removed or globally granted an unbounded timeout.
- The preceding PR run exposed WebKit overflow in the drawing panel at 240×320. Preserve the existing narrow viewport gate and correct the text layout rather than hiding overflow.
- The public guide status responds with configured availability, but a real portfolio-question probe returned HTTP 503. Status is not inference proof. The deployed service reports a source corpus that predates the expanded catalog; a frontend release alone does not refresh its independently deployed package.
- A source-visibility check found that one previously cited source is now private. Its existing public references cannot establish current inspectability. No new private-source material is incorporated; changing repository visibility is not authorized. The owner must decide whether to retain a separately reviewed historical narrative or omit that entry before release. The Batch’s newer commits affect generated weekly batches, not its explanatory README; copying saved-item content is neither necessary nor appropriate.

## Implementation acceptance

- Root landing has useful static HTML and working reading/sketchbook links without JavaScript.
- Legacy root hash URLs retain their project/scene destinations.
- Root does not eagerly load the sketchbook application or guide implementation. Optional chat loads on demand and uses the existing grounded guide, not a new ungoverned bot.
- Keyboard, reduced-motion, narrow viewport and error/offline paths remain usable.
- The guide clearly labels AI/public sources/privacy and provides a readable fallback when unavailable.
- Content, source pins, stories, and source snapshots are reviewed together; no private code, customer detail, or new sole-authorship claim is published.
- Required build/unit/guide/story/browser/responsive/native-touch checks must pass on the exact proposed head. A local resource-admission refusal is neither a pass nor evidence to weaken tests.
- Release requires independently verifying actual deployed root, reading routes and sketchbook, plus a bounded real guide answer with valid sources. No budget renewal, quota refill, new resources or broader permissions are implied by this UI work.

## Scope

The Super site is a design reference, not a migration of its private Notion workspace. No changes to that site, underlying applications, repository visibility, or personal data stores are part of this portfolio implementation.
