# Tests (Cross-Layer)

Only **cross-layer** tests live here. Unit tests are co-located with the code they test (`services/<name>/tests/`, `behavior/agents/<name>/tests/`, etc.).

## Substructure

- **`integration/`** — end-to-end flows that touch multiple layers. Example: "POST /hello reaches the service, the service calls the adapter, the adapter returns expected data, the response shape matches the contract."

## Testing discipline (carried from KUKAMANGA conventions)

1. **Baseline tests before coding.** Run the suite *before* editing to distinguish pre-existing failures from regressions.
2. **Adversarial alongside behavioral.** For each success criterion, test what should NOT happen.
3. **Integration tests are required, not optional**, for tools/skills/jobs/agents — the modal failure with unit-only coverage is "all tests pass, live API rejects the query."
4. **Read sibling tests first** before writing new ones. Copy patterns; don't invent.

## A useful smell

If `tests/integration/` is empty but `services/` and `adapters/` aren't, you have unit-test green covering layer-isolated behavior — the cross-layer is unverified.
