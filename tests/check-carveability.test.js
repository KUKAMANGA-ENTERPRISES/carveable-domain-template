#!/usr/bin/env node
// Regression test for tools/check-carveability.js (JUNE-563 acceptance
// criteria): the checker must PASS on this repo's own master (the mold),
// and must FAIL — with a located, actionable message — on the
// deliberately-drifted fixture. No test framework dependency; this repo
// stays dependency-free by design (see AGENTS.md hard rules).

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const CHECKER = path.join(REPO_ROOT, "tools", "check-carveability.js");
const FIXTURE = path.join(REPO_ROOT, "tests", "fixtures", "drifted-domain");

let failures = 0;

function run(root) {
  try {
    const stdout = execFileSync("node", [CHECKER, root], { encoding: "utf8" });
    return { code: 0, stdout };
  } catch (e) {
    return { code: e.status, stdout: e.stdout || "" };
  }
}

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures += 1;
  } else {
    console.log(`ok: ${message}`);
  }
}

// 1. This repo's own root must pass — a conforming domain is not blocked by
// its own checker. This file runs from both branches: on `master` the root is
// the mold, on `example/<name>` it is an instance. Assert conformance, not a
// particular scope, or the suite breaks the moment it is merged forward.
const rootResult = run(REPO_ROOT);
assert(rootResult.code === 0, "checker exits 0 on this repo's root");
assert(/PASS/.test(rootResult.stdout), "checker prints PASS on this repo's root");

// 2. The deliberately-drifted fixture must fail, and the failure must be
// located and actionable — not a generic "something's wrong".
const fixtureResult = run(FIXTURE);
assert(fixtureResult.code === 1, "checker exits 1 on the drifted fixture");
assert(
  fixtureResult.stdout.includes("agents") && fixtureResult.stdout.includes("§2 closed layer set"),
  "checker locates the misplaced top-level agents/ directory (§2)"
);
assert(
  fixtureResult.stdout.includes("presentation/pages/hero.png"),
  "checker locates the media dumped in presentation/ by its exact path"
);

// 3. Scope detection must read YAML's bare scalar form, not only the
// double-quoted one. Reading only `domain: "x"` silently scopes a filled
// instance as a mold, failing open on every [I] requirement (§3) and on
// §7.1.8. The mold and the drifted fixture both declare `domain: ""`, so
// neither exercises the instance branch — this fixture does.
const bareResult = run(path.join(REPO_ROOT, "tests", "fixtures", "bare-scalar-manifest"));
assert(
  /scope: instance/.test(bareResult.stdout),
  "bare `domain: x` scopes as instance, not mold (§3)"
);
// An [I]-tagged finding proves the instance-only branches actually run. (The
// §5 [I] checks are skipped here because their layers are absent entirely, so
// the drift catalogue's [I] check is the observable one.)
assert(
  /\[I\]\]?\s*ops\/health\/check\.sh/.test(bareResult.stdout),
  "instance-only [I] checks are enforced once scope is instance"
);
// Bare `verified_at: 2026-07-10` must parse as a valid ISO date. If the reader
// misses it, verifiedAt is "" and §7.1.8 reports it as invalid.
assert(
  !/§7\.1\.8/.test(bareResult.stdout),
  "bare `verified_at: <date>` parses as a valid ISO date (§7.1.8)"
);

// 4. A quoted-empty `domain: ""` must still read as mold — the bare-scalar fix
// must not flip an unfilled manifest into instance scope. Asserted against the
// drifted fixture (which declares `domain: ""`) rather than this repo's root,
// so it holds on the mold and on an instance branch alike.
assert(/scope: mold/.test(fixtureResult.stdout), 'quoted-empty `domain: ""` still scopes as mold');

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log("\nAll conformance-checker regression assertions passed.");
