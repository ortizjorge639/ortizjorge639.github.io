# Connections, with receipts

Test a useful connection before building a world around it.

## Overview

A chat-first design for suggesting one source-grounded connection at a time between explicitly permitted Markdown passages, with abstention and user judgment kept separate.

## Problem

A plausible connection is not necessarily supported by its sources or useful to the reader. A visual map should not conceal those separate questions.

## Documented implementation

No runnable implementation is established by the reviewed main. Its tracked file inventory contains a specification only. The specification is an implementation contract; command examples, tests, provider restrictions, and acceptance targets inside it are requirements, not proof of completed features.

## Intended workflow and scope

A chat/CLI-first engine would index explicitly permitted Markdown passages without modifying them, propose a complementary connection for a focus question, check exact spans and current source hashes, separately assess contextual support and usefulness, then return at most one suggestion or abstain. Derived state would remain outside source notes.

## Activation boundary

No indexing, model invocation, trial, or server was activated. The design calls for explicit per-file permission, fail-closed provider configuration, bounded calls, and synthetic offline tests; those controls are specified, not runtime-verified.

## Review evidence

Reviewed the specification and tracked file inventory only. No implementation, CI outcome, model run, human feedback, source notes, or private trial manifest was inspected. Documentation was reviewed on 2026-11-13. Historical descriptions and configured CI are not fresh execution or acceptance evidence.

## Hypothetical illustration

Hypothetical synthetic illustration: one invented note proposes shorter experiments; another invented note asks how to reduce evaluation effort. A tentative connection would cite both spans and explain when the analogy might fail. These are invented concepts, not private-note excerpts or observed model output.

## Limitations

- Only the specification on reviewed main was assessed; unmerged or local work is outside this review.
- No real notes, feedback, model output, or trial evidence was accessed.
- Quotation existence, contextual support, and human usefulness are separate; keeping a suggestion does not make it true.
- Model scores would be judgments, not calibrated probabilities; no embedding or semantic-search implementation is claimed.
- A city or spatial frontend is conditional future scope, not built or validated here.
- Longitudinal usefulness and comparison with chat/list remain study work; acceptance targets are not measured outcomes.

## What would establish more

Implement and independently verify the bounded chat-first slice using synthetic fixtures, then separately authorize any real-source trial. Evaluate usefulness over time before deciding whether a spatial representation adds value.

## Attribution

Individual contribution and authorship are unverified. This entry describes the documented artifact or proposal, not a claim of sole design, implementation, or measured impact.

## Disclosure

This is an independently authored, sanitized narrative about a private project. The implementation is not publicly inspectable. Documentation review is not fresh application, model, CI, or cloud verification. No source code or private data is released.
