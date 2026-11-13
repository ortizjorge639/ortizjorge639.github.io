// Exact approved author-written narratives, never arbitrary URL/repository ingestion paths.
export const CURATED_CASE_STUDIES = Object.freeze({
  'gesture-conversation-lab': Object.freeze({
    url: 'https://ortizjorge639.github.io/case-studies/gesture-conversation-lab.md',
    file: 'public/case-studies/gesture-conversation-lab.md',
  }),
  'coding-session-dj': Object.freeze({
    url: 'https://ortizjorge639.github.io/case-studies/coding-session-dj.md',
    file: 'public/case-studies/coding-session-dj.md',
  }),
  'recurrence-gated-knowledge': Object.freeze({
    url: 'https://ortizjorge639.github.io/case-studies/recurrence-gated-knowledge.md',
    file: 'public/case-studies/recurrence-gated-knowledge.md',
  }),
  'retrieval-practice-harness': Object.freeze({
    url: 'https://ortizjorge639.github.io/case-studies/retrieval-practice-harness.md',
    file: 'public/case-studies/retrieval-practice-harness.md',
  }),
  'synthetic-migration-pilot': Object.freeze({
    url: 'https://ortizjorge639.github.io/case-studies/synthetic-migration-pilot.md',
    file: 'public/case-studies/synthetic-migration-pilot.md',
  }),
  'source-grounded-connections': Object.freeze({
    url: 'https://ortizjorge639.github.io/case-studies/source-grounded-connections.md',
    file: 'public/case-studies/source-grounded-connections.md',
  }),
  'document-evidence-pipeline': Object.freeze({
    url: 'https://ortizjorge639.github.io/case-studies/document-evidence-pipeline.md',
    file: 'public/case-studies/document-evidence-pipeline.md',
  }),
  'custom-model-auth-diagnostics': Object.freeze({
    url: 'https://ortizjorge639.github.io/case-studies/custom-model-auth-diagnostics.md',
    file: 'public/case-studies/custom-model-auth-diagnostics.md',
  }),
  'inventory-data-assistant': Object.freeze({
    url: 'https://ortizjorge639.github.io/case-studies/inventory-data-assistant.md',
    file: 'public/case-studies/inventory-data-assistant.md',
  }),
});

export function validateCuratedProject(project, url) {
  const approved = Object.hasOwn(CURATED_CASE_STUDIES, project?.id) ? CURATED_CASE_STUDIES[project.id] : undefined;
  if (!approved || project.sourceType !== 'curated-case-study' || project.repo !== '' || project.site !== approved.url ||
      url !== approved.url || project.sources?.length !== 1 || project.sources[0].url !== approved.url) {
    throw new Error('Unapproved curated case study');
  }
  return approved;
}

export function approvedRepository(project) {
  // An explicitly empty repository must never fall back to a guessed repository name.
  if (Object.hasOwn(CURATED_CASE_STUDIES, project.id) || project.sourceType === 'curated-case-study' || project.repo === '') throw new Error('No approved public repository');
  const repo = project.repo?.replace('https://github.com/', '') ?? `ortizjorge639/${project.id}`;
  if (!/^ortizjorge639\/[a-z0-9-]+$/.test(repo)) throw new Error('No approved public repository');
  return repo;
}
