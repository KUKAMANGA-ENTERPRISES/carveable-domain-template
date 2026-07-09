# Carveable-Domain Template

This is a **template** for a self-contained Kukamanga-style domain — a unit of code, contracts, data, and docs that can be owned, operated, and (if needed) handed off to another party without dependencies on sibling repos.

If you're looking at this on `master`, you're looking at the **mold** — the empty shape. Instances of this template (with real code filled in) live on branches named `example/<name>`.

## What's a "carveable domain"?

A bounded unit that:

1. **Declares its own contracts** (`interface/contracts/`) — what it exposes to consumers
2. **Owns its own behavior** (`behavior/`, `services/`) — the logic that fulfills those contracts
3. **Wraps its own external dependencies** (`adapters/`) — every outside system has an adapter; the rest of the code is integration-agnostic
4. **Carries its own knowledge** (`knowledge/docs/`) — ADRs, examples, contracts in prose
5. **Carries its own operations story** (`ops/`) — health checks, deploy manifests, runbooks
6. **Has no absolute paths into sibling repos** — everything it depends on is either in `node_modules/` or wrapped by an adapter
7. **Carries its own brand media** (`assets/`) — the DAM (images, textures) the domain owns; it travels with the domain on carve-out

Pass these and the domain can be carved out and handed over.

## How to use this template

Read [TEMPLATE.md](./TEMPLATE.md) for the step-by-step.

## Repository conventions

- **Master branch = the template (mold).** Empty placeholders, no working code.
- **`example/<name>` branches = working instances (material).** `example/hello-world` is the proving instance.
- **`git diff master..example/hello-world` is the contract** — it answers "what does a customer add on top of the template?"

## Layout at a glance

```
.claude/         Claude Code project config (team-shared)
presentation/    pages, owned components, MFEs, styles, vendored UI bundles
assets/          brand media (DAM) + asset-pack.json manifest
interface/       api routes + machine/prose contracts (inbound boundary)
behavior/        agents, skills, tools, events, surfaces (orchestration)
services/        domain operations (the hexagon's inside)
adapters/        external system wrappers (outbound boundary)
state/           data schemas, seed, runtime store, CKO index
knowledge/       docs (ADRs, examples) + cko.config.yaml
ops/             health, deploy, runbooks
tests/           cross-layer integration tests (unit tests are co-located)
```

See each layer's own `README.md` for what goes inside.
