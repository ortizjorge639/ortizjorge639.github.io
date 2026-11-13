// One approved author-written narrative, never an arbitrary URL/repository ingestion path.
export const CURATED_CASE_STUDIES = Object.freeze({
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
