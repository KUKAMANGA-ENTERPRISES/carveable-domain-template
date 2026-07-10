# Knowledge Layer

The domain's **documentation corpus**. Hand-authored, version-controlled, intended for both humans and the CKO (Chief Knowledge Officer) when it's wired in.

## Substructure

- **`docs/adrs/`** — Architecture Decision Records. One file per decision: `0001-domain-shape.md`, `0002-postgres-not-mongo.md`, etc. Lightweight format (context, decision, consequences).
- **`docs/examples/`** — Usage walkthroughs. "How do I publish a post?" — soup-to-nuts with real commands.
- **`cko.config.yaml`** — Declares the corpus scope CKO should index (paths, exclusions, freshness expectations).

## What does NOT go here

- **Contracts** → `interface/contracts/` (machine + prose live together at the boundary)
- **Runbooks** → `ops/runbooks/` (operations, not knowledge)
- **README files for layers** → next to each layer (not centralized here)

## CKO groundwork

When CKO is introduced:

1. It reads `cko.config.yaml` to discover the corpus
2. It indexes `docs/` and any other paths declared in scope (typically all `*.md` in the repo, including layer READMEs and ADRs)
3. Its index lives in `state/.cko/` (gitignored)
4. It exposes a search/contradiction-detect surface via `behavior/surfaces/cko/` (added at instance time, not here)
5. It registers in `.mcp.json` so agents can query it

The template ships the *holes* CKO will fill — no CKO code, just the shape that lets CKO drop in zero-touch.

## A useful smell

If documentation references a contract by inline-copying its text, the doc will rot. Reference the contract file by path; let CKO surface the relationship.
