# Contract: hello-mcp

MCP tool surface for the hello-world domain.

## Tools

### `say_hello`

Return a greeting in the specified locale.

**Arguments**

| Field    | Type   | Required | Default | Description                               |
|----------|--------|----------|---------|-------------------------------------------|
| `locale` | string | no       | `"en"`  | BCP 47 language tag (`en`, `es`, `ja`, …) |

**Return**

On success: an MCP result with one text content block containing the greeting string.

```json
{
  "content": [{ "type": "text", "text": "Hello, world" }]
}
```

**Error modes**

| Code                    | When                                                          |
|-------------------------|---------------------------------------------------------------|
| `locale_not_supported`  | No catalog file exists at `i18n/<locale>/ui.json`             |

Error response shape (`isError: true`):

```json
{
  "content": [{ "type": "text", "text": "Error: locale_not_supported" }],
  "isError": true
}
```

## Breaking-change history

_None — initial contract._
