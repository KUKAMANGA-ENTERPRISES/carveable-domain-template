/**
 * ops/env-check.js — boot-time env validator.
 *
 * Reads `.env.example` for the canonical list of expected keys, then checks
 * that each one appears in `.env`. Errors with a list of missing keys.
 *
 * For hello-world: there are no required env vars (HELLO_GREETING and
 * HELLO_PORT both have defaults), so this script is permissive. A real
 * domain would mark some keys as required.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..");

function keysFromDotenv(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.replace(/^\s*#.*/, "").trim())
    .filter(Boolean)
    .map(line => line.split("=", 1)[0].trim())
    .filter(k => /^[A-Z_][A-Z0-9_]*$/i.test(k));
}

async function main() {
  const examplePath = join(REPO_ROOT, ".env.example");
  const envPath     = join(REPO_ROOT, ".env");

  if (!existsSync(examplePath)) {
    console.log("[env-check] no .env.example — nothing to verify");
    return;
  }

  const expected = keysFromDotenv(await readFile(examplePath, "utf8"));
  if (expected.length === 0) {
    console.log("[env-check] .env.example declares no required keys — ok");
    return;
  }

  if (!existsSync(envPath)) {
    console.warn(`[env-check] missing .env — expected keys: ${expected.join(", ")}`);
    process.exit(0);  // hello-world: warn only. Real domains: process.exit(1).
  }

  const actual = new Set(keysFromDotenv(await readFile(envPath, "utf8")));
  const missing = expected.filter(k => !actual.has(k));
  if (missing.length) {
    console.warn(`[env-check] .env is missing keys: ${missing.join(", ")}`);
    process.exit(0);
  }
  console.log(`[env-check] all ${expected.length} expected keys present`);
}

main().catch(err => { console.error("[env-check] error:", err); process.exit(1); });
