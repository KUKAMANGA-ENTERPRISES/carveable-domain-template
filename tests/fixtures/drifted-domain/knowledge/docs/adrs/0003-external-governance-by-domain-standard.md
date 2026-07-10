# ADR 0003 — This repo is the reference implementation of an external standard

**Status:** Accepted
**Date:** 2026-07-09
**Tracking:** JUNE-562 (deliverable: JUNE-561). Supersedes MUK-1942 as this repo's tracking home.
**Authors:** Joe Pontes, Claude

## Context

Until now this repo's layer contract lived only inside this repo, as prose: `AGENTS.md`'s hard rules, `TEMPLATE.md`'s "What NOT to put in the template" and its carveability checklist, and each layer README's "what does NOT go here" and "a useful smell" sections. The contract was real, well-described, and **unenforceable** — nothing outside a careful reader stopped a layer from drifting.

That was tolerable while the template was a demo. It stopped being tolerable when the template became load-bearing. `kukamanga/docs/adr/tenant-factory-and-carveable-domain-model-v1.md` (ratified as D23/D24/D25/D28) makes this repo **unifier #1** — the structural mold every tenant of the Mukadra tenant factory instantiates — and rests the commodity-60% thesis on a single discipline rule: every tenant type must be a *profile* of this one template plus a *source* over the CKO contract. The ADR states the consequence plainly: the day someone builds bespoke instead, the commodity 60% erodes.

An unenforced rule erodes. And the agent that erodes it will not be a careless human — it will be an LLM inventing `src/`, `lib/`, or `utils/` from its training prior, plausibly, differently each session.

Meanwhile the repo itself was orphaned: tracked under a frozen MUK ticket (MUK-1942), referenced by no active work item, and edited outside any ticket.

## Decision

**The layer contract moves out of this repo and becomes a versioned holdings governance standard: `kukamanga/docs/governance/domain-standard-v1.md`.** This repo becomes its **reference implementation**.

Consequences of that inversion:

1. **The top-level layer set is closed.** Adding, removing, or renaming a layer requires a version bump of the standard, not merely a commit here. `src/`, `lib/`, `utils/`, `common/`, `shared/`, `helpers/`, `core/`, and `docs/` are forbidden at the top level.
2. **The standard is normative where the two disagree**; this repo is normative where the standard is silent.
3. **Conformance has two scopes.** *Mold scope* is this repo's `master`: it ships the holes, and instance content is forbidden. *Instance scope* is a domain instantiated from it: it ships the fill. A requirement is tagged for one or both.
4. **`knowledge/docs/adrs/0001-domain-shape.md` is reserved for the instance.** It is the instance's record of *its* domain's shape, required at instance scope by `TEMPLATE.md`'s checklist. The mold deliberately does not ship one — a mold-supplied `0001` would be inherited by every instance and would satisfy that check vacuously. This is why this ADR is `0003` and not `0001`.
5. **The carveability checklist is instance-scope**, which is why `master` legitimately lacks `ops/health/check.sh` and `ops/env-check.js`. The checklist always meant this ("Before considering the domain 'shipped'"); it never said so.
6. **`tools/check-carveability.js`** — promised in `domain.yaml`'s header comment and in `adapters/README.md` — is specified by the standard's §7.1 referential invariants and built as **JUNE-563**. It is not a per-domain script each instance writes; it is one checker that reads the standard.

## Consequences

**Positive.**

* Drift becomes detectable rather than merely regrettable. The standard's §7.1 (eight referential invariants binding `domain.yaml` to the filesystem) and §11 (the drift catalogue, promoted from the layer READMEs' "useful smell" sections) are a machine-checkable specification.
* A conforming domain becomes navigable with zero configuration — an agent resolves "where does an X go" identically in every domain of every entity (standard §10, built as JUNE-564).
* The template is de-orphaned: tracked under JUNE-561, cited by the ADR it serves.
* Contract and implementation can now disagree *visibly*. Today they already did — the checklist's scope ambiguity meant the mold appeared to violate its own rules — and nothing surfaced it.

**Negative / trade-offs.**

* The layer contract now lives in a repo most contributors to a *domain* will never open. Mitigation: `AGENTS.md` and `README.md` point at it by path, and the checker fails locally with the standard's section number.
* A structural change now costs a governance version bump, deliberately. Friction is the feature.
* This repo cannot file-import the standard (carveability rule 1 and the holdings' entity-separation boundary both forbid it). The coupling is by citation, not by path — the same relationship every entity has with `shared-lexicon-v1`.

**Out of scope.**

* The conformance checker itself → JUNE-563.
* The discovery surface → JUNE-564.
* Assigning commodity/differentiation bands to the five layers ADR §2 leaves unclassified (`interface/`, `knowledge/`, `i18n/`, `tests/`, `.claude/`) → recorded as an open founder question in standard §8.

## References

* `kukamanga/docs/governance/domain-standard-v1.md` — the standard.
* `kukamanga/docs/governance/shared-lexicon-v1.md` — its governance sibling: one ubiquitous language, one ubiquitous structure.
* `kukamanga/docs/adr/tenant-factory-and-carveable-domain-model-v1.md` — why this repo is load-bearing (three unifiers; the 60/40 seam; the discipline rule).
* `mukadra/docs/concepts/customer-brand-portal-product-v1.md` §12 — the estate model that produced the `assets/` and `presentation/components/` layers (commit `ff04e1c`).
* [ADR 0002](./0002-mcp-and-i18n-layers.md) — the precedent for changing the layer set by ADR.
* MUK-1942 — this repo's former tracking home, frozen. Superseded by JUNE-561 / JUNE-562.
