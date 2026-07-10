# Operations Layer

How to **run** this domain. Carveable means handover-able means operable by someone who didn't build it.

## Substructure

- **`health/check.sh`** — one-command health check. Exit 0 = green. Used by `npm run health` and by CI. Should cover: env vars present, adapters reachable, schemas valid, store accessible.
- **`deploy/`** — deployment manifests (Dockerfile, k8s YAML, systemd unit, NSSM config — whatever the domain ships on).
- **`runbooks/`** — ops procedures. One file per scenario: "service won't start", "store corrupted", "rotate the LLM API key". Written for the on-call who isn't the author.
- **`env-check.js`** — boot-time validator. Reads `.env.example` and errors if any key is missing from `.env`. The cheapest carveability win — env-var drift trips every handover.

## Why operations is a layer, not docs

Operations is **code**, not prose. Runbooks have prose, but health checks, env validators, and deploy manifests are executable. Burying them under `docs/operations/` makes them rot; promoting them to `ops/` puts them in the hot path of normal use.

## A useful smell

If `ops/health/check.sh` doesn't exist or doesn't actually test the things that fail in production, the domain isn't operable by anyone but the author. That's not carveable.
