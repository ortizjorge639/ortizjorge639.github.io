# Meeting Assistant: captions, transcripts and cited answers

Source type: curated-case-study. Historical basis: portfolio catalog, story, reading-depth notes and the previously approved in-repository guide snapshot reviewed on 2026-11-13.

## Evidence and publication boundary

This is an author-written sanitized historical narrative, not a public code inspection, source-code proof or a public application demo. The implementation is now private and is not independently inspectable here. Only previously published portfolio material and the old approved guide snapshot informed this account; no private repository or current changes were read. No customer content, real meeting transcript, deployment identifiers, repository links or implementation extracts are included.

Approval covers this separate narrative, not implementation redistribution. Source release would need its own rights, history/secrets and security review. Individual role unverified: the earlier material describes an adaptation of a Microsoft Teams sample, not Jorge's specific changes or sole authorship. Microsoft services and the original sample are dependencies, not original components claimed by this portfolio.

## The historical preview

The preview addressed a familiar need: ask what was said while a meeting is happening, or find a decision afterward without manually searching every caption. Previously published descriptions cover a .NET 10 Teams assistant using Microsoft Graph, Azure OpenAI and Microsoft Agent Framework, with speaker- and timestamp-aware answers.

An optional Azure Communication Services (ACS) browser participant captured finalized live captions. It was a capture participant, not a second question-answering agent. Actual chat mentions invoked the installed meeting bot. Captions did not establish that Teams transcription was enabled or complete.

## Context follows the meeting lifecycle

For an active session, the described answer path preferred that session's captured final captions, with a completed transcript as fallback. After the session ended, it preferred the completed Graph transcript for the matching occurrence, otherwise recent scoped ended-session captions. Tenant, conversation and meeting-occurrence boundaries mattered: an older session was not interchangeable with the current one.

Selected chunks supplied model context, and answers carried speaker/time references. Those references help a reader check the material; syntactic citation constraints do not verify every claim or guarantee complete retrieval. Bounded context can omit stored material.

## Optional summaries, not automatic acceptance

The historical summary pilot produced rolling updates from new finalized captions and a meeting-to-date view of supported topics, decisions, actions, risks and open questions. Summaries were disabled by default; the live-caption path was also optional and default-off. Silent summary windows made no summary model call. Earlier descriptions included versioned packaged instructions or optional private Blob instructions, without establishing their current configuration.

The published account reported acceptance of a scoped two-meeting pilot on November 10, 2026. A later summary omitted a corrected value. That known correction-retention limitation remains unresolved in this narrative; a small accepted pilot does not establish summary completeness, long-meeting, restart or multi-speaker accuracy.

## Hypothetical walkthrough, not measured output

Imagine a fictional, non-sensitive test meeting in which a participant assigns an action and later corrects its due date. No real participant, customer, transcript or observed answer is represented.

1. Ask in the original meeting chat what action was assigned, using an actual bot mention.
2. Inspect the cited speaker/time and confirm that the relevant finalized caption was captured; do not assume the correction reached the answer context.
3. After the matching completed transcript becomes available, compare its source material with the answer and any separately enabled summary. Check the corrected date explicitly rather than assuming it survived condensation.

These are illustrative review steps, not newly executed prompts, tested output or a claim that the known summary omission was fixed.

## Readiness and validation limits

Preview, not production-ready; non-sensitive test meetings only. Historical single-instance JSON storage lacked production meeting-data controls, including distributed consistency and a complete deletion/legal-hold workflow. Participant notice, consent, retention and privacy review remain prerequisites, not problems solved by a cited answer.

The described integration required tenant admin consent, a transcript access policy and appropriate Teams/Azure service configuration. No tenant settings, credentials, operational deployment instructions or live endpoints are published here.

Historical documentation and pilot reports are not fresh execution evidence. No fresh Teams, ACS, Graph, model, restart, security or production run was performed for this narrative. Current implementation behavior, availability, production approval and individual authorship are not established. This portfolio-hosted narrative is explanatory evidence only, not accessible implementation/source proof; packaging it does not deploy or validate the application or the separately hosted portfolio guide.
