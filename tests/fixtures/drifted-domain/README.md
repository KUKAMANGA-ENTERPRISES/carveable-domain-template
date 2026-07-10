# Fixture: deliberately-drifted domain

Not a real domain — a snapshot of the mold with two violations injected on
purpose, so `tools/check-carveability.js`'s pass/fail behavior has a
regression test instead of only a manual demo. Consumed by
`tests/check-carveability.test.js`.

The two violations, matching JUNE-563's acceptance criteria verbatim:

1. **`agents/rogue-agent/`** — an agent manifest at a top-level `agents/`
   directory instead of `behavior/agents/rogue-agent/`. Violates §2 (the
   closed top-level layer set).
2. **`presentation/pages/hero.png`** — brand media dumped in `presentation/`
   instead of `assets/media/`. Violates the §5 layer table's forbidden
   column for `presentation/`.

Do not "fix" these — they exist to stay broken.
