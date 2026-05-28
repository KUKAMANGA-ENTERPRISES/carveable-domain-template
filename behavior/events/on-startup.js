/**
 * on-startup event handler.
 *
 * Fires once when the domain runtime boots. Demonstrates the events/ layer
 * shape: a function that receives the event payload and may call services
 * or adapters. NOT to be confused with .claude/hooks/ — those are Claude
 * Code lifecycle hooks; these are domain runtime events.
 */

import { hello } from "../../services/hello/index.js";

export const event = {
  name: "domain.startup",
  description: "Logs a greeting line so the operator sees the domain came up correctly.",
  handle(payload = {}) {
    const { greeting, source } = hello.sayHello({ name: payload.name ?? "operator" });
    console.log(`[hello-world] ${greeting} — via ${source}`);
  },
};

export default event;
