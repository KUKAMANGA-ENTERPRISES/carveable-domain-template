/**
 * hello service — the domain operation behind GET /api/hello.
 *
 * Composes adapters/echo to produce a greeting. Knows nothing about HTTP
 * (that's interface/api/) or agents (that's behavior/). A test can call
 * sayHello() directly with no HTTP server running.
 */

import { echo } from "../../adapters/echo/index.js";

export function sayHello({ name } = {}) {
  const recipient = (name ?? "world").toString().trim() || "world";
  const { prefix, source } = echo.getPrefix();
  return {
    greeting: `${prefix}, ${recipient}`,
    source,
  };
}

export const hello = { sayHello };
export default hello;
