# Interface Layer

The domain's **inbound boundary**. Two things live here: the HTTP surface (`api/`) and the contracts that surface promises to honor (`contracts/`).

## Substructure

- **`api/`** — thin HTTP routes. A route's job is: parse request → call `services/<op>` → format response. **No business logic.** Sub-folder `api/routes/` for individual route handlers.
- **`contracts/`** — the carveability boundary. Two forms of the same agreement:
  - **Machine-readable**: `<name>.openapi.yaml` for HTTP APIs, `<name>.schema.json` for event payloads. CI can verify these.
  - **Prose**: `<name>.md` with rationale, examples, breaking-change history. Humans read these.

The same base name links the two: `hello.openapi.yaml` ↔ `hello.md`.

## Why contracts are first-class

Contracts are what survives a carve-out. The buyer of a domain inherits the *contracts*, not the implementation. If contracts are buried in `docs/`, they get treated like prose — they rot. Promoted to `interface/contracts/`, they're the unit of versioning.

## A useful smell

If a contract changes and no implementation file changes, you've broken a promise. If an implementation file changes and no contract file changes, you may have made an undocumented promise. CI should flag both.
