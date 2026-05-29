# hello-mcp

Minimal MCP server for the hello-world domain. Exposes one tool: `say_hello(locale)`, which returns a greeting string from the `i18n/<locale>/ui.json` catalog by delegating to `services/hello/`. Tool DEFINITIONS live in `behavior/tools/say-hello.js`; this server is the MCP transport layer only. See `interface/contracts/hello-mcp.md` for the full tool contract.
