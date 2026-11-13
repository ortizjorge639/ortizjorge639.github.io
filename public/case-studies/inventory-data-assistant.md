# Inventory Data Assistant Template

Content review: 2026-11-13. Source type: curated-case-study.

## Evidence and publication boundary

This is an author-written, sanitized narrative for the portfolio, not a public code inspection or an independently reproducible application review. The underlying code remains private and is not independently inspectable here. No source code or source repository link is published. Redistribution permission is unresolved; removing customer names alone would not establish permission to redistribute the implementation. This narrative does not establish Jorge's individual authorship or sole contribution.

## The reusable idea

The template adapts an existing inventory and obsolescence assistant. It is not a generic agent for arbitrary SQL. Its inherited domain engine works with inventory, scrap eligibility, open sales orders and invoices, using filters, counts, grouping, exports and charts. Domain rules and data tools constrain the work around those table roles.

Excel or schema-compatible SQL Server data enters a pandas loader, which maps the expected table roles. Domain rules and tools operate on those tables. The normal model-backed runtime combines Microsoft Agent Framework and Azure OpenAI with deterministic domain routes. A local terminal process is supported. Retained hosted web, Bot and Teams integration code remains subject to acceptance; its presence is not live Teams proof.

## Architecture, two distinct paths

```text
Excel / schema-compatible SQL Server
                 |
          pandas loader
          expected table roles
                 |
       domain rules + data tools
          /                   \
Normal runtime             Optional offline adapter
Microsoft Agent Framework  Deterministic, non-LLM
+ Azure OpenAI             Fictional Excel only
+ deterministic routes     Loopback terminal / browser
```

The optional offline adapter makes no application model or Azure calls. It is a separate deterministic route through fictional data, not a substitute for validating the normal model-backed runtime, live SQL connectivity or Teams integration.

## Template layer versus inherited engine

The template additions cover configuration, fictional fixtures, Windows PowerShell and Python helpers, Copilot onboarding and local CI. The domain engine is inherited and is not claimed as newly authored. Individual authorship has not been independently verified. Copilot onboarding is setup guidance, not the normal application model runtime.

## Fictional walkthrough, not measured output

This is an illustrative sequence, not a recorded execution or a measured outcome. No returned quantities, timings or accuracy results are asserted.

1. Imagine fictional Excel data for the optional offline adapter. DEMO-PART is a hypothetical placeholder, not a verified bundled fixture identifier or a tested command, and represents no real customer item.
2. Ask to count inventory rows, then filter for DEMO-PART. Keep the requested table role and filter explicit; inspect the result rather than assuming a quantity.
3. Narrow to scrap eligibility and inspect the applicable domain rules. Explore grouping or an export/chart request as a next step, checking the output separately.

This describes how one might explore the domain workflow. It does not report that these prompts were freshly executed for this portfolio.

## Evidence limits and current status

Repository documentation describes historical local synthetic-data/HTTP and native Windows setup tests at scoped earlier revisions. Those records are not fresh execution evidence. The portfolio review was source inspection only; the application was not freshly run.

No current live customer SQL or model correctness, App Service authentication/deployment, on-premises connectivity, pipelines or actual Teams behavior is established here. An offline loopback walkthrough does not prove any of those integrations. Security, scale and production approval have not been given. Treat this as a bounded template narrative, not a production-ready release or a public application demo.
