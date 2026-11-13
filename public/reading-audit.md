# Minimalist project views: audit and release standard

Reviewed 2026-11-13. This is a portfolio communication audit, not a certification of the underlying applications.

## Verdict

The original reading mode was a useful, restrained directory of honest summaries. It was not yet a standalone technical library: the inspected live broker page contained about 288 main-content words, no architecture figure, no walkthrough and no explicit decision/trade-off discussion. Those are communication gaps, not proof that the project itself lacks architecture.

The revision preserves a calm, static reading surface while giving every included project an answer to six questions:

1. What problem is this trying to solve?
2. What is the central mechanism?
3. What connects to what, and what crosses a trust or data boundary?
4. Why this approach, and what does it cost or leave unresolved?
5. What would one bounded example look like?
6. What do the reviewed sources establish—and what remains unverified?

## Method and evidence discipline

The audit combined live desktop/phone DOM inspection, a fresh phone load, a no-JavaScript check, generator/CSS inspection, comparison with pinned public snapshots or separately authored sanitized narratives, and independent content/privacy review. An initial resized-phone navigation observation was narrowed after fresh-load verification: normal scripted mobile loading already worked; no-script and desktop-to-phone resizing were the gaps.

The baseline first-screen screenshot did not show an entire long article. Absence below the screenshot is not treated as absence from the page. Structural counts came from DOM/source inspection, not visual guesswork.

No comprehension experiment or visitor conversion study was conducted. The judgments below are editorial, source-bounded assessments, not numerical usability scores. Application benchmarks, medical outcomes, model accuracy and production acceptance were not rerun by this portfolio task.

## Findings and implemented response

| Finding | Consequence | Response |
|---|---|---|
| Architecture compressed into a paragraph and stack list | Readers could name technologies without explaining the mechanism | Per-project component maps, directed connections, component responsibilities and an explicit boundary |
| No explained design trade-offs | Technical judgment was difficult to assess | At least two explained choices per entry; surface-only entries label these as framing/review scope rather than invented internal rationale |
| No worked reading path | A newcomer had to infer inputs and outcomes | Explicitly hypothetical, unexecuted walkthrough with input, ordered steps, intended artifact and caveat |
| Status mixed documented mechanism and runtime proof | A coherent explanation could be mistaken for accepted behavior | Side-by-side reviewed evidence and not-established claims |
| A growing directory displaced content without scripts | A no-script phone reader had to pass every project first | Native collapsed project directory, bounded scrolling and resize-aware scripted enhancement |
| Long articles lost their section navigation on compact screens | Architecture/evidence became harder to find | Native in-flow “On this page” control on compact widths |
| Richer content could silently regress to thin entries | New cards might bypass the standard | Exact catalog/depth coverage, graph-endpoint validation, escaping and missing-rationale regression tests |

## Independent-review corrections

The independent pass was not a rubber stamp. It identified and corrected:

- **Meeting source precedence:** current-session captions first while active; after end, that occurrence's completed transcript first, with scoped ended-caption fallback. Not a global transcript-first rule.
- **The Batch client capabilities:** the phone example now only marks seen/dismissed and manually hands off queued updates; desktop action-authoring is not invented in the phone UI.
- **Lineage's tool boundary:** filtered prompt lineage is not a filesystem sandbox. Broad local agent-tool access is explicit and the backend remains trusted-localhost only.
- **Broker response topology:** Graph returns through APIM, then to the agent; the diagram no longer compresses away that security-relevant hop.
- **Drawing-prototype provenance:** an unverified clean-room process claim was removed rather than hidden behind a general authorship disclaimer.
- **Publication authority:** one prepared candidate remains private pending separate organizational publication clearance. A disclaimer or successful sanitization is not that clearance.

## Project-by-project communication assessment

“Substantive mechanism” means the explanation can teach an evidenced implementation shape. It does not mean the underlying application was freshly accepted. “Surface” and “specification” are intentionally weaker categories.

| Project | Explanation class | Architectural point the reader should leave with | Remaining limit |
|---|---|---|---|
| The Batch | Substantive mechanism | Portable state, scheduled build and manual asynchronous write-back are distinct | No live two-way sync or account execution in this review |
| Lineage | Substantive mechanism | Root-to-fork context, authoritative metadata and durable files have different responsibilities | Prompt filtering is not local tool isolation |
| After the meeting | Substantive mechanism | Source selection depends on session lifecycle; answers and opt-in summaries differ | Corrected-value omission prevents broad completeness claims |
| Modding, with guardrails | Substantive workflow | Authoring representations, generated code and runtime triggers require separate verification | Compilation is not runtime correctness or universal editor support |
| Grand Reset | Substantive mechanism | Multiple views share one browser-origin snapshot; agent proposals require a human choice | No cloud synchronization or server event log |
| Just Play | Public product flow | A bounded shortlist leads to a settled session companion | Named stack and landing concept are not authenticated acceptance |
| RepoQuest | Substantive mechanism | Parser → shared data → theme → portable artifact | Generating a guide does not install its subject repository |
| FirstMind | Public surface only | Impermanence and retained essentials are the visible proposition | No inferred storage architecture or clinical efficacy |
| Flowlog | Public surface only | Decks and cards describe a backlog-decision concept | Distinct application entry points are not proven Steam import |
| A token stays with the broker | Substantive mechanism | Caller identity and downstream credential custody are separate | Per-user isolation remains unproven |
| OneShotTober | Static creative format | A small prompt constraint and static publication are sufficient for the visible experience | No claimed hosted AI backend, participation metric or 31 completed results |
| Inventory Data Assistant Template | Sanitized technical narrative | Expected table roles, inherited domain tools and optional offline route are distinct | No source release, fresh customer SQL/model or hosted Teams acceptance |
| Evidence-preserving document intelligence | Sanitized technical narrative | Page routing, document-level Layout, original-span joins and human ambiguity review | Cloud boundary, mock evidence, accuracy and licensing remain explicit |
| Diagnosing custom-model authentication | Sanitized diagnostic narrative | Isolated dummy-only observation precedes gateway validation and separate backend identity | Historical client behavior is not universal current compatibility |
| Drawing a conversation | Sanitized technical narrative | Original drawing, recorded reply intention and first human reading stay separate | No certified shared meaning, native messaging or accuracy/speed result |
| A soundtrack for the session | Sanitized technical narrative | Context selection, deterministic music policy and external playback have different roles | No live playback or productivity benefit proven here |
| Knowledge that earns its place | Sanitized technical narrative | Recurrence evidence gates proposals; human promotion and raw capture differ | Recurrence is not truth and citations do not guarantee entailment |
| From notes to recall | Sanitized technical narrative | Local recap-derived practice artifacts are distinct from live meeting access | No proven learning gain; downstream integration limits remain visible |
| Prove the migration before the move | Sanitized technical narrative | Content/invariant checks and application comparisons test different forms of parity | Tiny synthetic fixtures are not cutover, CDC, performance or enterprise proof |
| Connections, with receipts | Private specification, sanitized explanation | Proposed source support, permission checks, usefulness and abstention have different jobs | No runnable implementation or measured longitudinal value established |

## Visual standard

Desktop diagrams are conceptual component/relationship maps, not infrastructure screenshots or deployed traces. Numbered directed connections have a full text equivalent. Component responsibilities and boundary notes remain readable without SVG or JavaScript; narrow screens use single-column component cards and labeled relationships rather than shrinking diagram text until it is illegible. Evidence is not communicated by color alone. Print and reduced-motion behavior remain deliberate.

A landing-only project is not padded with an invented database/model architecture. A specification is shown as a specification. This is how minimalism stays informative without becoming promotional fiction.

## Release verification

The required release gate is the exact-head production build, guide/source integrity and hosted-package tests, story tests, reading-unit tests, existing browser/responsive/native-touch checks, plus new all-route architecture, no-script-phone, resize and accessibility checks. The VM's memory guard refused local test admission; that refusal is not a test failure or a pass. Remote CI and post-deployment checks supply execution evidence separately.

Source implementations remain private. Publishing these narratives does not publish source code, change repository visibility, call their models, grant the guide private access or redeploy the separately hosted guide backend.
