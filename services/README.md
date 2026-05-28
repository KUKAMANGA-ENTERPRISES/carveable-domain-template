# Services Layer

The **domain operations** — the inside of the hexagon. A service knows the domain; it doesn't know HTTP, agents, or external SDKs.

## Structure

One folder per operation: `services/<operation-name>/`. Inside:

- `index.js` (or `.ts`, `.py`) — the operation
- `tests/` — co-located unit tests (services should be testable in isolation, with adapters mocked)

## What a service looks like

A service composes **adapters** to do real work. Pattern:

```js
// services/publish-post/index.js
import { db } from "../../adapters/postgres/index.js";
import { search } from "../../adapters/lancedb/index.js";

export async function publishPost({ title, body, author }) {
  const post = await db.posts.insert({ title, body, author });
  await search.index({ id: post.id, text: `${title}\n${body}` });
  return post;
}
```

Notice: no `import express` (HTTP belongs to `interface/api/`), no `import { Client } from 'pg'` (Postgres belongs to `adapters/postgres/`), no agent-specific argument shape (that's `behavior/tools/`).

## Why it matters for carveability

When a domain is sold, the buyer might swap Postgres for their own DB. They re-implement `adapters/postgres/index.js`; `services/publish-post/` is untouched. That's the hexagon working: the inside doesn't know about the outside.

## A useful smell

If a service file imports anything outside this repo other than via `../adapters/`, you've leaked an external dependency into domain logic. Add an adapter first.
