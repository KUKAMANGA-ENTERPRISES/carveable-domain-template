/**
 * tests/integration/hello.test.js — cross-layer test for hello-world.
 *
 * Boots the server in-process, hits /api/hello, and verifies the response
 * matches the contract shape (greeting + source: 'echo').
 *
 * Run with: `node --test tests/integration/hello.test.js`
 *
 * Uses node's built-in test runner — zero deps, true to the instance's
 * zero-dep posture.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { server } from "../../interface/api/server.js";

let baseUrl;

test.before(async () => {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(() => new Promise(resolve => server.close(resolve)));

test("GET /api/hello returns greeting + source from adapter", async () => {
  const r = await fetch(`${baseUrl}/api/hello?name=integration`);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "application/json");

  const body = await r.json();
  assert.equal(body.greeting, "Hello, integration",
    "greeting must compose adapter prefix with query name");
  assert.equal(body.source, "echo",
    "source must equal 'echo' — proves request reached adapter layer");
});

test("GET /api/hello with no name defaults to 'world'", async () => {
  const r = await fetch(`${baseUrl}/api/hello`);
  const body = await r.json();
  assert.equal(body.greeting, "Hello, world");
});

test("GET / serves the landing page", async () => {
  const r = await fetch(`${baseUrl}/`);
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /text\/html/);
});

test("GET /presentation/pages/hello.html is reachable", async () => {
  const r = await fetch(`${baseUrl}/presentation/pages/hello.html`);
  assert.equal(r.status, 200);
});

test("Static allowlist blocks internal layers", async () => {
  // services/, adapters/, interface/api/ are explicitly internal —
  // exposing them over HTTP would defeat the hexagonal boundary.
  for (const path of [
    "/services/hello/index.js",
    "/adapters/echo/index.js",
    "/interface/api/server.js",
    "/.env.example",
    "/package-lock.json",
  ]) {
    const r = await fetch(`${baseUrl}${path}`);
    assert.equal(r.status, 404, `${path} must 404 — internal layer must not leak`);
  }
});

test("Conventions files ARE served (linked from landing page)", async () => {
  for (const path of ["/README.md", "/AGENTS.md", "/TEMPLATE.md", "/CLAUDE.md", "/domain.yaml"]) {
    const r = await fetch(`${baseUrl}${path}`);
    assert.equal(r.status, 200, `${path} should be reachable`);
  }
});
