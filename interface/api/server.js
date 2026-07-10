/**
 * hello-world HTTP server.
 *
 * Hosts:
 *   GET  /                        → root index.html (landing page)
 *   GET  /api/hello[?name=]       → the hello service
 *   GET  /presentation/...        → pages, styles, vendored bundles
 *   GET  /node_modules/runsnative/... → installed UI package (importmap needs this)
 *
 * Pure Node — no Express, no deps. Zero-dep is a feature: the instance
 * is verifiable carveability — `npm install` only pulls the runsnative
 * package; nothing else needs to be on the box to run the server.
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, relative, sep, extname } from "node:path";

import { handleHello } from "./routes/hello.js";
import { localeMiddleware } from "./middleware/locale.js";

const setLocale = localeMiddleware("en");

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..");

const PORT = Number.parseInt(process.env.HELLO_PORT ?? "8910", 10);

// Allow-list of path prefixes + exact files the server will serve.
// Anything else returns 404. Internal layers (services/, adapters/,
// interface/api/, .git/, .env*) are intentionally absent.
const STATIC_ALLOWLIST_PREFIX = [
  "presentation/",
  "assets/",
  "behavior/surfaces/",
  "knowledge/",
  "interface/contracts/",
  "node_modules/runsnative/",
];
const STATIC_ALLOWLIST_FILE = new Set([
  "index.html",
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "TEMPLATE.md",
  "domain.yaml",
]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".woff2":"font/woff2",
  ".map":  "application/json; charset=utf-8",
};

function isAllowed(rel) {
  if (STATIC_ALLOWLIST_FILE.has(rel)) return true;
  return STATIC_ALLOWLIST_PREFIX.some(prefix => rel === prefix.slice(0, -1) || rel.startsWith(prefix));
}

async function serveStatic(req, res, rel) {
  const absolute = normalize(join(REPO_ROOT, rel));
  const repoRel = relative(REPO_ROOT, absolute);
  if (repoRel.startsWith("..") || repoRel.startsWith(sep + "..")) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  try {
    const s = await stat(absolute);
    if (s.isDirectory()) { res.writeHead(404); res.end("Not Found"); return; }
    const body = await readFile(absolute);
    const ct = MIME[extname(absolute).toLowerCase()] ?? "application/octet-stream";
    res.writeHead(200, { "content-type": ct, "content-length": body.length });
    res.end(body);
  } catch {
    res.writeHead(404); res.end("Not Found");
  }
}

const server = createServer(async (req, res) => {
  try {
    setLocale(req, res, () => {});

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === "/api/hello") return handleHello(req, res);

    if (pathname === "/" || pathname === "/index.html") {
      return serveStatic(req, res, "index.html");
    }

    // Strip leading slash, check allowlist.
    const rel = pathname.replace(/^\/+/, "");
    if (rel === "index.html") return serveStatic(req, res, "index.html");
    if (isAllowed(rel))       return serveStatic(req, res, rel);

    res.writeHead(404); res.end("Not Found");
  } catch {
    if (!res.headersSent) { res.writeHead(500); res.end("Internal Server Error"); }
  }
});

// Don't auto-listen when imported (e.g. by tests). Only listen when run directly.
const invokedDirectly = fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`[hello-world] http://127.0.0.1:${PORT}/`);
    console.log(`[hello-world] try:  curl http://127.0.0.1:${PORT}/api/hello?name=domain`);
  });
}

export { server, PORT };
