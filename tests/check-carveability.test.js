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

// 1. The mold (this repo's own root) must pass — a conforming domain is not
// blocked by its own checker.
const moldResult = run(REPO_ROOT);
assert(moldResult.code === 0, "checker exits 0 on the mold (repo root)");
assert(/PASS/.test(moldResult.stdout), "checker prints PASS on the mold");

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

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log("\nAll conformance-checker regression assertions passed.");
