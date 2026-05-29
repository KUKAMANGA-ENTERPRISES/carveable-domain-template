/**
 * tests/integration/mcp-hello.test.js — cross-layer MCP test.
 *
 * Spawns the hello-mcp stdio server, connects a Client, calls the say_hello
 * tool with three locales (en, es, fr), and verifies the responses.
 *
 * Run with: `node --test tests/integration/mcp-hello.test.js`
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = join(HERE, '../../interface/mcp/hello-mcp/server.js');

let client;

test.before(async () => {
  const transport = new StdioClientTransport({
    command: 'node',
    args: [SERVER_PATH],
    stderr: 'pipe',
  });
  client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
});

test.after(async () => {
  await client.close();
});

test('MCP say_hello with locale=en returns English greeting', async () => {
  const result = await client.callTool({ name: 'say_hello', arguments: { locale: 'en' } });
  assert.ok(!result.isError, `expected success but got error: ${result.content?.[0]?.text}`);
  assert.equal(result.content[0].text, 'Hello, world');
});

test('MCP say_hello with locale=es returns Spanish greeting', async () => {
  const result = await client.callTool({ name: 'say_hello', arguments: { locale: 'es' } });
  assert.ok(!result.isError, `expected success but got error: ${result.content?.[0]?.text}`);
  assert.equal(result.content[0].text, 'Hola, mundo');
});

test('MCP say_hello with unsupported locale returns error with code locale_not_supported', async () => {
  const result = await client.callTool({ name: 'say_hello', arguments: { locale: 'fr' } });
  assert.ok(result.isError, 'expected isError: true for unsupported locale');
  assert.ok(
    result.content[0].text.includes('locale_not_supported'),
    `expected error text to contain 'locale_not_supported', got: ${result.content[0].text}`,
  );
});
