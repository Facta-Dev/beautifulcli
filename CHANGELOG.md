# Changelog

All notable changes to this project are listed here. Versions follow
[Semantic Versioning](https://semver.org/), and the version lives in
`.claude-plugin/plugin.json`.

## [Unreleased]

### Added

- **Three skills for cross-platform CLIs and TUIs.** `cli-best-practices`
  steers new code toward a headless core with TUI, print, JSON and
  stream-JSON frontends; stdout as data and stderr as diagnostics; a stable
  exit-code contract; TTY-aware behavior; the terminal lifecycle guard;
  untrusted-text sanitization; and the unbreakable layer contract.
  `cli-review` reviews a command, parser, output path, TUI, or diff and ranks
  architecture and stream/exit contracts first. `cli-port` ports shell
  scripts, legacy CLIs, or a web flow to a structured TypeScript CLI.
- **A drop-in ESLint config.** `lints/eslint.config.mjs` (ESLint 9 flat
  config + typescript-eslint 8, strictTypeChecked) turns the layer contract
  into red-on-save output: `no-restricted-imports` keeps the core off the TUI
  and commands and the commands off the TUI; `no-restricted-globals` keeps
  `process` out of the core; `no-eval`/`no-new-func` enforce the
  no-remote-code rule; `no-console` keeps stdout behind the output port.
- **Proof that every rule fires.** `lints/check/` holds one deliberate
  violation per rule plus a clean file, and `scripts/check-lints.sh` runs
  eslint and tsc over both, bounded and with stderr surfaced.
- **A skill validator, an example compiler, and a test suite.**
  `scripts/check-skill.py` checks frontmatter, links, eval cases and the
  plugin manifests; `scripts/check-examples.py` compiles every `ts` block;
  `tests/` covers the unit, contract, integration and CI-gate layers.
- **A worked review.** `examples/review-cli.md` shows the report shape and the
  architecture-first ranking on a small `deploy` command.

[Unreleased]: https://github.com/Facta-Dev/beautifulcli/compare/v0.1.0...HEAD
