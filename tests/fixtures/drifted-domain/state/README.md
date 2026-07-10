# State Layer

The domain's **data**, in three flavors: what shape it has (`data/schemas/`), what content to start with (`data/seed/`), and what runtime accumulates (`data/store/`, `.cko/`).

## Substructure

- **`data/schemas/`** — JSON Schema, SQL DDL, Avro, etc. The shape of every entity this domain owns.
- **`data/seed/`** — fixtures, demo content, reference data. Checked in. Used to bootstrap a fresh instance.
- **`data/store/`** — runtime databases (sqlite, lancedb files, etc.). **Gitignored.** A fresh clone has empty stores; seed fills them.
- **`data/exports/`** — snapshots / backups. **Gitignored** by default.
- **`.cko/`** — CKO's local index (vectors, derived state). **Gitignored.** Populated when CKO runs against this domain's `knowledge/docs/` corpus.

## Where state lives matters for carveability

Two patterns for runtime stores:

1. **In-repo, gitignored** (default here): `state/data/store/` lives inside the domain. When the repo is handed off, the data path moves with it.
2. **External**: `~/.<domain>/` or a managed service.

The template defaults to (1) because it's carveability-friendly: the buyer clones the repo, runs the seed, and has a working store with no extra setup.

## A useful smell

If your code writes to a path outside `state/`, you're leaking runtime state into wherever-the-process-was-started. Either add an adapter (`adapters/fs/`) that constrains writes to `state/`, or move the writes here.
