/**
 * GET /api/hello route handler.
 *
 * Thin: parses request → calls service → formats response. No business logic.
 * See interface/contracts/hello.openapi.yaml for the contract.
 */

import { hello } from "../../../services/hello/index.js";

export function handleHello(req, res) {
  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
  const name = url.searchParams.get("name") ?? undefined;
  const locale = req.locale ?? "en";

  const payload = hello.sayHello({ name, locale });

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}
