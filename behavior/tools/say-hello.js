/**
 * say-hello tool — exposed to agents.
 *
 * Demonstrates the "tools must be thin" rule: zero logic, just translates
 * agent argument shape into a `services/hello/` call. All real behavior
 * lives in the service.
 */

import { hello } from "../../services/hello/index.js";

export const tool = {
  name: "say_hello",
  description: "Return a greeting. Optionally specify a recipient name.",
  schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Recipient. Defaults to 'world'." },
    },
  },
  invoke({ name } = {}) {
    return hello.sayHello({ name });
  },
};

export default tool;
