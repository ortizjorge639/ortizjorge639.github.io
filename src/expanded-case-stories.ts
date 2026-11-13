import type { ProjectStory } from './story-types';

// Separately authored sanitized narratives, never private-source imports.
export const expandedCaseStories: Record<string, ProjectStory> = {
  "gesture-conversation-lab": {
    "projectId": "gesture-conversation-lab",
    "sources": [
      {
        "id": "gesture-conversation-lab-narrative",
        "title": "Sanitized narrative (not public code or app proof)",
        "url": "https://ortizjorge639.github.io/case-studies/gesture-conversation-lab.md"
      }
    ],
    "scenes": [
      {
        "id": "gesture-conversation-lab-need",
        "beat": "need",
        "duration": 8,
        "headline": "A reply can look right and still mean something else",
        "body": "Drawing shape and timing can survive an exchange while meaning does not. A persuasive reply is not proof of shared understanding.",
        "visual": {
          "type": "contrast",
          "before": "A convincing visual reply",
          "after": "An interpretation that can be questioned"
        },
        "sources": [
          "gesture-conversation-lab-narrative"
        ]
      },
      {
        "id": "gesture-conversation-lab-approach",
        "beat": "approach",
        "duration": 8,
        "headline": "Keep the original before asking for a reply",
        "body": "Draw locally, consent explicitly, then save the original before inference. Later corrections add context without rewriting the captured drawing.",
        "visual": {
          "type": "steps",
          "items": [
            {
              "title": "Draw",
              "detail": "Capture locally before any send decision."
            },
            {
              "title": "Consent and save",
              "detail": "Storage succeeds before model work begins."
            },
            {
              "title": "Correct",
              "detail": "Append context while retaining the original."
            }
          ]
        },
        "sources": [
          "gesture-conversation-lab-narrative"
        ]
      },
      {
        "id": "gesture-conversation-lab-flow",
        "beat": "flow",
        "duration": 9,
        "headline": "Separate intention, drawing and reading",
        "body": "A model chooses an intention; the server records it before another stage draws. The person saves a first reading before the intention is revealed.",
        "visual": {
          "type": "flow",
          "nodes": [
            {
              "id": "source",
              "label": "Saved drawing",
              "detail": "Original geometry and timing"
            },
            {
              "id": "intent",
              "label": "Recorded intent",
              "detail": "Chosen before drawing"
            },
            {
              "id": "reply",
              "label": "Reply drawing",
              "detail": "Separately authored response"
            },
            {
              "id": "compare",
              "label": "First reading",
              "detail": "Save, reveal, compare manually"
            }
          ],
          "edges": [
            {
              "from": "source",
              "to": "intent"
            },
            {
              "from": "intent",
              "to": "reply"
            },
            {
              "from": "reply",
              "to": "compare"
            }
          ]
        },
        "sources": [
          "gesture-conversation-lab-narrative"
        ]
      },
      {
        "id": "gesture-conversation-lab-build",
        "beat": "build",
        "duration": 8,
        "headline": "The archive and the conversation are not the same",
        "body": "A browser thread sits above an immutable server archive. Reloading evidence does not start inference, and a page refresh is not archive deletion.",
        "visual": {
          "type": "roles",
          "items": [
            {
              "name": "Browser",
              "role": "Draft and current conversation display"
            },
            {
              "name": "Archive",
              "role": "Exact source and append-only context"
            },
            {
              "name": "Model",
              "role": "Bounded reply stages after consent"
            }
          ]
        },
        "sources": [
          "gesture-conversation-lab-narrative"
        ]
      },
      {
        "id": "gesture-conversation-lab-details",
        "beat": "details",
        "duration": 9,
        "headline": "Imagine an unfamiliar spiral",
        "body": "Hypothetical, not a bundled test: a person reads a reply to an invented spiral, saves that reading, then compares it with the recorded intention.",
        "visual": {
          "type": "steps",
          "items": [
            {
              "title": "Invented drawing",
              "detail": "No real drawing or fixture is reproduced."
            },
            {
              "title": "First reading",
              "detail": "Record an interpretation without seeing the intention."
            },
            {
              "title": "Manual comparison",
              "detail": "Agreement is not assumed or scored."
            }
          ]
        },
        "sources": [
          "gesture-conversation-lab-narrative"
        ]
      },
      {
        "id": "gesture-conversation-lab-use",
        "beat": "use",
        "duration": 8,
        "headline": "An experiment, not certified understanding",
        "body": "Private code; historical checks were not rerun. Reply timing is synthetic. No Apple compatibility, shared-meaning certification or speed claim is made.",
        "visual": {
          "type": "outcome",
          "result": "A reviewable communication experiment, not a public app or a validated visual language."
        },
        "sources": [
          "gesture-conversation-lab-narrative"
        ]
      }
    ]
  },
  "coding-session-dj": {
    "projectId": "coding-session-dj",
    "sources": [
      {
        "id": "coding-session-dj-narrative",
        "title": "Sanitized narrative (not public code or app proof)",
        "url": "https://ortizjorge639.github.io/case-studies/coding-session-dj.md"
      }
    ],
    "scenes": [
      {
        "id": "coding-session-dj-need",
        "beat": "need",
        "duration": 8,
        "headline": "The work changes; the music should not thrash",
        "body": "A coding session can move from exploration to recovery. Useful adaptation needs restraint, and a received control is not proof that music changed.",
        "visual": {
          "type": "contrast",
          "before": "Switch on every signal",
          "after": "Wait for policy and observed playback"
        },
        "sources": [
          "coding-session-dj-narrative"
        ]
      },
      {
        "id": "coding-session-dj-approach",
        "beat": "approach",
        "duration": 8,
        "headline": "Send a scene, not a coding transcript",
        "body": "Bounded labels, tags and numeric dimensions feed a local policy. Source code, prompts, paths and private reasoning are outside the accepted scene shape.",
        "visual": {
          "type": "steps",
          "items": [
            {
              "title": "Describe",
              "detail": "Send a bounded, sanitized scene."
            },
            {
              "title": "Filter",
              "detail": "Apply user-owned music constraints."
            },
            {
              "title": "Choose",
              "detail": "Score curated crates deterministically."
            }
          ]
        },
        "sources": [
          "coding-session-dj-narrative"
        ]
      },
      {
        "id": "coding-session-dj-flow",
        "beat": "flow",
        "duration": 9,
        "headline": "Keep policy and playback as separate steps",
        "body": "Scenes pass through preferences, hold times and cooldowns. Spotify is primary; fresh observation checks playback after a mutation.",
        "visual": {
          "type": "flow",
          "nodes": [
            {
              "id": "scene",
              "label": "Scene",
              "detail": "Bounded session signal"
            },
            {
              "id": "policy",
              "label": "Policy",
              "detail": "Curated crates and constraints"
            },
            {
              "id": "spotify",
              "label": "Spotify",
              "detail": "Active Connect device"
            },
            {
              "id": "observe",
              "label": "Observe",
              "detail": "Report delivery and actual state separately"
            }
          ],
          "edges": [
            {
              "from": "scene",
              "to": "policy"
            },
            {
              "from": "policy",
              "to": "spotify"
            },
            {
              "from": "spotify",
              "to": "observe"
            }
          ]
        },
        "sources": [
          "coding-session-dj-narrative"
        ]
      },
      {
        "id": "coding-session-dj-build",
        "beat": "build",
        "duration": 8,
        "headline": "A compact control surface with honest states",
        "body": "The local player separates queue receipt, acknowledgement and failure. Adaptation starts enabled; Hold stops adaptation, not the music.",
        "visual": {
          "type": "roles",
          "items": [
            {
              "name": "Agent",
              "role": "Supplies sanitized scene dimensions"
            },
            {
              "name": "Local policy",
              "role": "Controls selection and timing"
            },
            {
              "name": "Spotify",
              "role": "Provides playback; requires authorization and Premium"
            }
          ]
        },
        "sources": [
          "coding-session-dj-narrative"
        ]
      },
      {
        "id": "coding-session-dj-details",
        "beat": "details",
        "duration": 9,
        "headline": "Imagine a recovery scene at a track boundary",
        "body": "Hypothetical, not a bundled test: a recovery scene waits for a boundary. A later observation might confirm a change or report a failure.",
        "visual": {
          "type": "steps",
          "items": [
            {
              "title": "Invented scene",
              "detail": "No real coding or listening data."
            },
            {
              "title": "Wait",
              "detail": "Policy can defer an interruption."
            },
            {
              "title": "Observe",
              "detail": "Do not assume the requested track is playing."
            }
          ]
        },
        "sources": [
          "coding-session-dj-narrative"
        ]
      },
      {
        "id": "coding-session-dj-use",
        "beat": "use",
        "duration": 8,
        "headline": "Narrative, not a live playback demonstration",
        "body": "Code stays private. Historical fictional-response tests were not rerun. No playback, productivity gain, audio mixing or physical-phone result is claimed.",
        "visual": {
          "type": "outcome",
          "result": "A local soundtrack-control design, not a hosted player or measured benefit."
        },
        "sources": [
          "coding-session-dj-narrative"
        ]
      }
    ]
  },
  "recurrence-gated-knowledge": {
    "projectId": "recurrence-gated-knowledge",
    "sources": [
      {
        "id": "recurrence-gated-knowledge-narrative",
        "title": "Sanitized narrative (not public code or app proof)",
        "url": "https://ortizjorge639.github.io/case-studies/recurrence-gated-knowledge.md"
      }
    ],
    "scenes": [
      {
        "id": "recurrence-gated-knowledge-need",
        "beat": "need",
        "duration": 8,
        "headline": "A passing thought is not yet a lasting conclusion",
        "body": "Capturing a note should not silently turn it into maintained knowledge. Raw material can stay searchable without being promoted.",
        "visual": {
          "type": "contrast",
          "before": "Capture once, treat as established",
          "after": "Keep raw notes separate from reviewed knowledge"
        },
        "sources": [
          "recurrence-gated-knowledge-narrative"
        ]
      },
      {
        "id": "recurrence-gated-knowledge-approach",
        "beat": "approach",
        "duration": 8,
        "headline": "Let recurrence qualify a candidate, not approve it",
        "body": "At least two independent source units, three or more calendar days apart, establish eligibility. Duplicate records of one event do not add support.",
        "visual": {
          "type": "steps",
          "items": [
            {
              "title": "Capture",
              "detail": "Keep raw material without capture-time review."
            },
            {
              "title": "Check recurrence",
              "detail": "Count independent evidence, not duplicate exports."
            },
            {
              "title": "Assess",
              "detail": "Eligibility is not truth or approval."
            }
          ]
        },
        "sources": [
          "recurrence-gated-knowledge-narrative"
        ]
      },
      {
        "id": "recurrence-gated-knowledge-flow",
        "beat": "flow",
        "duration": 9,
        "headline": "Put a human decision between evidence and knowledge",
        "body": "An agent prepares a cited proposal against existing knowledge and past decisions. A person accepts, corrects, rejects or defers it with a reason.",
        "visual": {
          "type": "flow",
          "nodes": [
            {
              "id": "raw",
              "label": "Raw notes",
              "detail": "Preserved evidence"
            },
            {
              "id": "eligible",
              "label": "Candidate",
              "detail": "Recurrence and assessment"
            },
            {
              "id": "review",
              "label": "Human decision",
              "detail": "Explicit scope and reason"
            },
            {
              "id": "knowledge",
              "label": "Maintained pages",
              "detail": "Promotion is a separate step"
            }
          ],
          "edges": [
            {
              "from": "raw",
              "to": "eligible"
            },
            {
              "from": "eligible",
              "to": "review"
            },
            {
              "from": "review",
              "to": "knowledge"
            }
          ]
        },
        "sources": [
          "recurrence-gated-knowledge-narrative"
        ]
      },
      {
        "id": "recurrence-gated-knowledge-build",
        "beat": "build",
        "duration": 8,
        "headline": "Return evidence under a hard context budget",
        "body": "A read-only packet builder retrieves accepted knowledge with exact support. It validates source records and budgets complete results; it calls no model.",
        "visual": {
          "type": "roles",
          "items": [
            {
              "name": "Files",
              "role": "Portable notes, pages and links"
            },
            {
              "name": "Packet builder",
              "role": "Deterministic bounded evidence retrieval"
            },
            {
              "name": "Review helper",
              "role": "Records explicit decisions; does not promote pages"
            }
          ]
        },
        "sources": [
          "recurrence-gated-knowledge-narrative"
        ]
      },
      {
        "id": "recurrence-gated-knowledge-details",
        "beat": "details",
        "duration": 9,
        "headline": "Imagine a recurring workshop-checklist idea",
        "body": "Hypothetical, not a bundled test: an idea recurs independently after several days. It can reach review, yet a person may still decide against a page.",
        "visual": {
          "type": "steps",
          "items": [
            {
              "title": "Invented note",
              "detail": "Not a real notebook excerpt."
            },
            {
              "title": "Independent recurrence",
              "detail": "Duplicate exports do not count twice."
            },
            {
              "title": "Review",
              "detail": "Approval is neither assumed nor demonstrated."
            }
          ]
        },
        "sources": [
          "recurrence-gated-knowledge-narrative"
        ]
      },
      {
        "id": "recurrence-gated-knowledge-use",
        "beat": "use",
        "duration": 8,
        "headline": "Evidence discipline, not cognitive improvement",
        "body": "Private code; historical checks were not rerun. No real vault was inspected. Recurrence and citations do not establish truth or improved learning.",
        "visual": {
          "type": "outcome",
          "result": "A human-governed knowledge workflow, not autonomous promotion or proven cognitive benefit."
        },
        "sources": [
          "recurrence-gated-knowledge-narrative"
        ]
      }
    ]
  },
  "retrieval-practice-harness": {
    "projectId": "retrieval-practice-harness",
    "sources": [
      {
        "id": "retrieval-practice-harness-narrative",
        "title": "Sanitized narrative (not public code or app proof)",
        "url": "https://ortizjorge639.github.io/case-studies/retrieval-practice-harness.md"
      }
    ],
    "scenes": [
      {
        "id": "retrieval-practice-harness-need",
        "beat": "need",
        "duration": 8,
        "headline": "A saved recap still needs a reason to return",
        "body": "A file can preserve information without prompting retrieval. The design adds private review artifacts and a small queue, not a learning guarantee.",
        "visual": {
          "type": "contrast",
          "before": "A growing archive of recaps",
          "after": "A concrete private artifact to revisit"
        },
        "sources": [
          "retrieval-practice-harness-narrative"
        ]
      },
      {
        "id": "retrieval-practice-harness-approach",
        "beat": "approach",
        "duration": 8,
        "headline": "Start with a supplied local file",
        "body": "The CLI normalizes a Markdown recap, creates source-referenced question drafts, renders private cards and registers the artifact for later review.",
        "visual": {
          "type": "steps",
          "items": [
            {
              "title": "Supply",
              "detail": "An authorized local recap file."
            },
            {
              "title": "Build",
              "detail": "Question drafts and private HTML cards."
            },
            {
              "title": "Register",
              "detail": "Track the artifact for future review."
            }
          ]
        },
        "sources": [
          "retrieval-practice-harness-narrative"
        ]
      },
      {
        "id": "retrieval-practice-harness-flow",
        "beat": "flow",
        "duration": 9,
        "headline": "Schedule review without claiming to measure memory",
        "body": "Elapsed time and a decay heuristic rank artifacts. The default queue is small; marking reviewed resets a clock, not a measured mastery score.",
        "visual": {
          "type": "flow",
          "nodes": [
            {
              "id": "recap",
              "label": "Local recap",
              "detail": "Supplied input"
            },
            {
              "id": "cards",
              "label": "Private cards",
              "detail": "Draft questions and source references"
            },
            {
              "id": "registry",
              "label": "Registry",
              "detail": "Review and archive records"
            },
            {
              "id": "queue",
              "label": "Review queue",
              "detail": "Time-based prioritization"
            }
          ],
          "edges": [
            {
              "from": "recap",
              "to": "cards"
            },
            {
              "from": "cards",
              "to": "registry"
            },
            {
              "from": "registry",
              "to": "queue"
            }
          ]
        },
        "sources": [
          "retrieval-practice-harness-narrative"
        ]
      },
      {
        "id": "retrieval-practice-harness-build",
        "beat": "build",
        "duration": 8,
        "headline": "Do not turn a connector stub into an integration claim",
        "body": "The Graph connector remains a stub, even with a token. Wiki compilation is optional and writes files; documented review gates need separate verification.",
        "visual": {
          "type": "roles",
          "items": [
            {
              "name": "Local CLI",
              "role": "Creates and tracks artifacts"
            },
            {
              "name": "Graph connector",
              "role": "Skeleton, not live transcript retrieval"
            },
            {
              "name": "Wiki option",
              "role": "Explicit additional file-writing path"
            }
          ]
        },
        "sources": [
          "retrieval-practice-harness-narrative"
        ]
      },
      {
        "id": "retrieval-practice-harness-details",
        "beat": "details",
        "duration": 9,
        "headline": "Imagine a workshop-layout recap",
        "body": "Hypothetical, not a bundled test: a private card asks about an invented layout tradeoff. A later queue suggests review; no learning result is supplied.",
        "visual": {
          "type": "steps",
          "items": [
            {
              "title": "Invented recap",
              "detail": "No meeting material or fixture is reproduced."
            },
            {
              "title": "Private question",
              "detail": "An illustration, not generated output."
            },
            {
              "title": "Return later",
              "detail": "No measured recall benefit is implied."
            }
          ]
        },
        "sources": [
          "retrieval-practice-harness-narrative"
        ]
      },
      {
        "id": "retrieval-practice-harness-use",
        "beat": "use",
        "duration": 8,
        "headline": "A review workflow, not proven retention",
        "body": "Code stays private. Historical checks were not rerun. No meeting data or generated output was read; no live Graph, efficacy or publication claim is made.",
        "visual": {
          "type": "outcome",
          "result": "An inspectable local review workflow, not clinical evidence or a production meeting integration."
        },
        "sources": [
          "retrieval-practice-harness-narrative"
        ]
      }
    ]
  },
  "synthetic-migration-pilot": {
    "projectId": "synthetic-migration-pilot",
    "sources": [
      {
        "id": "sanitized-narrative",
        "title": "Prove the migration before the move — sanitized narrative",
        "url": "https://ortizjorge639.github.io/case-studies/synthetic-migration-pilot.md"
      }
    ],
    "scenes": [
      {
        "id": "counts-are-not-behavior",
        "beat": "need",
        "duration": 8,
        "headline": "A copied table is not the whole migration",
        "body": "A small synthetic pilot asks whether source and target applications agree, not just whether rows arrived.",
        "visual": {
          "type": "contrast",
          "before": "Rows arrived",
          "after": "Content and behavior still need comparison"
        },
        "sources": [
          "sanitized-narrative"
        ]
      },
      {
        "id": "rehearse-with-generated-data",
        "beat": "approach",
        "duration": 8,
        "headline": "Start with a deliberately small rehearsal",
        "body": "Generated relational fixtures keep the exercise narrow. This is a SQLite-to-DuckDB pilot, not an enterprise migration.",
        "visual": {
          "type": "outcome",
          "result": "A bounded synthetic rehearsal, with no production migration claim."
        },
        "sources": [
          "sanitized-narrative"
        ]
      },
      {
        "id": "transfer-then-compare",
        "beat": "flow",
        "duration": 9,
        "headline": "Generate, transfer, compare",
        "body": "The documented runner transfers synthetic data transactionally, then compares canonical content, invariants, and application cases.",
        "visual": {
          "type": "flow",
          "nodes": [
            {
              "id": "fixtures",
              "label": "Synthetic fixtures",
              "detail": "Small generated relational tables"
            },
            {
              "id": "transfer",
              "label": "Transfer",
              "detail": "Documented transactional database move"
            },
            {
              "id": "checks",
              "label": "Compare",
              "detail": "Content, invariants, application behavior"
            },
            {
              "id": "report",
              "label": "Reconciliation",
              "detail": "Generated comparison output"
            }
          ],
          "edges": [
            {
              "from": "fixtures",
              "to": "transfer"
            },
            {
              "from": "transfer",
              "to": "checks"
            },
            {
              "from": "checks",
              "to": "report"
            }
          ]
        },
        "sources": [
          "sanitized-narrative"
        ]
      },
      {
        "id": "two-engines-one-rehearsal",
        "beat": "build",
        "duration": 8,
        "headline": "Two engines and explicit checks",
        "body": "Python coordinates the documented pilot. SQLite is the source; DuckDB is the target. No model or application was run for this review.",
        "visual": {
          "type": "roles",
          "items": [
            {
              "name": "Python",
              "role": "Coordinate transfer and comparisons"
            },
            {
              "name": "SQLite",
              "role": "Synthetic source database"
            },
            {
              "name": "DuckDB",
              "role": "Synthetic target database"
            }
          ]
        },
        "sources": [
          "sanitized-narrative"
        ]
      },
      {
        "id": "configured-is-not-passing",
        "beat": "details",
        "duration": 9,
        "headline": "Configured checks are not a fresh pass",
        "body": "The workflow defines Linux and Windows checks. This review read that definition; it did not run CI or inspect generated evidence.",
        "visual": {
          "type": "steps",
          "items": [
            {
              "title": "Inspect the contract",
              "detail": "Separate content equality from application behavior."
            },
            {
              "title": "Read the workflow",
              "detail": "Observe configured checks without claiming a passing run."
            },
            {
              "title": "Keep scope explicit",
              "detail": "No stored procedures, CDC, performance, or cutover proof."
            }
          ]
        },
        "sources": [
          "sanitized-narrative"
        ]
      },
      {
        "id": "review-before-any-bigger-move",
        "beat": "use",
        "duration": 8,
        "headline": "A rehearsal, not release authority",
        "body": "Private implementation; sanitized narrative only. A tiny pilot cannot authorize production cutover or establish enterprise readiness.",
        "visual": {
          "type": "outcome",
          "result": "Documentation-only case study. Broader migration and release decisions need separate evidence and approval."
        },
        "sources": [
          "sanitized-narrative"
        ]
      }
    ]
  },
  "source-grounded-connections": {
    "projectId": "source-grounded-connections",
    "sources": [
      {
        "id": "sanitized-narrative",
        "title": "Connections, with receipts — sanitized narrative",
        "url": "https://ortizjorge639.github.io/case-studies/source-grounded-connections.md"
      }
    ],
    "scenes": [
      {
        "id": "plausible-is-not-supported",
        "beat": "need",
        "duration": 8,
        "headline": "A connection needs more than plausibility",
        "body": "A useful-looking link can misquote a source or add no value. The design separates citation, contextual support, and human usefulness.",
        "visual": {
          "type": "contrast",
          "before": "A plausible association",
          "after": "A tentative connection with inspectable sources"
        },
        "sources": [
          "sanitized-narrative"
        ]
      },
      {
        "id": "chat-first-not-a-city",
        "beat": "approach",
        "duration": 8,
        "headline": "Test the connection before the interface",
        "body": "The reviewed main contains a specification only. It proposes chat-first suggestions; any spatial interface waits for evidence of added value.",
        "visual": {
          "type": "outcome",
          "result": "A chat-first design contract, not a built city or a proven usefulness result."
        },
        "sources": [
          "sanitized-narrative"
        ]
      },
      {
        "id": "proposed-checks-before-output",
        "beat": "flow",
        "duration": 9,
        "headline": "A proposed pipeline that can abstain",
        "body": "The proposed flow retrieves permitted passages, checks quotes and contextual support, then offers at most one connection or abstains.",
        "visual": {
          "type": "flow",
          "nodes": [
            {
              "id": "allowed",
              "label": "Allowed passages",
              "detail": "Proposed read-only Markdown inputs"
            },
            {
              "id": "candidate",
              "label": "Candidate relation",
              "detail": "Proposed focus-driven suggestion"
            },
            {
              "id": "verify",
              "label": "Separate checks",
              "detail": "Exact source, context, usefulness"
            },
            {
              "id": "suggestion",
              "label": "Suggest or abstain",
              "detail": "At most one; no verified runtime claimed"
            }
          ],
          "edges": [
            {
              "from": "allowed",
              "to": "candidate"
            },
            {
              "from": "candidate",
              "to": "verify"
            },
            {
              "from": "verify",
              "to": "suggestion"
            }
          ]
        },
        "sources": [
          "sanitized-narrative"
        ]
      },
      {
        "id": "proposed-local-state",
        "beat": "build",
        "duration": 8,
        "headline": "Proposed components, not delivered code",
        "body": "The specification proposes Python and SQLite with derived state outside source notes. No runnable engine is established by reviewed main.",
        "visual": {
          "type": "roles",
          "items": [
            {
              "name": "Markdown",
              "role": "Proposed read-only source passages"
            },
            {
              "name": "Python",
              "role": "Proposed bounded CLI and checking pipeline"
            },
            {
              "name": "SQLite",
              "role": "Proposed derived index outside source notes"
            }
          ]
        },
        "sources": [
          "sanitized-narrative"
        ]
      },
      {
        "id": "permission-staleness-feedback",
        "beat": "details",
        "duration": 9,
        "headline": "Permission and feedback stay distinct",
        "body": "The design requires explicit access, stale-source checks, and user feedback. Keeping a suggestion would not prove it true or useful in practice.",
        "visual": {
          "type": "steps",
          "items": [
            {
              "title": "Permit explicitly",
              "detail": "Default-deny per-file access is a requirement, not a verified control."
            },
            {
              "title": "Recheck sources",
              "detail": "Changed or revoked sources must invalidate dependent suggestions."
            },
            {
              "title": "Ask the human",
              "detail": "Feedback and longitudinal usefulness are separate from quotation checks."
            }
          ]
        },
        "sources": [
          "sanitized-narrative"
        ]
      },
      {
        "id": "study-before-space",
        "beat": "use",
        "duration": 8,
        "headline": "No study result, no city claim",
        "body": "Specification-only on reviewed main. No private notes or feedback were read, no model was called, and no city or longitudinal study was verified.",
        "visual": {
          "type": "outcome",
          "result": "A sanitized design case study. Implementation, usefulness, and any spatial interface require separate evidence."
        },
        "sources": [
          "sanitized-narrative"
        ]
      }
    ]
  }
};
