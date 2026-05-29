/**
 * hello service — the domain operation behind GET /api/hello and the hello-mcp tool.
 *
 * Two call paths:
 *   { name }        → adapter-prefix greeting ("Hello, integration") — HTTP route
 *   { locale }      → catalog greeting ("Hello, world" / "Hola, mundo") — MCP tool
 *
 * Knows nothing about HTTP or MCP transport — those live in interface/.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { echo } from "../../adapters/echo/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const I18N_ROOT = join(HERE, "../../i18n");

function loadGreeting(locale) {
  try {
    const raw = readFileSync(join(I18N_ROOT, locale, "ui.json"), "utf8");
    return JSON.parse(raw)["hello.greeting"];
  } catch {
    const err = new Error(`Locale not supported: ${locale}`);
    err.code = "locale_not_supported";
    throw err;
  }
}

export function sayHello({ name, locale = "en" } = {}) {
  if (name !== undefined) {
    // Named greeting — adapter prefix preserves existing HTTP behavior.
    const recipient = name.toString().trim() || "world";
    const { prefix, source } = echo.getPrefix();
    return { greeting: `${prefix}, ${recipient}`, source };
  }
  // Locale greeting — resolves hello.greeting from i18n/<locale>/ui.json.
  const greeting = loadGreeting(locale);
  return { greeting };
}

export const hello = { sayHello };
export default hello;
