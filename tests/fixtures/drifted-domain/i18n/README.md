# i18n/

String catalogs for this domain. One folder per locale, three scope files per locale.

## Convention

```
i18n/
  <locale>/          # BCP 47 language tag: en, es, ja, pt-BR, …
    ui.json          # loaded by presentation/ — labels, headings, button text
    errors.json      # loaded by interface/api/ — error code → human message
    agent.json       # loaded by behavior/agents/ AND surfaced as MCP tool descriptions
```

Keys use dot-separated namespaces: `hello.greeting`, `auth.error.invalid_token`.

## Who edits what

- `ui.json` and `errors.json` — translators (external collaborators, translation tooling)
- `agent.json` — translators + product owners (tool descriptions visible to LLMs must be accurate, not just grammatical)

## Why a single tree

Fragmented alternatives (`presentation/i18n/`, `interface/i18n/`, `behavior/i18n/`) were considered and rejected: the structural-purity gain does not outweigh the translator-workflow cost. Translation toolchains (gettext, i18next, Fluent) expect a single tree they can scan. See ADR 0002.

## Locale-keyed domain DATA is different

Pricing per market, jurisdiction-specific legal copy, per-locale product catalogs — these do NOT live here. They live under `state/data/seed/<locale>/` because:

- Different owner: product/legal/finance, not translation team
- Different cadence: release-driven, not translation-sprint-driven
- Different tooling: version-controlled alongside schemas, not in a translation memory

Cross-reference `state/data/seed/` and ADR 0002.

## What NOT to put here

Per-locale folders (`i18n/<locale>/`) are **instance content**, not template scaffold. The master template ships only this README. Instances add their locale folders on top. See `TEMPLATE.md` §"What NOT to put in the template".
