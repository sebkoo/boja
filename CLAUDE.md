# CLAUDE.md

## Shell commands

Every shell command run in this repo must be non-interactive:

- Use `vitest run`, never bare `vitest` (bare form watches and blocks).
- Use `git --no-pager <cmd>` for any git command whose output can page (`log`, `diff`, `show`, etc.).
- Pass `--yes` / `-y` / `CI=1` on any command that might otherwise prompt for confirmation.
- No watch modes (`--watch`, dev servers left running in foreground, etc.) in this session.
