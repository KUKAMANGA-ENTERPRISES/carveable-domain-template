# Behavior Layer

Everything an **agent** orchestrates. Behavior calls into `services/` and `adapters/` — it does not implement domain logic itself.

## Substructure

- **`agents/<name>/`** — agent compositions. Each has a `manifest.yaml` declaring the skills/tools it uses, the surfaces it exposes, and what it's responsible for. Unit tests co-located under `tests/`.
- **`skills/<name>/`** — reusable bundles of capability. A skill is a prompt + a recipe for using tools/services. One folder per skill.
- **`tools/<name>.js`** — deterministic functions agents can call. **Tools must be thin** — typically a 5-line wrapper that calls a `services/<op>`. Business logic does NOT live here.
- **`events/<name>.js`** — domain runtime event handlers. Fired on lifecycle events (job complete, document changed, schedule tick). Not to be confused with Claude Code lifecycle hooks (which live in `.claude/hooks/`).
- **`surfaces/<name>.html`** (or `.js`) — agent-facing endpoints. The "doors" agents knock on to interact with this domain. Distinct from `interface/api/` (which is for system-to-system).

## Why tools are thin

If tools accrete business logic, agents become uncomposable — every agent's tools have hidden domain semantics. Push the logic into `services/` and tools become a thin translation between agent-arg-shape and service-call-shape. Then any agent can compose any service through any tool.

## A useful smell

If a tool file is longer than 30 lines, it's probably hosting logic that should be in `services/`.
