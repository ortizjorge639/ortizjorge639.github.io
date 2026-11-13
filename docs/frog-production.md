# Frog guide production deployment

**Decision date:** September 19, 2026

**Status:** The disabled-by-default direct-model adapter, explicit YAML configuration and durable conditional quota path are now implemented; see [current runbook](hosted-frog-runbook.md). Hosted release is still blocked on actual F1 resource quota and all deployment/CI gates. The historical design below is preserved as the original provider-separation contract, not evidence that both proposed public backends were deployed.
Documenting this decision does not authorize provisioning, credential changes,
deployment, or public activation.

## Problem Statement

The portfolio must remain available without Jorge's Mac running. Its optional
frog guide should answer visitors' questions through a hosted backend, while
remaining grounded in approved public portfolio sources. The maintainer wants
an explicit YAML switch to disable live answers or select their backend without
rebuilding the frog experience around a particular provider.

Today the frontend is static and deployable to GitHub Pages. Live answers use
a localhost-only service that starts an isolated Copilot CLI process per
request. The frontend rejects public AI connections, and the development proxy
does not ship with the static site. This local bridge must not be exposed
publicly or treated as a production service.

## Solution

Keep the portfolio on GitHub Pages and support two selectable hosted backends
behind one guide API and one shared grounding/validation layer:

| Backend | Runtime and provider | Hosting direction |
| --- | --- | --- |
| Copilot CLI | A separate deployed Copilot runtime using an approved GitHub authentication and billing arrangement. No Foundry endpoint is required. | Existing VM or managed container service |
| Direct model API | Our backend calls a Foundry, OpenAI, or compatible model endpoint directly, without Copilot CLI. | Azure Functions |

The user explicitly selected **Copilot for the GitHub-backed route and direct
model calls for the endpoint-backed route**, rather than retaining Copilot as
the engine in both routes. A model endpoint does not itself host our application.
Foundry Agent Service is not required for the direct-model design.

Visitors access constrained portfolio Q&A, not this coding session, its
workspace, a terminal, or the maintainer's credentials. The static portfolio,
frog artwork, flipbooks, drawing tools, and image viewer remain usable when
live answers are disabled or unavailable.

## User Stories

1. As a visitor, I can explore the portfolio regardless of AI availability.
   - [ ] With live answers disabled, browsing, animations, Ink, and image zoom
     still work, and the guide explains its unavailability. Evidence: browser
     tests with disabled-service fixtures.
   - [ ] Opening the guide or checking availability does not invoke a model.
     Evidence: HTTP tests asserting zero inference calls.
2. As a maintainer, I can deliberately select either backend.
   - [ ] YAML selects exactly one supported backend or disables inference.
     Invalid or incomplete selections fail explicitly rather than selecting a
     default provider. Evidence: configuration and deployment-preflight tests.
   - [ ] Both backends implement the same request, answer, citation, error, and
     cancellation contract. Evidence: shared HTTP contract tests with each
     adapter substituted.
   - [ ] A provider failure never triggers an unconfigured cross-provider
     fallback. Evidence: failure fixtures asserting only the selected adapter
     was called.
3. As a visitor and maintainer, I can rely on bounded, isolated answers.
   - [ ] Both routes use only approved portfolio evidence and reject invented
     citation IDs or invalid output. Evidence: existing answer-validation
     cases exercised through both adapter fixtures.
   - [ ] Visitors cannot share conversation state or access tools, private
     files, arbitrary URLs, or another visitor's data. Evidence: concurrent
     request isolation and denied-capability tests.
   - [ ] Cancellation and deadlines terminate provider work as supported by
     its API and release local resources. Any provider-side cancellation or
     billing limitations are documented. Evidence: adapter cancellation tests
     and a separately authorized hosted smoke test.
   - [ ] Public activation requires configured access rules, shared abuse and
     concurrency limits, spending controls, and provider-accurate privacy copy.
     Evidence: deployment preflight and browser failure-state tests.
   - [ ] **Blocked pending entitlement clarification:** public GitHub-backed
     activation cannot proceed on an assumed right to proxy a personal
     Copilot subscription. Evidence: recorded confirmation of the chosen
     authentication/billing arrangement.

## Implementation Decisions

- **Proposed YAML controls, not a working schema:**

  | Field | Agreed meaning |
  | --- | --- |
  | `frog.enabled` | Defaults to `false`; enables live inference only through an explicitly configured backend |
  | `frog.backend` | `model-api` or `copilot-cli`; the proposed default selection is `model-api`, still disabled |
  | `frog.access` | `public` or `restricted`; restricted-mode authentication remains to be chosen |
  | `frog.model_provider` | Used only by `model-api`; Foundry is the proposed choice, with OpenAI/compatible endpoints as alternatives |

  These are application/deployment controls, not existing Copilot CLI options
  or configuration that a provider automatically understands.
- Keep deployment configuration separate from credentials. Store credentials
  in the host's secret store and pass references, never credential values,
  through repository YAML. No model credential belongs in browser assets.
- Retain the existing executor boundary: the shared request handler selects
  approved evidence, invokes an adapter with a cancellation signal and deadline,
  and validates its result. Avoid duplicating retrieval or citation policy in
  individual adapters.
- Preserve the local baseline unless deliberately revised: 1,200-character
  questions, six bounded history messages, a 16 KB request body, a 90-second
  total deadline, bounded output, and at most one answer-shape/citation
  correction using the same evidence and original deadline.
- The existing one-active-request and ten-requests-per-minute counters are
  process-local rehearsal protections, not a production quota policy.
  Production enforcement must account for multiple instances and visitors.
  Numeric limits, shared storage, and spending thresholds remain open.
- Run the hosted Copilot engine with isolated visitor/request context and the
  current no-tools/no-MCP evidence boundary. Never attach visitors to the
  maintainer's interactive session. Keep the runtime's internal interface
  private; expose only the constrained guide API.
- Configure the frontend for the selected production API, replacing its
  localhost-only eligibility check and CLI-specific status/privacy assumptions.
  Keep the development bridge loopback-only.
- Separate executable/service availability from verified model access.
  Availability checks must not silently spend inference credits.
- Surface disabled, unauthorized, rate-limited, budget-exhausted, busy,
  timeout, provider, and citation-validation failures explicitly. Retain the
  visitor's question for deliberate retry where appropriate.
- A YAML selection must not silently change spending or data routing through
  automatic provider failover. Switching providers is a maintainer decision.
- Turning inference off does not necessarily deprovision billable hosting.
  Infrastructure lifecycle and public activation require explicit deployment
  decisions; a feature toggle alone is not proof that all costs have stopped.

## Testing Decisions

- Prefer the existing HTTP service boundary and injected executor seam. Run
  the same externally observable cases against fake CLI and model-API
  adapters, rather than testing provider implementation details.
- Reuse the guide's request validation, allowed-citation, bounded correction,
  cancellation, isolation, concurrency, and failure fixtures. Extend them to
  configuration selection and shared production limits.
- Reuse browser fixtures for availability, sending, stopping, retrying,
  privacy disclosure, and preserving portfolio interaction during failures.
- Existing repo-native commands are `npm run test:guide`, `npm test`,
  `npm run build`, and `npm run test:responsive`. New adapter checks should
  join those conventions; routine CI must not call paid models.
- Before activation, run an explicitly authorized smoke test against the
  selected host/provider, confirming authentication, end-to-end citations,
  cancellation behavior, observability, and configured usage limits. Local
  fixtures alone do not establish hosted readiness.

## Out of Scope

- Provisioning a VM, Function App, container service, model deployment, or
  credentials as part of this documentation task.
- Publicly tunneling the existing local bridge or sharing this coding session.
- Adding Copilot BYOK as a third runtime/provider combination now. It is
  technically available but was not the selected endpoint-backed design.
- Browsing arbitrary visitor URLs, enabling agent tools, accessing private
  repositories, or taking actions on a visitor's behalf.
- A Foundry-hosted agent migration, a vector database, or persistent chat
  history merely to support the current small portfolio source collection.
- Claims of unlimited free inference, guaranteed zero cost, or established
  permission to share a personal Copilot entitlement.

## Further Notes

### Remaining decisions and gates

- Exact model/provider, deployment region, endpoint compatibility, and cost
  envelope. Foundry is a proposal, not a provisioned resource.
- Existing VM availability versus a managed container for the CLI route.
- Production API address, frontend configuration delivery, and restricted-mode
  authentication. CORS alone is not access control or abuse protection.
- Shared visitor quotas, concurrency policy, spending enforcement, and
  operational logging/retention. Browser chat currently resets on reload;
  provider retention is a separate boundary that must be disclosed accurately.
- Confirmation of GitHub-backed public-service entitlement and billing.
  Server-side credential storage and application guardrails do not resolve
  licensing by themselves.

### Evidence reviewed September 19, 2026

GitHub SDK references below are pinned to **v1.0.14**. Hosting, billing, and
product policies are date-sensitive and must be rechecked before deployment.

- [Copilot CLI noninteractive execution](https://docs.github.com/en/copilot/get-started/cli-quickstart#using-github-copilot-cli-non-interactively)
  and [SDK backend services](https://github.com/github/copilot-sdk/blob/v1.0.14/docs/setup/backend-services.md)
  support programmatic use and separately hosted runtimes. This establishes
  technical feasibility, not readiness of our local bridge for public traffic.
- [SDK authentication](https://github.com/github/copilot-sdk/blob/v1.0.14/docs/auth/authenticate.md)
  and [BYOK](https://github.com/github/copilot-sdk/blob/v1.0.14/docs/auth/byok.md)
  distinguish GitHub-backed access from external model providers. BYOK can
  retain the Copilot runtime, but our agreed second route omits that runtime.
- [Multi-tenancy guidance](https://github.com/github/copilot-sdk/blob/v1.0.14/docs/setup/multi-tenancy.md)
  and [server-to-server tokens](https://github.com/github/copilot-sdk/blob/v1.0.14/docs/auth/server-to-server-tokens.md)
  describe shared-backend isolation and organization-attributed authentication.
  Together with the [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)
  and [Copilot product terms](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#github-copilot),
  they do not establish blanket permission for this proposed anonymous service
  to use a personal subscription. That arrangement remains unconfirmed.
- [Azure Functions background-work guidance](https://learn.microsoft.com/en-us/azure/azure-functions/performance-reliability#make-sure-background-tasks-complete)
  requires started work, including processes, to complete before an invocation
  returns. Functions can launch subprocesses, but an indefinitely running CLI
  daemon is not the assumed lifecycle. [Hosting limits](https://learn.microsoft.com/en-us/azure/azure-functions/functions-scale#function-app-timeout-duration)
  must be considered alongside cold starts and executable packaging.
- [Azure Container Apps containers](https://learn.microsoft.com/en-us/azure/container-apps/containers#multiple-containers)
  provide an alternative API/runtime topology. Hosting still has lifecycle,
  scaling, and resource costs.
- [Foundry Agent Service overview](https://learn.microsoft.com/en-us/azure/foundry/agents/overview#choose-how-to-build)
  distinguishes externally hosted code calling a model endpoint from managed
  prompt/hosted agents. A direct model call does not require moving our
  application into Agent Service.
- [Copilot billing](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing)
  and [usage limits](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/usage-limits)
  establish metered/limited usage. External model providers have their own
  billing and limits; free allowances do not imply free public-service capacity.
