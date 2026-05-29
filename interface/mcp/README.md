# interface/mcp/

MCP transport layer for this domain. Mirrors `interface/api/` — HTTP gets `api/`, MCP gets `mcp/`.

## What lives here

Tool DEFINITIONS live in `behavior/tools/`. The handlers here are thin transport wrappers: parse the MCP request, call the definition, return the result in MCP response shape. The same relationship as `interface/api/routes/` → `services/`.

## Per-server convention

Each MCP server gets its own folder:

```
interface/mcp/<server-name>/
  server.js      # MCP server entry point; wires the stdio (or HTTP) transport
  tools/         # thin handlers that delegate to behavior/tools/ or services/
  package.json   # "bin" entry so the server is launchable standalone
  README.md      # one paragraph: what this server exposes and who it's for
```

## Contracts

Prose contracts live alongside the existing HTTP contracts:

```
interface/contracts/
  hello.openapi.yaml          # HTTP contract (existing)
  hello.md                    # HTTP prose (existing)
  <server-name>.mcp.md        # MCP prose contract (NEW per server)
```

Document: tool names, argument shapes, return shapes, error modes, and breaking-change history.

## Root .mcp.json

The root `.mcp.json` is dev-environment wiring (Claude Code, Cursor, etc.). Its entries point at `interface/mcp/<server>/server.js` via **relative path**. Absolute paths into sibling repos (e.g. `C:/_DEV/KUKAMANGA/...`) are a carveability violation — they make the domain non-portable. Cross-reference `TEMPLATE.md` §4.

## Lifecycle

- **Stdio-launched servers** — `package.json` `bin` field is sufficient; no separate ops script needed.
- **HTTP-mode servers** — add start/stop scripts at `ops/mcp/<server>.sh`, matching the `ops/health/check.sh` precedent.

## What NOT to put here

Per-server instance subfolders (`interface/mcp/<server>/`) are **instance content**, not template scaffold. The master template ships only this README. Instances add their server folders on top. See `TEMPLATE.md` §"What NOT to put in the template".
