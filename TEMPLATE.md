# How to instantiate this template

This template is the empty mold. To create a real domain from it, do the following.

## 1. Clone or fork

Either GitHub's "Use this template" or `git clone` this repo and `git checkout -b your-domain` from `master`.

## 2. Fill in `domain.yaml`

The manifest declares ownership, dependencies, and what your domain exposes. At minimum:

```yaml
domain: <your-domain-name>
owner_entity: <runsnative | mukadra | himitsu-bako | new-customer-entity>
exports:
  contracts: []   # list interface/contracts/*.openapi.yaml files
  events: []      # list interface/contracts/*.schema.json event payloads
depends_on:
  runtime: []     # npm packages your domain consumes (e.g. "runsnative")
  services: []   # external services you talk to (each must have an adapters/<name>/ folder)
```

## 3. Rename `package.json`

Update `name`, `version`, and `description`.

## 4. Wire MCP servers (optional)

If your domain uses MCP servers, edit `.mcp.json`. **Never** put absolute paths to sibling repos here — paths must be relative or resolvable from `node_modules/`.

## 5. Fill the layers

Each top-level folder has its own `README.md` explaining what goes inside. The rough order:

1. **`interface/contracts/`** — start here. Write the OpenAPI/JSON-Schema for what your domain promises. Contracts before tests before implementation.
2. **`adapters/`** — for every external system you depend on, create a folder that wraps it. The rest of your code never touches the external SDK directly.
3. **`services/`** — domain operations. Each service composes adapters to do real work.
4. **`interface/api/`** — thin HTTP layer over services.
5. **`behavior/`** — agents, skills, tools, events, surfaces. These also call services and adapters.
6. **`presentation/`** — pages, owned `components/`, MFEs, styles. UI consumers of the API.
7. **`assets/`** — brand media (DAM): the `asset-pack.json` manifest + the media it points at. Only if the domain owns media.
8. **`knowledge/docs/`** — record ADRs as you go. CKO will index this once wired.
9. **`ops/`** — health check, env validator, deploy.
10. **`tests/integration/`** — cross-layer flows. Unit tests live next to the code they test.

## 6. Verify carveability

Before considering the domain "shipped":

- [ ] Every external dependency listed in `domain.yaml` has a matching `adapters/<name>/` folder
- [ ] No file in the repo contains an absolute path into a sibling repo (`C:\_DEV\KUKAMANGA\<other-domain>` etc.)
- [ ] `.mcp.json` paths are relative or `node_modules/`-resolvable
- [ ] `ops/health/check.sh` passes
- [ ] `tests/integration/` passes
- [ ] `knowledge/docs/adrs/0001-domain-shape.md` exists

A `tools/check-carveability.js` script can mechanize most of these — write it as your domain matures.

## What NOT to put in the template

If you find yourself wanting to add a feature to the template, ask: would *every* domain need this? If not, it's instance content. Examples of things that belong on `example/<name>` branches, not `master`:

- Working `hello-world` implementations
- Specific component bundles
- Filled-in `domain.yaml`
- Specific MCP server wiring

The template stays empty so that each instance adds only what its domain actually needs.
