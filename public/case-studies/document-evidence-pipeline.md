# Evidence-preserving document intelligence

Content review: 2026-11-13. Source type: curated-case-study.

## Evidence and publication boundary

This author-written sanitized narrative explains a document-processing architecture, not a public code inspection. The implementation remains private and cannot be independently inspected here. No private source, screenshots, document excerpts or implementation links are published. Individual authorship is unverified. Publication of this narrative does not establish permission to redistribute the implementation; source release is a separate review.

## Preserve evidence before changing text

A crossed-out phrase is not just text to remove. A processing pipeline needs to retain where it appeared, why it was marked, and whether the evidence is strong enough to act on. This design routes each PDF page as native, scanned or hybrid, then joins evidence to original word identities rather than searching and replacing repeated phrases across a document.

Native extraction uses PyMuPDF words, explicit strike annotations and near-horizontal vector geometry. Center-band, angle, thickness and coverage checks help distinguish cross-outs from underlines; long form and table rules can remain ambiguous and go to review. Sparse text and image coverage inform scanned/hybrid routing; thresholds are policy-controlled.

## Routing and the cloud boundary

```text
PDF -> page routing -> native annotations / vector geometry
                  -> scanned or hybrid -> optional document-level Azure Layout
                                              | cached response reused
                                              v
original words + spans <- spatial joins <- detector evidence
           -> deterministic decisions -> artifacts + human review
```

A scanned or hybrid page can trigger a single document-level Azure Document Intelligence Layout request. The complete response is cached and reused by the scanned detector rather than repeating OCR. This path may send the full document to the cloud: it is not a local-only privacy guarantee. Service region, retention, networking and artifact handling require separate review. Page-local routing, rendering and evidence records do not mean Azure streams partial page results; the Layout response arrives after document analysis.

Azure word polygons are normalized into page fractions. Evidence joins to original words by page, overlap and center distance, preserving original word spans. Partial native strikes use offsets within the matched word. This is not global text replacement. With fixed input, policy, package versions and cached Layout response, resolution is deterministic; input and policy hashes support reproducibility, not an accuracy guarantee.

## Decisions and output contract

Evidence precedence runs from verifier to annotation, style, vector and scanned evidence. Confirmation policy separates confirmed deletions from needs-review items. An optional verifier receives a localized crop and evidence; no language model is mandatory. Detector scores are evidence, not ground truth, and confidence is not a calibrated probability by default.

The same spans drive enriched Markdown, clean text with only confirmed deletions removed, and provenance text preserving deleted content. A sidecar carries source/final offsets, geometry, evidence tier and scores. Page records, normalized results and an ambiguity queue support inspection; review crops and overlays help a human resolve uncertain marks. A search-ingestion JSONL record and manifest define a handoff, not proof of acceptance by a live search service.

## Fictional example, not tested output

Imagine a fictional technical note containing the phrase "use the blue connector" twice, with a line through only the first occurrence. This is a hypothetical illustration, not an actual document, fixture or measured result. The intended operation is to join the mark to that occurrence's page, word and span, retain its evidence in the sidecar, and leave the second occurrence unchanged. If a nearby table rule makes the mark ambiguous, keep the text visible and route it to human review rather than silently deleting it.

## Validation and limitations

The reviewed documentation describes a five-page generated mock demo using the real orchestrator with mocked cloud and detector responses. That is a historical documented demonstration, not fresh execution in this portfolio update, field accuracy evidence or cloud acceptance. No model or cloud service was called for this narrative.

Faint scans, ruled forms, glyph chains and handwritten or non-horizontal cross-outs remain difficult. Horizontal left-to-right text is the documented validation target. Human ambiguity review remains necessary; no benchmark accuracy, production safety or scale approval is claimed. Service limits may require a separate chunk-and-stitch provider. PyMuPDF's AGPL/commercial licensing also needs deployment-specific review. The public evidence is this narrative only, not a release of private code or data.
