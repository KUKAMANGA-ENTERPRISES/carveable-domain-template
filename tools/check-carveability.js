#!/usr/bin/env node
// Conformance checker for the Mukadra Domain Standard v1
// (kukamanga/docs/governance/domain-standard-v1.md).
//
// One checker that reads the standard — not a script each domain writes for
// itself. Built as JUNE-563. Implements:
//   - §2 / §7.1.7  the closed top-level layer set
//   - §7.1.1-6,8   the referential invariants binding domain.yaml to disk
//   - §5           the per-layer required/forbidden contract
//   - §11          the drift catalogue (the mechanically-checkable smells)
//
// Usage: node tools/check-carveability.js [domain-root]
// Exit code 0 = conforming. Exit code 1 = drift found (every finding below
// is located: file/dir + why + which standard section it violates).

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.argv[2] || ".");

// §12.1 — the major version of the standard this checker implements. There is
// deliberately no shared runtime artifact to import (§4.1: a carve-out must
// not inherit a Holdings dependency); this declaration is how staleness is
// caught instead. Bump it only when this file is actually migrated to a new
// major version of the standard.
const STANDARD_VERSION = "1";

// §2 / §5 — the closed set. Anything else at top level is a violation.
// ".git", ".github", "node_modules", and "tools" are the §2
// platform-scaffolding exemption (explicit as of 2026-07-10): outside the
// layer set, not an extension of it. "tools/" is bounded to standard-serving
// tooling — this checker, the hook installers.
const ALLOWED_TOP_LEVEL_DIRS = new Set([
  "interface", "behavior", "services", "adapters", "presentation",
  "assets", "state", "knowledge", "ops", "i18n", "tests", ".claude",
  ".git", "node_modules", "tools", ".github",
]);

// §6 — root manifests, [M+I] REQUIRED unless noted.
const REQUIRED_ROOT_FILES = [
  "domain.yaml", "package.json", ".mcp.json", "AGENTS.md", "CLAUDE.md",
  ".env.example", ".gitignore", ".gitattributes",
];
const MOLD_ONLY_ROOT_FILES = ["README.md", "TEMPLATE.md"];

// §5 — the layer contract. required/optional are relative subpaths;
// instanceOnlyRequired only applies once scope === "instance".
const LAYERS = {
  "interface": { required: ["README.md", "api", "contracts"], instanceOnlyRequired: [] },
  "behavior": { required: ["README.md", "agents", "skills", "tools", "events", "surfaces"], instanceOnlyRequired: [] },
  "services": { required: ["README.md"], instanceOnlyRequired: [] },
  "adapters": { required: ["README.md"], instanceOnlyRequired: [] },
  "presentation": { required: ["README.md", "pages", "components", "mfes", "styles", "vendor"], instanceOnlyRequired: [] },
  "assets": { required: ["README.md", "asset-pack.json", "media"], instanceOnlyRequired: [] },
  "state": { required: ["README.md", "data/schemas", "data/seed"], instanceOnlyRequired: [] },
  "knowledge": { required: ["README.md", "cko.config.yaml", "docs/adrs", "docs/examples"], instanceOnlyRequired: ["docs/adrs/0001-domain-shape.md"] },
  "ops": { required: ["README.md", "deploy", "health", "runbooks"], instanceOnlyRequired: ["health/check.sh"] },
  "i18n": { required: ["README.md"], instanceOnlyRequired: [] },
  "tests": { required: ["README.md", "integration"], instanceOnlyRequired: [] },
  ".claude": { required: ["README.md", "settings.json", "agents", "skills", "commands", "hooks", "rules"], instanceOnlyRequired: [] },
};

// Media/binary extensions that are FORBIDDEN in presentation/ (§5:
// "brand media" is drift there — assets/ is the DAM, not presentation/).
const MEDIA_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".mp4", ".mov", ".webm",
  ".woff", ".woff2", ".ttf", ".otf", ".ico", ".avif",
]);
// vendor/ holds consumed pre-built bundles which may legitimately embed
// binary assets (icon fonts, etc.) — exempt it from the media-in-presentation
// check; every other presentation/ subdir is this domain's own authored UI.
const PRESENTATION_MEDIA_EXEMPT = new Set(["vendor"]);

const ABSOLUTE_SIBLING_PATH_RE = /[A-Za-z]:[\\/]_DEV[\\/]KUKAMANGA[\\/][^\s"'`]+/;
// Only scanned in code/config files — .md files legitimately quote this
// pattern as documentation of the rule itself (AGENTS.md, TEMPLATE.md, the
// standard) and would otherwise false-positive on their own prose.
const CODE_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", ".yaml", ".yml", ".sh"]);

const findings = [];

function fail(section, location, message) {
  findings.push({ section, location, message });
}

function exists(...segments) {
  return fs.existsSync(path.join(ROOT, ...segments));
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function listFilesRecursive(dir, exclude = new Set(["node_modules", ".git"])) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (exclude.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(listFilesRecursive(full, exclude));
    } else {
      out.push(full);
    }
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

// ---------------------------------------------------------------------------
// §2 / §7.1.7 — the closed top-level layer set
// ---------------------------------------------------------------------------
function checkClosedLayerSet() {
  const entries = fs.readdirSync(ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!ALLOWED_TOP_LEVEL_DIRS.has(entry.name)) {
      fail(
        "§2 closed layer set",
        rel(path.join(ROOT, entry.name)),
        `Top-level directory "${entry.name}/" is not in the standard's closed layer set. ` +
          `Move its contents into the correct layer (see §10 of domain-standard-v1.md), or ` +
          `if this is a genuinely new layer, that requires a version bump of the standard and an ADR — not a commit here.`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// §5 — required layer contents (mold + instance)
// ---------------------------------------------------------------------------
function checkLayerContents(scope) {
  for (const [layer, spec] of Object.entries(LAYERS)) {
    const layerRoot = path.join(ROOT, layer);
    if (!isDir(layerRoot)) {
      fail("§5 layer contract", layer + "/", `Required layer "${layer}/" is missing entirely.`);
      continue;
    }
    for (const req of spec.required) {
      if (!exists(layer, req)) {
        fail("§5 layer contract", `${layer}/${req}`, `Required path missing under "${layer}/".`);
      }
    }
    if (scope === "instance") {
      for (const req of spec.instanceOnlyRequired) {
        if (!exists(layer, req)) {
          fail(
            "§5 layer contract [I]",
            `${layer}/${req}`,
            `Required at instance scope but missing. (Mold legitimately omits this — see §3 mold/instance conformance scopes.)`
          );
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// §6 — root manifests
// ---------------------------------------------------------------------------
function checkRootManifests(scope) {
  for (const f of REQUIRED_ROOT_FILES) {
    if (!exists(f)) {
      fail("§6 root manifests", f, `Required root manifest "${f}" is missing.`);
    }
  }
  if (scope === "mold") {
    for (const f of MOLD_ONLY_ROOT_FILES) {
      if (!exists(f)) {
        fail("§6 root manifests [M]", f, `Required on the mold but missing.`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// domain.yaml scope + naive YAML read for the handful of keys we need.
// (No YAML dependency — the manifest's shape is fixed by §7, so a small
// hand-rolled reader is enough and keeps this checker dependency-free.)
// ---------------------------------------------------------------------------
function readDomainYaml() {
  const p = path.join(ROOT, "domain.yaml");
  if (!fs.existsSync(p)) return null;
  // Strip full-line comments before parsing — domain.yaml's template ships
  // commented-out example blocks (mcp_servers, i18n) that must not be read
  // as live declarations.
  const text = fs
    .readFileSync(p, "utf8")
    .split("\n")
    .filter((line) => !/^\s*#/.test(line))
    .join("\n");

  // Scalars may be written quoted ("x"), single-quoted ('x'), or bare (x) —
  // all three are valid YAML, and an instance naturally writes the bare form.
  // Reading only the quoted form silently yields "" for a filled manifest,
  // which downgrades a real instance to mold scope and fails open on every
  // [I] requirement (§3, §7.1.8).
  function scalar(re) {
    const m = text.match(re);
    if (!m) return "";
    return m[1]
      .replace(/\s+#.*$/, "")
      .trim()
      .replace(/^(["'])([\s\S]*)\1$/, "$2")
      .trim();
  }

  const domain = scalar(/^domain:[ \t]*(.*)$/m);
  const verifiedAt = scalar(/^[ \t]*verified_at:[ \t]*(.*)$/m);

  function listBlock(key) {
    // Matches "  key:\n    - a\n    - b" style YAML lists under a 2-space-indented parent key.
    const re = new RegExp(`^\\s*${key}:\\s*\\n((?:\\s*-.*\\n?)*)`, "m");
    const m = text.match(re);
    if (!m) return [];
    return [...m[1].matchAll(/-\s*"?([^"\n]+?)"?\s*$/gm)].map((x) => x[1].trim()).filter(Boolean);
  }

  return {
    domain,
    verifiedAt,
    services: listBlock("services"),
    contracts: listBlock("contracts"),
    surfaces: listBlock("surfaces"),
    supportedLocales: (text.match(/supported_locales:\s*\[([^\]]*)\]/) || [null, ""])[1]
      .split(",").map((s) => s.trim()).filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// §7.1.1 — depends_on.services ↔ adapters/<name>/
// ---------------------------------------------------------------------------
function checkServiceAdapters(manifest) {
  for (const svc of manifest.services) {
    if (!isDir(path.join(ROOT, "adapters", svc))) {
      fail(
        "§7.1.1",
        `domain.yaml depends_on.services: ${svc}`,
        `Declared service "${svc}" has no matching "adapters/${svc}/" directory.`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// §7.1.2 — exports.contracts paths exist + prose sibling
// ---------------------------------------------------------------------------
function checkContracts(manifest) {
  for (const c of manifest.contracts) {
    const full = path.join(ROOT, c);
    if (!fs.existsSync(full)) {
      fail("§7.1.2", `domain.yaml exports.contracts: ${c}`, `Declared contract path does not exist.`);
      continue;
    }
    const ext = path.extname(c);
    const base = c.slice(0, -ext.length).replace(/\.openapi$|\.schema$/, "");
    const prose = `${base}.md`;
    if (!fs.existsSync(path.join(ROOT, prose))) {
      fail(
        "§7.1.2",
        c,
        `Contract has no prose sibling. Expected "${prose}" alongside it (contracts ship in machine + prose pairs).`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// §7.1.3 — exports.surfaces under behavior/surfaces/
// ---------------------------------------------------------------------------
function checkSurfaces(manifest) {
  for (const s of manifest.surfaces) {
    if (!s.startsWith("behavior/surfaces/") || !fs.existsSync(path.join(ROOT, s))) {
      fail(
        "§7.1.3",
        `domain.yaml exports.surfaces: ${s}`,
        `Declared surface must exist under "behavior/surfaces/".`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// §7.1.4 — mcp_servers[].source exists + name is a key in .mcp.json
// ---------------------------------------------------------------------------
function checkMcpServers(manifestText) {
  const mcpServersBlock = manifestText.match(/^mcp_servers:\s*\n((?:\s+-[\s\S]*?)(?=\n\S|\n*$))/m);
  if (!mcpServersBlock) return;
  const entries = [...mcpServersBlock[1].matchAll(/name:\s*([^\n#]+)[\s\S]*?source:\s*([^\n#]+)/g)];
  if (entries.length === 0) return;

  let mcpJson = {};
  const mcpJsonPath = path.join(ROOT, ".mcp.json");
  if (fs.existsSync(mcpJsonPath)) {
    try {
      mcpJson = JSON.parse(fs.readFileSync(mcpJsonPath, "utf8"));
    } catch {
      fail("§7.1.4", ".mcp.json", "File is not valid JSON.");
      return;
    }
  }
  const servers = mcpJson.mcpServers || {};

  for (const [, name, source] of entries) {
    const n = name.trim();
    const src = source.trim();
    if (!fs.existsSync(path.join(ROOT, src))) {
      fail("§7.1.4", `domain.yaml mcp_servers: ${n}`, `Declared source "${src}" does not exist.`);
    }
    if (!(n in servers)) {
      fail("§7.1.4", `domain.yaml mcp_servers: ${n}`, `"${n}" is not a key in ".mcp.json" mcpServers.`);
    }
  }
}

// ---------------------------------------------------------------------------
// §7.1.5 — i18n.supported_locales → i18n/<locale>/{ui,errors,agent}.json
// ---------------------------------------------------------------------------
function checkI18n(manifest) {
  for (const locale of manifest.supportedLocales) {
    for (const scope of ["ui", "errors", "agent"]) {
      const p = `i18n/${locale}/${scope}.json`;
      if (!exists(p)) {
        fail("§7.1.5", p, `Locale "${locale}" is declared in domain.yaml but "${p}" is missing.`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// §7.1.6 — no tracked file contains an absolute path into a sibling repo
// (scoped to code/config files; .md files may legitimately quote the
// pattern as documentation of the rule itself)
// ---------------------------------------------------------------------------
function checkNoAbsoluteSiblingPaths() {
  for (const file of listFilesRecursive(ROOT)) {
    const ext = path.extname(file);
    if (!CODE_EXTENSIONS.has(ext)) continue;
    if (rel(file).startsWith("tools/")) continue; // this checker's own source may reference the pattern
    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue; // binary file
    }
    // Strip full-line comments first — config files (domain.yaml, .mcp.json
    // via "_note") legitimately quote this exact forbidden pattern as
    // documentation of the rule, same as the .md files this check already
    // excludes wholesale.
    const commentRe = [".yaml", ".yml", ".sh"].includes(ext) ? /^\s*#/ : /^\s*(\/\/|\*)/;
    const scannable = content
      .split("\n")
      .filter((line) => !commentRe.test(line))
      .join("\n");
    const m = scannable.match(ABSOLUTE_SIBLING_PATH_RE);
    if (m) {
      fail(
        "§7.1.6",
        rel(file),
        `Contains an absolute path into a sibling repo ("${m[0]}"). Reach it through an "adapters/<name>/" wrapper instead.`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// §7.1.8 [I] — carveability.verified_at is a valid ISO date
// ---------------------------------------------------------------------------
function checkCarveabilityVerifiedAt(manifest, scope) {
  if (scope !== "instance") return;
  if (!manifest.verifiedAt || Number.isNaN(Date.parse(manifest.verifiedAt))) {
    fail(
      "§7.1.8 [I]",
      "domain.yaml carveability.verified_at",
      `Must be a valid ISO date once the domain is instance-scope (non-empty "domain:"). Found: "${manifest.verifiedAt}"`
    );
  }
}

// ---------------------------------------------------------------------------
// §5 presentation/ forbidden content — brand media does not belong here,
// it belongs in assets/media/ (DAM). This is the ticket's own drift example.
// ---------------------------------------------------------------------------
function checkNoMediaInPresentation() {
  const presRoot = path.join(ROOT, "presentation");
  if (!isDir(presRoot)) return;
  for (const file of listFilesRecursive(presRoot)) {
    const relPath = rel(file);
    const topSubdir = relPath.split("/")[1];
    if (PRESENTATION_MEDIA_EXEMPT.has(topSubdir)) continue;
    if (MEDIA_EXTENSIONS.has(path.extname(file).toLowerCase())) {
      fail(
        "§5 presentation/ forbidden",
        relPath,
        `Brand media does not belong in "presentation/". Move it to "assets/media/" and bind it via "assets/asset-pack.json".`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// §11 drift catalogue — mechanically-checkable smells
// ---------------------------------------------------------------------------
function checkDriftCatalogue(scope) {
  // "A `tools/` file exceeds ~30 lines" → hosting logic that belongs in services/.
  const toolsDir = path.join(ROOT, "behavior", "tools");
  if (isDir(toolsDir)) {
    for (const file of listFilesRecursive(toolsDir)) {
      if (path.basename(file) === ".gitkeep") continue;
      const lines = fs.readFileSync(file, "utf8").split("\n").length;
      if (lines > 30) {
        fail(
          "§11 drift catalogue",
          rel(file),
          `"behavior/tools/" file is ${lines} lines (>~30). It is likely hosting logic that belongs in "services/" — tools should be thin wrappers.`
        );
      }
    }
  }

  // "asset-pack.json computes anything" → must be inert JSON, never JS.
  const assetPack = path.join(ROOT, "assets", "asset-pack.json");
  if (fs.existsSync(assetPack)) {
    try {
      JSON.parse(fs.readFileSync(assetPack, "utf8"));
    } catch (e) {
      fail(
        "§11 drift catalogue",
        "assets/asset-pack.json",
        `Not valid JSON (${e.message}). An asset binding must be inert data, never a renderer.`
      );
    }
  }

  if (scope === "instance") {
    // "ops/health/check.sh is absent or tests nothing real"
    const healthCheck = path.join(ROOT, "ops", "health", "check.sh");
    if (!fs.existsSync(healthCheck) || fs.readFileSync(healthCheck, "utf8").trim().length === 0) {
      fail(
        "§11 drift catalogue [I]",
        "ops/health/check.sh",
        `Missing or empty. The domain is operable only by its author until this exists.`
      );
    }

    // "tests/integration/ is empty while services/ is not"
    const servicesNonEmpty = listFilesRecursive(path.join(ROOT, "services")).some(
      (f) => path.basename(f) !== ".gitkeep" && path.basename(f) !== "README.md"
    );
    const adaptersNonEmpty = listFilesRecursive(path.join(ROOT, "adapters")).some(
      (f) => path.basename(f) !== ".gitkeep" && path.basename(f) !== "README.md"
    );
    const integrationDir = path.join(ROOT, "tests", "integration");
    const integrationNonEmpty = listFilesRecursive(integrationDir).some((f) => path.basename(f) !== ".gitkeep");
    if ((servicesNonEmpty || adaptersNonEmpty) && !integrationNonEmpty) {
      fail(
        "§11 drift catalogue [I]",
        "tests/integration/",
        `Empty while "services/" or "adapters/" is populated. Cross-layer behavior is unverified.`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
function main() {
  if (!fs.existsSync(ROOT) || !isDir(ROOT)) {
    console.error(`Domain root does not exist: ${ROOT}`);
    process.exit(2);
  }

  const manifest = readDomainYaml();
  if (!manifest) {
    fail("§6 root manifests", "domain.yaml", "Required root manifest is missing entirely — cannot check referential invariants.");
  }
  const scope = manifest && manifest.domain ? "instance" : "mold";

  checkClosedLayerSet();
  checkLayerContents(scope);
  checkRootManifests(scope);
  checkNoMediaInPresentation();
  checkNoAbsoluteSiblingPaths();
  checkDriftCatalogue(scope);

  if (manifest) {
    const manifestText = fs.readFileSync(path.join(ROOT, "domain.yaml"), "utf8");
    checkServiceAdapters(manifest);
    checkContracts(manifest);
    checkSurfaces(manifest);
    checkMcpServers(manifestText);
    checkI18n(manifest);
    checkCarveabilityVerifiedAt(manifest, scope);
  }

  console.log(`Mukadra Domain Standard conformance check — standard v${STANDARD_VERSION}, scope: ${scope}`);
  console.log(`Root: ${ROOT}\n`);

  if (findings.length === 0) {
    console.log("PASS — no drift found.");
    process.exit(0);
  }

  console.log(`FAIL — ${findings.length} finding(s):\n`);
  for (const f of findings) {
    console.log(`  [${f.section}] ${f.location}`);
    console.log(`    ${f.message}\n`);
  }
  process.exit(1);
}

main();
