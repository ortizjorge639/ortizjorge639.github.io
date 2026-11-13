import type { ProjectStory } from './story-types';

// Author-written narratives. Diagrams and examples are not execution evidence.
export const documentEvidenceStory: ProjectStory = {
  projectId: 'document-evidence-pipeline',
  sources: [{ id: 'document-narrative', title: 'Sanitized document intelligence narrative (not public code)', url: 'https://ortizjorge639.github.io/case-studies/document-evidence-pipeline.md' }],
  scenes: [
    {
      id: 'preserve-the-mark', beat: 'need', duration: 8,
      headline: 'A cross-out needs evidence, not just deletion',
      body: 'A PDF mark may be a deletion, an underline or a table rule. Preserve its page, word and geometry before deciding whether text should change.',
      visual: { type: 'contrast', before: 'Flatten text and lose the reason for a change', after: 'Keep source spans, geometry and review decisions together' },
      sources: ['document-narrative'],
    },
    {
      id: 'route-each-page', beat: 'approach', duration: 8,
      headline: 'Native, scanned and hybrid pages take different routes',
      body: 'Native annotations and vector geometry stay distinct from scanned evidence. Scanned or hybrid pages may trigger one full-document cloud Layout request.',
      visual: { type: 'steps', items: [
        { title: 'Native evidence', detail: 'Extract words, annotations and vector geometry; downgrade ambiguous rules.' },
        { title: 'Scanned or hybrid', detail: 'Optional document-level Azure Layout; reuse the cached response for detection.' },
        { title: 'Cloud boundary', detail: 'The full PDF may leave the machine; page-local work is not Azure response streaming.' },
      ] }, sources: ['document-narrative'],
    },
    {
      id: 'join-original-spans', beat: 'flow', duration: 9,
      headline: 'Join evidence to original words, not repeated strings',
      body: 'Normalize word polygons, join by page and overlap, then retain original spans. Deterministic confirmation and review feed enriched, clean and provenance views.',
      visual: { type: 'flow', nodes: [
        { id: 'pages', label: 'Page routing', detail: 'Native / scanned / hybrid' },
        { id: 'evidence', label: 'Evidence + words', detail: 'Native geometry; optional cached cloud Layout and detector' },
        { id: 'joins', label: 'Spatial joins', detail: 'Original word spans; no global text replacement' },
        { id: 'decisions', label: 'Confirm or review', detail: 'Deterministic policy; ambiguity remains visible' },
        { id: 'outputs', label: 'Artifacts + handoff', detail: 'Enriched / clean / provenance; sidecar; search-ingestion records' },
      ], edges: [{ from: 'pages', to: 'evidence' }, { from: 'evidence', to: 'joins' }, { from: 'joins', to: 'decisions' }, { from: 'decisions', to: 'outputs' }] },
      sources: ['document-narrative'],
    },
    {
      id: 'decisions-with-provenance', beat: 'build', duration: 8,
      headline: 'Keep decisions inspectable and ambiguity human-reviewed',
      body: 'Sidecar offsets, geometry and evidence tiers explain changes. Review crops support human decisions. Detector confidence is not a calibrated probability by default.',
      visual: { type: 'roles', items: [
        { name: 'Native extraction', role: 'PyMuPDF words, annotations and vector geometry.' },
        { name: 'Policy and sidecar', role: 'Resolve evidence; preserve source/final offsets, geometry, tiers and scores.' },
        { name: 'Human review', role: 'Ambiguity queue with crops and overlays; no mandatory language model.' },
      ] }, sources: ['document-narrative'],
    },
    {
      id: 'fictional-repeated-phrase', beat: 'details', duration: 9,
      headline: 'Two identical phrases, one hypothetical mark',
      body: 'Imagine a fictional technical note repeating a connector instruction. Only one occurrence is marked. This is hypothetical, not a document excerpt or tested output.',
      visual: { type: 'steps', items: [
        { title: 'Imagine two occurrences', detail: 'Fictional phrase: use the blue connector. No real document or fixture.' },
        { title: 'Join the marked occurrence', detail: 'Match page, word and span; do not replace every matching phrase.' },
        { title: 'Keep uncertain text', detail: 'If a table rule makes the mark ambiguous, preserve text and request review.' },
      ] }, sources: ['document-narrative'],
    },
    {
      id: 'document-evidence-limits', beat: 'use', duration: 8,
      headline: 'A documented mock flow, not cloud acceptance',
      body: 'The documented demo uses the real orchestrator with mocked cloud and detector responses. No fresh execution, accuracy or cloud acceptance is claimed. Code stays private.',
      visual: { type: 'outcome', result: 'Read the sanitized narrative, not public code. Human review remains necessary; faint scans and non-horizontal marks are difficult. Search handoff is not live ingestion proof. Individual authorship is unverified.' },
      sources: ['document-narrative'],
    },
  ],
};

export const customModelAuthStory: ProjectStory = {
  projectId: 'custom-model-auth-diagnostics',
  sources: [{ id: 'auth-narrative', title: 'Sanitized BYOK diagnostic narrative (not public code)', url: 'https://ortizjorge639.github.io/case-studies/custom-model-auth-diagnostics.md' }],
  scenes: [
    {
      id: 'observe-before-gating', beat: 'need', duration: 8,
      headline: 'An auth failure can hide a contract mismatch',
      body: 'A BYOK client and gateway may disagree about the credential header. Separate contract discovery from enforcement rather than guessing against a working route.',
      visual: { type: 'contrast', before: 'A missing key and a wrong gateway expectation look similar', after: 'Observe bounded metadata, then validate the expected contract' },
      sources: ['auth-narrative'],
    },
    {
      id: 'isolate-the-diagnostic', beat: 'approach', duration: 8,
      headline: 'Use an isolated endpoint and disposable dummy credentials',
      body: 'Bound diagnostic lifetime and access. Return static mock responses with metadata-only observation. Never echo, log or forward credential values; no model backend.',
      visual: { type: 'steps', items: [
        { title: 'Disposable input', detail: 'Use non-production dummy credentials, not real secrets.' },
        { title: 'Metadata only', detail: 'Presence booleans and allowlisted scheme classification; no arbitrary header prefixes.' },
        { title: 'Bounded surface', detail: 'Separate endpoint, limited access and lifetime; inspect inherited telemetry too.' },
      ] }, sources: ['auth-narrative'],
    },
    {
      id: 'contract-to-gateway', beat: 'flow', duration: 9,
      headline: 'Observe, validate, then separate backend identity',
      body: 'The historical guide reports Authorization/Bearer. Validate at the gateway using a secret-store-backed value; strip the client credential before backend authentication.',
      visual: { type: 'flow', nodes: [
        { id: 'client', label: 'Client + dummy key', detail: 'Controlled diagnostic input' },
        { id: 'diagnostic', label: 'Isolated observation', detail: 'Allowlisted metadata; static mock response; no forwarding' },
        { id: 'contract', label: 'Contract hypothesis', detail: 'Historical finding, not universal current behavior' },
        { id: 'gateway', label: 'Gateway validation', detail: 'Secret-store-backed gate; remove incoming credential' },
        { id: 'backend', label: 'Backend identity', detail: 'Separate managed identity; retest only with authorization' },
      ], edges: [{ from: 'client', to: 'diagnostic' }, { from: 'diagnostic', to: 'contract' }, { from: 'contract', to: 'gateway' }, { from: 'gateway', to: 'backend' }] },
      sources: ['auth-narrative'],
    },
    {
      id: 'separate-security-responsibilities', beat: 'build', duration: 8,
      headline: 'Discovery does not replace gateway security',
      body: 'Azure API Management validates before routing. Key Vault-backed values and managed identity separate credentials; rotation, inherited policies and rate controls still matter.',
      visual: { type: 'roles', items: [
        { name: 'GitHub Copilot custom model', role: 'Historical client context; behavior must be checked for the intended version and setup.' },
        { name: 'Azure API Management', role: 'Validate incoming contract, strip client credential, then authenticate backend separately.' },
        { name: 'Secret store and operations', role: 'Key Vault-backed value; rotation, access and telemetry need separate review.' },
      ] }, sources: ['auth-narrative'],
    },
    {
      id: 'fictional-auth-inputs', beat: 'details', duration: 9,
      headline: 'An empty key is a different experiment',
      body: 'Imagine a dummy-key attempt and an empty-key attempt. Compare presence flags, not secrets. This fictional example is not captured traffic or a freshly tested policy.',
      visual: { type: 'steps', items: [
        { title: 'Non-empty dummy input', detail: 'Observe only presence and allowlisted scheme metadata in a short controlled window.' },
        { title: 'Empty input', detail: 'Treat a missing-header result as a different input, not a universal client finding.' },
        { title: 'Separate acceptance', detail: 'Check missing, wrong and expected credentials; verify stripping and actual client behavior.' },
      ] }, sources: ['auth-narrative'],
    },
    {
      id: 'restore-and-remove', beat: 'use', duration: 8,
      headline: 'Restore the route and clean up diagnostics',
      body: 'Restore client routing, remove dummy configuration and stop observation. Historical retests were not rerun here. Current compatibility and production safety are not established.',
      visual: { type: 'outcome', result: 'Remove diagnostics or disable them under an explicit retention/access decision. An idle endpoint is not a safety guarantee. Private source stays unlinked; read the narrative. Individual authorship is unverified.' },
      sources: ['auth-narrative'],
    },
  ],
};
