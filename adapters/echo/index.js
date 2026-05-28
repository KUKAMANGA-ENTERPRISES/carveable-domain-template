/**
 * Echo adapter — wraps the "greeting prefix source" as if it were an external
 * system. In a real domain this would wrap Postgres, an LLM, etc.; for the
 * hello-world instance, the "external system" is process.env.HELLO_GREETING
 * (or a default) so the adapter layer can be exercised without any real
 * outside dependency.
 *
 * The adapter exposes a DOMAIN-shaped API (`getPrefix()`), not raw env access.
 * Services consume this API; they never read process.env directly.
 */

const SOURCE = "echo";

export function getPrefix() {
  const raw = process.env.HELLO_GREETING ?? "Hello";
  return { prefix: raw.trim(), source: SOURCE };
}

export const echo = { getPrefix, SOURCE };
export default echo;
