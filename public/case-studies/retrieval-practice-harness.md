# From notes to recall

Make a private review artifact, then decide what deserves another look.

> This separately authored narrative describes a private implementation. Readers cannot inspect its code here. Historical validation described in project documentation was not independently rerun for this case study. No application, model, playback, ingestion or deployment was exercised. Individual authorship has not been independently established; this is not a claim of sole authorship. Private source redistribution requires separate review and permission.

## An artifact is not the same thing as learning

A stored recap is easy to accumulate and easy not to revisit. This project creates a more concrete next action: open a private card artifact, try to retrieve or explain an idea, and mark the artifact reviewed. Its title describes the intended practice loop, not an observed improvement in recall.

## The local path

The inspected command-line entry point accepts a supplied Markdown recap. It normalizes the content, invokes question generation, renders an HTML card artifact and records the result in a local registry. The README describes a twelve-card format; the question generator uses patterns and anchored source text, with fallback prompts. Card count should not be confused with twelve independently validated questions or a reliable semantic understanding of the source.

A later command surfaces a small set of artifacts, defaulting to three. It uses a documented seventy-two-hour decay heuristic and registry state to prioritize the queue. Marking something reviewed resets its review clock; archiving retires it from the active list. Those are workflow records, not a test of mastery. A high urgency value is not a clinical or calibrated prediction that a person has forgotten the material.

## Integration and write boundaries

The local-file path is distinct from live meeting access. The inspected Microsoft Graph connector is a skeleton: missing credentials lead to manual fallback, and supplying a token still does not make its stubbed discovery and transcript methods perform live retrieval. An onboarding suggestion to use an external agent connection is not proof that this application has a functioning Graph integration.

Wiki compilation is an additive option rather than a prerequisite for local cards. When explicitly selected, the CLI can write wiki files. Documentation defines source-lineage, audience and publish-readiness requirements, including human review where applicable. These contracts must not be presented as proof that every ingestion or wiki-write path enforces every check. Likewise, a local card or a passing checklist is not permission to share its underlying source.

## Hypothetical illustration — not a bundled test

Imagine an invented recap about choosing a generic workshop layout. A private card could ask for the tradeoff behind that choice; a later queue could suggest revisiting the artifact. The learner could inspect the source before deciding what to retain. No recap, deck, generated answer, registry entry or learning result is supplied here. The example is explanatory fiction, not a fixture or a completed run.

## Evidence and limits

The README and narrow design contracts describe the local artifact and review workflow. Inspection of the CLI, question generator, surfacing module and connector establishes important implementation boundaries, but does not demonstrate end-to-end execution. Historical test counts and checked-off specification items were not independently verified. Earlier specification card counts differ from the current README, so this narrative does not use a count as an acceptance claim.

No meeting transcript, personal wiki or generated private bundle was inspected. No ingestion, rendering, review action, API connection or model run was performed. Cards, lineage and heuristics can make review inspectable; they do not establish factual completeness, safe publication or improved retention.

## Contribution boundary

Individual role unverified. The reviewed artifact connects local recap ingestion, source-referenced question templates, private card rendering and a review registry. Time-based urgency is a scheduling heuristic, not a measurement of a person’s memory or proof of educational effectiveness.
