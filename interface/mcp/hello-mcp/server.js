/**
 * hello-mcp MCP server.
 *
 * Stdio transport. Exposes one tool: say_hello(locale).
 * Tool definition lives in behavior/tools/say-hello.js; this file is the
 * transport layer only — it registers the tool, connects the transport, and
 * delegates every call to the transport handler in ./tools/say-hello.js.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { handleSayHello } from './tools/say-hello.js';

const server = new Server(
  { name: 'hello-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'say_hello',
      description: 'Return a greeting in the specified locale. See interface/contracts/hello-mcp.md.',
      inputSchema: {
        type: 'object',
        properties: {
          locale: {
            type: 'string',
            description: 'BCP 47 language tag. Defaults to "en". Supported: en, es.',
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === 'say_hello') {
    return handleSayHello(args ?? {});
  }
  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
