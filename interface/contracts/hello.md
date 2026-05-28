# Hello API Contract

## Purpose

The smallest possible end-to-end contract — one GET endpoint that traverses every layer of the domain. The reason it exists isn't the greeting; it's that "did the request reach the adapter?" is verifiable from the response shape.

## Endpoint

`GET /api/hello?name=<string>` → `200 application/json`

```json
{
  "greeting": "Hello, world",
  "source": "echo"
}
```

The machine-readable form lives in [hello.openapi.yaml](./hello.openapi.yaml).

## Why two fields, not one

A naive contract is `{ "greeting": "Hello, world" }` — but that's satisfiable by a route that hardcodes the string. The `source` field forces the route to actually invoke a service which actually invokes an adapter. If `source` is missing, the route short-circuited the layer chain.

## Layer trace

```
GET /api/hello?name=world
  → interface/api/routes/hello.js
    → services/hello/index.js          (composes the greeting)
      → adapters/echo/index.js         (returns the prefix + records source)
    ← { greeting: "Hello, world", source: "echo" }
  ← 200 application/json
```

## Breaking changes

This contract is **0.x** — instance content, not template. A real production domain would track breaking changes here with dates and migration notes.
