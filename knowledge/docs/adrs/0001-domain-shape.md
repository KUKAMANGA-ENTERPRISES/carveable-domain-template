# ADR 0001 — Domain shape for hello-world

**Status:** Accepted
**Date:** 2026-05-28

## Context

This is an instance of the carveable-domain template. The template offers ten top-level concerns (presentation, interface, behavior, services, adapters, state, knowledge, ops, tests, conventions). An instance has to decide which ones it actually populates.

## Decision

Populate **every** layer with at least one minimal artifact. The hello-world instance's job is to **prove the template's adequacy**, not to ship a useful product. Leaving layers empty wouldn't tell us whether the template's shape is right — only filling them does.

Concrete realizations:

| Layer | Artifact |
|---|---|
| presentation | `pages/hello.html`, `pages/variants.html`, `pages/bundle-test.html`, `styles/site.css`, `styles/tokens.css`, `vendor/run-button.bundle*.js` |
| interface | `api/server.js`, `api/routes/hello.js`, `contracts/hello.openapi.yaml`, `contracts/hello.md` |
| behavior | `agents/hello-agent/manifest.yaml`, `skills/hello-skill/skill.yaml`, `tools/say-hello.js`, `events/on-startup.js`, `surfaces/hello-surface.html` |
| services | `hello/index.js` |
| adapters | `echo/index.js` |
| state | (schemas, seed empty — hello-world has no persistent state) |
| knowledge | this ADR, `examples/hello-walkthrough.md`, `cko.config.yaml` |
| ops | `health/check.sh`, `env-check.js` |
| tests | `integration/hello.test.js` |

## Consequences

**Positive:** Diff `master..example/hello-world` IS the contract — anyone wanting to instantiate the template sees exactly what an instance adds.

**Positive:** Each layer's smell criteria can be exercised against real (if trivial) code.

**Negative:** `state/` is sparse because hello-world is stateless. A second instance with persistent state would need to be added to fully prove the data layer — see the "Future instances" note below.

## Future instances

The template is fully proven only when we have at least two instances exercising:
1. A stateful domain (Postgres + LanceDB adapters, real schemas + seed)
2. A multi-agent domain (multiple skills + tools, surfaces with auth)
3. A domain hosted by a different `owner_entity` than `runsnative` (to catch identity-leaks)

These are not blockers for hello-world but should be tracked.
