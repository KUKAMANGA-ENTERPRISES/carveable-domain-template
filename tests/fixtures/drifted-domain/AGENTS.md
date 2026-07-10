# Agent Instructions

This is the canonical instructions file for all agentic IDEs (Claude Code, Codex, Cursor, etc.). `CLAUDE.md` and any other IDE-specific files are thin pointers to this file.

## What this repo is

A **carveable-domain template** — the empty mold for a Kukamanga-style domain. See [README.md](./README.md) for the high-level pitch and [TEMPLATE.md](./TEMPLATE.md) for how to instantiate.

## What you're working with

- **Master branch is the template.** It must stay empty of instance-specific content. Working code goes on `example/<name>` branches.
- **`example/hello-world`** is the proving instance. It demonstrates that every layer can be filled with something real.
- **The diff `master..example/hello-world` is the contract** — that's what every instance commits to add on top of the mold.

## Architecture in one paragraph

The domain is a hexagon: `services/` is the inside (domain operations), `adapters/` is the outside boundary (every external system wrapped). `interface/` (HTTP + contracts) and `behavior/` (agents, skills, tools, events, surfaces) call into services and adapters. `presentation/` is the user-facing UI layer. `assets/` is the DAM. `state/`, `knowledge/`, and `ops/` carry data, docs, and operations respectively; `i18n/` carries string catalogs and `tests/` the cross-layer tests. Each layer has its own `README.md` explaining what goes inside.

## Governed by a standard, not by taste

This repo's layer set is not a convention you may extend. It is fixed by the **Mukadra Domain Standard v1** (`kukamanga/docs/governance/domain-standard-v1.md`), a holdings-wide governance standard of which this repo is the **reference implementation**. The standard declares, per layer, what is required, optional, and forbidden, and it is machine-checked.

**The top-level layer set is closed.** Do not create a top-level directory the standard does not name. `src/`, `lib/`, `utils/`, `common/`, `shared/`, `helpers/`, `core/`, and `docs/` are forbidden at the top level — each already has a home below. Adding a layer requires a version bump of the standard *and* an ADR here (precedent: [ADR 0002](./knowledge/docs/adrs/0002-mcp-and-i18n-layers.md)).

This rule exists because you, the agent reading this, will otherwise invent a plausible layout from your training prior — a different one each session. The mold's entire value is that it is the *same* mold. See [ADR 0003](./knowledge/docs/adrs/0003-external-governance-by-domain-standard.md).

## Hard rules

1. **No absolute paths into sibling repos.** Anything outside this repo is reached through an `adapters/<name>/` wrapper, never by file path. `C:\_DEV\KUKAMANGA\<other-domain>\...` is a carveability violation.
2. **Contracts before tests before implementation.** Write `interface/contracts/*.openapi.yaml` first, then the test that consumes it, then the implementation that satisfies it.
3. **Every external dependency has an adapter.** If you find yourself importing `pg`, `openai`, etc. directly from a service or behavior file, stop. Add `adapters/<name>/` first.
4. **Master stays empty.** If you're tempted to commit working `hello-*` code to master, you're on the wrong branch — switch to `example/hello-world` (or create a new `example/<name>`).
5. **Tools are thin.** A `behavior/tools/<name>` file should be a 5-line wrapper that translates agent-arg-shape into a `services/<name>` call. Business logic lives in services, not tools.

## Naming conventions

- Adapters folders: lowercase-hyphenated by external system (`adapters/postgres/`, `adapters/mukadra-engine/`)
- Service folders: lowercase-hyphenated by domain operation (`services/publish-post/`, `services/hello/`)
- Agent folders: lowercase-hyphenated by agent name (`behavior/agents/hello-agent/`)
- Contract files: `<name>.openapi.yaml` (machine), `<name>.md` (prose) — same base name

## What to read next

- `kukamanga/docs/governance/domain-standard-v1.md` — the standard this repo implements. Read it before adding anything structural.
- [TEMPLATE.md](./TEMPLATE.md) — step-by-step for instantiating
- [domain.yaml](./domain.yaml) — the manifest (mostly empty on `master`)
- Each layer's `README.md` for substructure

## Project-specific instructions

When this template is instantiated for a specific domain, additional instructions go in `.claude/rules/` (referenced from here) — not inlined, so the agent instructions stay generic.
