# Adapters Layer

The **outbound boundary** — every external system wrapped behind a domain-shaped interface.

## Structure

One folder per external system: `adapters/<system-name>/`. Inside:

- `index.js` — the public adapter API the rest of the domain calls
- `tests/` — contract tests against the real system (or a record/replay fixture)
- (optional) `client.js`, `mappers.js`, etc. — implementation details

Examples:

```
adapters/
  postgres/         wraps the Postgres driver — exposes `db.posts.insert()` etc.
  runsnative-shell/ wraps the RN shell runtime
  mukadra-engine/   wraps Mukadra engine HTTP API
  llm/              wraps the LLM provider
  fs/               wraps file-system access
```

## What an adapter does

- Knows the protocol of one external system (SQL, HTTP, gRPC, file I/O)
- Exposes a **domain-shaped** API to the rest of the codebase (`db.posts.insert(post)` not `pg.query("INSERT INTO posts ...")`)
- Knows nothing about the domain (a `postgres` adapter shouldn't know what a "post" is — but the `db.posts` namespace can be domain-named because the adapter is per-domain)

## Why this matters

Adapters are the lever for carveability. When the domain is handed off, the buyer rewrites adapters and nothing else. If services or tools imported the external SDK directly, every layer would need rewriting.

## Carveability check

Every external dependency listed in `domain.yaml` under `depends_on.services` must have a matching `adapters/<name>/` folder. A `tools/check-carveability.js` script can enforce this.

## A useful smell

If an adapter's public API uses primitives from the external SDK (`pgResult`, `RNShellInstance`), you've leaked the implementation. The adapter's API should be plain domain types only.
