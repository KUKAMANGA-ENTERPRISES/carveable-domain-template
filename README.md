# hello-world · carveable-domain instance

This is the **proving instance** for the carveable-domain template. Every layer of the template gets exercised here by minimal-but-real code. If this instance runs end-to-end, the template is at least adequate; if any layer can't be filled with something working, the template has a hole.

> Master branch is the template. This branch (`example/hello-world`) is the material that proves it.

This branch is an **instance** of the Mukadra Domain Standard v1 (`kukamanga/docs/governance/domain-standard-v1.md`); `master` is the mold. The standard is normative, and `tools/check-carveability.js` enforces it — `npm run check-carveability` must exit 0 here at *instance* scope (§3).

## Run

```bash
npm install            # resolves runsnative from in-repo tarball; no network needed
npm start              # → http://127.0.0.1:8910/
npm test               # integration tests + conformance check; zero deps
npm run health         # ops/health/check.sh — exits 0 if all layers respond
```

## Layout — what's in each layer for this instance

| Layer | What's here |
|---|---|
| **presentation** | Landing page (`index.html`), hello page (live API call), RunsNative variants/bundle-test demos, shared site CSS, brand tokens, vendored bundles; `components/hw-brand-mark.js` — the domain's own owned component, rendering the DAM's mark |
| **assets** | `media/brand/mark.svg` + `asset-pack.json` binding `brand.mark` → that path. Inert data: the pack says *where*, `hw-brand-mark` says *how* |
| **interface** | Zero-dep Node HTTP server + `/api/hello` route; OpenAPI + prose contracts |
| **behavior** | `hello-agent` composing `hello-skill` + `say_hello` tool; `on-startup` event; agent surface page |
| **services** | `hello/index.js` — composes adapters/echo to produce a greeting |
| **adapters** | `echo/index.js` — wraps "greeting prefix source" (an env var) behind a domain-shaped API |
| **state** | Empty (hello-world is stateless) |
| **knowledge** | ADR 0001 (why this shape) + walkthrough + cko.config.yaml |
| **ops** | `health/check.sh` (per-layer probes), `env-check.js` |
| **i18n** | `en/` + `es/`, three scope files each: `ui.json`, `errors.json` (the 403/404/500 the server actually emits), `agent.json` (the `say_hello` tool description) |
| **tests** | `integration/hello.test.js` — boots the server, hits the API, verifies layer trace; `check-carveability.test.js` — conformance regression |

## The full layer trace

```
browser → GET /presentation/pages/hello.html
        → fetch /api/hello?name=world
        → interface/api/server.js
        → interface/api/routes/hello.js
        → services/hello/index.js              ← composes the greeting
        → adapters/echo/index.js               ← supplies the prefix + source
       ← { greeting: "Hello, world", source: "echo" }
```

The `source: "echo"` field is the trace marker. If you see it in the response, the request actually reached the adapter — not a hardcoded short-circuit at the route.

## Carveability properties demonstrated

1. **Zero absolute paths into sibling repos** — all imports are repo-relative or `node_modules/`-resolvable
2. **Every external dependency has an adapter** — `runsnative` ships in `node_modules/`; `process.env.HELLO_GREETING` is wrapped by `adapters/echo/`
3. **Brand is domain-owned** — `presentation/styles/tokens.css` is the swap point for retheming
4. **The HTTP layer is replaceable** — `services/hello/sayHello()` works without the server running
5. **Zero runtime deps beyond `runsnative`** — the server, tests, env-check, and health probe all use Node built-ins

## What's NOT in this instance

The template has affordances this instance doesn't exercise. They're future-instance work:

- Persistent state (Postgres + LanceDB adapters, schemas, seed)
- Multi-skill / multi-tool agents
- CKO surface (the structure is reserved in `state/.cko/` + `knowledge/cko.config.yaml`)
- A non-runsnative `owner_entity`

See [knowledge/docs/adrs/0001-domain-shape.md](./knowledge/docs/adrs/0001-domain-shape.md) for the rationale.

## Re-rooted to the template

For the template's pitch and instantiation steps, see [TEMPLATE.md](./TEMPLATE.md) on the `master` branch. The diff `git diff master..example/hello-world` shows precisely what an instance adds.
