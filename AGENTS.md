# Agent Instructions

This is the canonical instructions file for all agentic IDEs (Claude Code, Codex, Cursor, etc.). `CLAUDE.md` and any other IDE-specific files are thin pointers to this file.

## What this repo is

A **carveable-domain template** — the empty mold for a Kukamanga-style domain. See [README.md](./README.md) for the high-level pitch and [TEMPLATE.md](./TEMPLATE.md) for how to instantiate.

## What you're working with

- **Master branch is the template.** It must stay empty of instance-specific content. Working code goes on `example/<name>` branches.
- **`example/hello-world`** is the proving instance. It demonstrates that every layer can be filled with something real.
- **The diff `master..example/hello-world` is the contract** — that's what every instance commits to add on top of the mold.

## Architecture in one paragraph

The domain is a hexagon: `services/` is the inside (domain operations), `adapters/` is the outside boundary (every external system wrapped). `interface/` (HTTP + contracts) and `behavior/` (agents, skills, tools, events, surfaces) call into services and adapters. `presentation/` is the user-facing UI layer. `state/`, `knowledge/`, and `ops/` carry data, docs, and operations respectively. Each layer has its own `README.md` explaining what goes inside.

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

- [TEMPLATE.md](./TEMPLATE.md) — step-by-step for instantiating
- [domain.yaml](./domain.yaml) — the manifest (mostly empty on `master`)
- Each layer's `README.md` for substructure

## Project-specific instructions

When this template is instantiated for a specific domain, additional instructions go in `.claude/rules/` (referenced from here) — not inlined, so the agent instructions stay generic.
