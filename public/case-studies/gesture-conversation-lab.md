# Drawing a conversation

Preserve the drawing. Keep its meaning open to question.

> This separately authored narrative describes a private implementation. Readers cannot inspect its code here. Historical validation described in project documentation was not independently rerun for this case study. No application, model, playback, ingestion or deployment was exercised. Individual authorship has not been independently established; this is not a claim of sole authorship. Private source redistribution requires separate review and permission.

## Why preserve uncertainty?

The interesting design problem is not simply turning a sketch into text. It is keeping the original marks intact while allowing both parties to be wrong about them. The interface therefore treats an outgoing drawing and a separately authored incoming drawing as different messages. Written interpretation is optional supporting material rather than a mandatory translation screen.

## What the reviewed design implements

The browser records delivered pointer samples and their relative timing. Drafts remain local until an affirmative send decision. Saving precedes model work: an unsuccessful save must not silently launch inference. The stored original can be reloaded and replayed; later corrections are additions, not replacements of the source.

The experimental response has two stages. First, a model chooses an intention and the server records it. A later model call draws toward that recorded intention. The person makes and saves a first reading of the reply before the interface reveals the intention for comparison. This distinguishes what the reply was meant to communicate from what its reader actually saw. It does not automatically decide whether the exchange succeeded. Supporting diagnostics produced during drawing are not an independent blind interpretation of the original.

## Starting state and recovery

Drawing alone does not upload content. Guided sending asks for consent to storage and model processing. Reloading saved evidence or checking for a reply does not itself request new inference; missing or failed work needs an explicit action. The displayed thread lives in page memory, while server evidence has its own archive. Refreshing the page is not deletion of archived drawings.

Original capture timing and model-authored replay timing are different: the reply animation is synthetic. The server can read stored content, so this is not end-to-end encryption or secrecy from the authorized owner. Phone pairing is documented as an access mechanism, not a guarantee of current hardware acceptance.

## Hypothetical illustration — not a bundled test

Imagine a person drawing an unfamiliar spiral. A reply arrives, and the person writes down what they think it means before seeing the earlier reply intention. They might agree, disagree or remain unsure. No spiral fixture, model response, correctness judgment or measured outcome is supplied here; this is an invented explanation of the comparison sequence.

## Evidence and limits

The reviewed documentation describes isolated persistence, capture and browser regressions. Those are historical scoped claims, not fresh execution. Source inspection supports the workflow description, not a recognition score, a latency promise or a validated private language. Synthetic browser work is not physical-phone acceptance. No symbols trigger actions.

This prototype does not implement Apple Digital Touch compatibility or a native messaging integration. Shared understanding remains a human evaluation question. The portfolio value is the separation of evidence, consent, interpretation and correction—not a claim to have solved visual language.

## Contribution boundary

Individual role unverified. The reviewed prototype connects immutable drawing evidence, a drawings-first conversation UI, bounded two-stage inference and a human comparison workflow. Existing browser, database and model capabilities are dependencies, not components claimed as newly invented.
