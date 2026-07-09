# Presentation Layer

Everything users see. This layer **consumes** the rest of the domain through the API and (for agent-driven flows) through the agent surfaces. It never reaches into `services/` or `adapters/` directly.

## Substructure

- **`pages/`** — static HTML the domain authors. One file per route (e.g. `pages/about.html`). The web-root `index.html` at the repo root links into these.
- **`components/`** — reusable UI components this domain **authors and owns** — its proprietary design-system layer (custom elements / web components). One folder per component: `components/<name>/` with the element + co-located tests. Distinct from `vendor/` (consumed, external bundles) and `mfes/` (mountable micro-frontends); consumed RunsNative components come from `node_modules/runsnative/`. Put a component here only if the domain owns it.
- **`mfes/`** — micro-frontends. Dynamic bundles that mount into the RunsNative shell. One folder per MFE: `mfes/<name>/manifest.json` + `mfes/<name>/index.js`. Unit tests co-located under `mfes/<name>/tests/`.
- **`styles/`** — domain CSS. Pages and MFEs import from here. Brand tokens come from `node_modules/runsnative/...` (or similar) — don't redefine token values here.
- **`vendor/`** — pre-built UI bundles vendored into the repo for the no-importmap path (e.g. CodePen demos, fallback distribution). One file per bundle.

## What does NOT go here

- API routes → `interface/api/`
- Agent surfaces → `behavior/surfaces/`
- Brand media (images, textures) → `assets/`
- Anything that talks to a database, LLM, or external service → `services/` + `adapters/`

## A useful smell

If a page contains business logic, lift it into `services/` and have the page fetch from `interface/api/`. The page should be a thin view.
