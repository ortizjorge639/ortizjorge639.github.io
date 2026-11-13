import type { ProjectStory } from './story-types';

// Authored sanitized narrative; no source code inspection or measured demo claim.
export const inventoryStory: ProjectStory = {
  projectId: 'inventory-data-assistant',
  sources: [{ id: 'inventory-case-study', title: 'Sanitized case-study narrative (not public code)', url: 'https://ortizjorge639.github.io/case-studies/inventory-data-assistant.md' }],
  scenes: [
    {
      id: 'inventory-domain', beat: 'need', duration: 8,
      headline: 'Inventory questions need domain rules',
      body: 'Inventory, scrap eligibility and open orders need shared table roles and rules. This adapts an existing domain assistant, not an arbitrary SQL agent.',
      visual: { type: 'contrast', before: 'Inventory and order tables with domain-specific rules', after: 'A reusable template around an inherited domain engine' },
      sources: ['inventory-case-study'],
    },
    {
      id: 'two-runtime-paths', beat: 'approach', duration: 8,
      headline: 'Model runtime and offline adapter are separate',
      body: 'Microsoft Agent Framework and Azure OpenAI power the normal runtime. An optional deterministic adapter uses fictional Excel, with no application model or Azure calls.',
      visual: { type: 'steps', items: [
        { title: 'Normal runtime', detail: 'Model-backed terminal plus deterministic domain routes.' },
        { title: 'Optional offline adapter', detail: 'Fictional Excel; non-LLM loopback terminal or browser, not Teams proof.' },
      ] }, sources: ['inventory-case-study'],
    },
    {
      id: 'tables-to-tools', beat: 'flow', duration: 9,
      headline: 'Map table roles before domain operations',
      body: 'Excel or schema-compatible SQL Server feeds pandas table roles. Domain rules and tools support filters, counts, grouping, exports and charts.',
      visual: { type: 'flow', nodes: [
        { id: 'data', label: 'Excel / SQL Server', detail: 'Schema-compatible inputs' },
        { id: 'loader', label: 'pandas loader', detail: 'Expected inventory, order and invoice table roles' },
        { id: 'rules', label: 'Domain rules + tools', detail: 'Inventory, scrap eligibility, open sales orders and invoices' },
        { id: 'runtime', label: 'Runtime / adapter', detail: 'Normal model path or separate optional offline adapter' },
      ], edges: [{ from: 'data', to: 'loader' }, { from: 'loader', to: 'rules' }, { from: 'rules', to: 'runtime' }] },
      sources: ['inventory-case-study'],
    },
    {
      id: 'template-boundary', beat: 'build', duration: 8,
      headline: 'Template work wraps an inherited engine',
      body: 'Configuration, fictional fixtures, Windows helpers, Copilot onboarding and local CI form the template layer. Individual authorship is not independently verified.',
      visual: { type: 'roles', items: [
        { name: 'Inherited engine', role: 'Existing domain rules and data tools; not claimed newly authored.' },
        { name: 'Template layer', role: 'Configuration, fixtures, PowerShell/Python helpers, onboarding and local CI.' },
        { name: 'Integration boundary', role: 'Hosted web/Bot/Teams code retained, subject to acceptance; not live proof.' },
      ] }, sources: ['inventory-case-study'],
    },
    {
      id: 'fictional-walkthrough', beat: 'details', duration: 9,
      headline: 'An illustrative walkthrough, not measured output',
      body: 'Imagine hypothetical part DEMO-PART: count rows, filter the part, inspect scrap rules. Not a verified fixture or tested command; no measured results or quantities.',
      visual: { type: 'steps', items: [
        { title: 'Imagine fictional Excel', detail: 'Optional offline adapter; hypothetical input, not a verified bundled fixture.' },
        { title: 'Count, then filter', detail: 'Request inventory row count; narrow to DEMO-PART without assuming an outcome.' },
        { title: 'Inspect the rules', detail: 'Review scrap eligibility; consider grouping, export or chart requests separately.' },
      ] }, sources: ['inventory-case-study'],
    },
    {
      id: 'narrative-not-production', beat: 'use', duration: 8,
      headline: 'A sanitized narrative, not a production release',
      body: 'Code stays private; redistribution permission is unresolved. Historical scoped tests are not fresh runs. No live SQL/model, deployment or Teams proof is claimed.',
      visual: { type: 'outcome', result: 'Source inspection only; no fresh app execution. Security, scale and production approval are not given. Read the sanitized narrative, not public code.' },
      sources: ['inventory-case-study'],
    },
  ],
};
