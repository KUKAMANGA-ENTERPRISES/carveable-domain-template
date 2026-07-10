# Claude Code Project Config

Team-shared Claude Code configuration for this domain. Everything here is version-controlled and applies to every contributor.

## Substructure

- **`settings.json`** — permissions, hooks, model defaults
- **`agents/`** — custom subagents specific to this domain (read by Claude Code's Agent tool)
- **`skills/`** — project-scoped skills (read by Claude Code's Skill tool)
- **`commands/`** — slash commands available in this repo
- **`hooks/`** — Claude Code lifecycle hook scripts (pre-tool, post-tool, etc.) — **NOT to be confused with `behavior/events/`** which are domain runtime event handlers
- **`rules/`** — additional rule files that `AGENTS.md` references for project-specific guidance

## Per-user overrides

`.claude/settings.local.json` is gitignored. Use it for personal preferences (model choice, local paths) that shouldn't be team-shared.
