# ADR 0002 — MCP server registry and localization resource layers

**Status:** Accepted
**Date:** 2026-05-28
**Tracking:** MUK-1942 (parent: MUK-1941)
**Authors:** Joe Pontes, Claude

## Context

The carveable-domain template (this repository's `master` branch) was prototyped on 2026-05-28 with ten top-level layers — `presentation/`, `interface/`, `behavior/`, `services/`, `adapters/`, `state/`, `knowledge/`, `ops/`, `tests/`, plus root manifests (`domain.yaml`, `package.json`, `.mcp.json`). The first proving instance on the `example/hello-world` branch exercises every layer.

Two structural concerns were deferred from the prototype because they were not first-order for `hello-world` but ARE first-order for real customer domains:

1. **MCP server registry.** The root `.mcp.json` is sufficient for wiring a single dev-environment MCP, but real domains need richer affordances — multiple servers, per-server config, versioning, contracts, tests.
2. **Localization (i18n/l10n).** The prototype had no provision for translatable strings or locale-keyed data. Domains serving non-English audiences cannot be built on this template as-is.

This ADR captures the structural placement decision for both layers. The two are decided together because they share a coupling concern — MCP tool descriptions are user-facing strings that need translation, so the i18n layer must be reachable from the MCP layer.

## Decision

### MCP server registry → `interface/mcp/<server>/`

MCP servers live under `interface/` mirroring the existing `interface/api/` pattern.

```
interface/
  api/                       # HTTP transport (existing)
    routes/
    server.js
  mcp/                       # MCP transport (NEW)
    <server-name>/
      server.js              # MCP server entry point
      tools/                 # thin transport handlers; delegate to services/ or behavior/tools/
      package.json           # bin entry for standalone invocation
      README.md
  contracts/                 # existing
    hello.openapi.yaml
    hello.md
    <server-name>.mcp.md     # NEW: prose contract for MCP tool set
```

Tool DEFINITIONS continue to live in `behavior/tools/` (e.g., `behavior/tools/say-hello.js`). The MCP transport handlers under `interface/mcp/<server>/tools/` are thin wrappers that parse the MCP request and delegate to the definition. This matches how `interface/api/routes/` wraps HTTP requests around the same domain operations.

Root `.mcp.json` stays as the dev-environment wiring (Claude Code, etc.) and points at `interface/mcp/<server>/server.js` via relative path. The carveability rule (no absolute paths into sibling repos) is unchanged.

Lifecycle:
* Stdio-launched servers — `package.json` `bin` field is sufficient.
* HTTP-mode servers — start/stop scripts in `ops/mcp/<server>.sh`, matching the `ops/health/check.sh` precedent.

`domain.yaml` declares servers in the manifest:

```yaml
mcp_servers:
  - name: hello-mcp
    source: ./interface/mcp/hello-mcp
    version: 0.1.0
    pinned_at: 2026-05-28
```

Tests at `tests/integration/mcp/<server>.test.js`.

### Localization → split

i18n is split across two homes because "i18n" conflates two concerns with different lifecycles, owners, and tooling:

**String catalogs** — translator-edited, translation-tool-friendly, single tree.

```
i18n/                       # NEW top-level
  README.md
  <locale>/                 # en, es, ja, …
    ui.json                 # loaded by presentation/
    errors.json             # loaded by interface/api/ (error code → message)
    agent.json              # loaded by behavior/agents/ AND surfaced as MCP tool descriptions
```

The single-tree shape matches what gettext, i18next, Fluent, and most other translation toolchains expect. Translators are typically external collaborators; fragmenting the catalog across `presentation/i18n/`, `interface/i18n/`, `behavior/i18n/` was rejected because the structural-purity gain does not outweigh the translator-workflow cost.

**Locale-keyed domain data** — product/legal/finance owners, different cadence than translation, fits existing `state/data/seed/` pattern.

```
state/data/seed/
  <locale>/                 # extends existing convention
    pricing.json
    legal.json
```

`domain.yaml` declares the i18n block:

```yaml
i18n:
  default_locale: en
  supported_locales: [en]   # instance overrides
  resolution: hybrid        # build-time | runtime | hybrid
```

Locale-routing middleware stub at `interface/api/middleware/locale.js` provides the same shape regardless of resolution choice (URL prefix / `Accept-Language` / cookie). The instance picks its policy.

## Consequences

**Positive.**

* Template-consumers see consistent transport-class organization under `interface/` (HTTP and MCP side-by-side).
* MCP tool definitions stay testable in isolation (`behavior/tools/`) and the transport layer is thin and replaceable.
* Translators get a single tree to work in.
* Locale-keyed data does not pollute the translation catalog — different change cadences stay separated.
* MCP tool descriptions can be localized via the same `i18n/<locale>/agent.json` catalog as agent surface strings, closing the cross-layer concern.

**Negative / trade-offs.**

* Two top-level concerns (`interface/mcp/` and `i18n/`) where the prototype had one root `.mcp.json` and no i18n. Mitigation: per-layer READMEs explain the pattern; the proving instance demonstrates minimal use.
* `interface/mcp/<server>/tools/` and `behavior/tools/` look superficially similar to a new reader. The README under `interface/mcp/` must spell out: "transport handlers here are thin; the canonical tool definition lives in `behavior/tools/`."
* `i18n/` is a cross-cutting layer in a template that otherwise organizes by concern. This is a deliberate exception justified by translator-workflow ergonomics.

**Out of scope (deferred).**

* Translation production pipelines (translation memory, vendor integration) — operational for individual domains.
* Multi-tenant per-locale routing infrastructure — instance-level concern.
* Specific MCP server implementations beyond `hello-mcp` — customer domains or factory output own these.

## References

* `interface/README.md` — establishes interface as the inbound boundary; both decisions rely on this framing.
* `state/data/seed/` — existing convention extended by the locale-keyed-data half of the i18n decision.
* `TEMPLATE.md` §4 — the existing `.mcp.json` wiring instructions; unchanged by this ADR.
* MUK-1941 — parent ticket for the carveable-domain template as a product category.
* MUK-1942 — implementation ticket for this ADR.
* 2026-05-28 design conversation — the discussion that produced these decisions.
