/**
 * MCP transport handler for say_hello.
 *
 * Thin wrapper: parses locale from the MCP request arguments, delegates to
 * services/hello/, and returns the result in MCP content shape. No business
 * logic here — all behavior lives in the service.
 */

import { hello } from '../../../../services/hello/index.js';

export async function handleSayHello({ locale = 'en' } = {}) {
  try {
    const { greeting } = hello.sayHello({ locale });
    return { content: [{ type: 'text', text: greeting }] };
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.code ?? err.message}` }],
      isError: true,
    };
  }
}
