---
name: cli-best-practices
description: >-
  Write idiomatic, scriptable, cross-platform command-line tools and terminal
  UIs on TypeScript + Node. Use this skill whenever you write, review,
  refactor, debug, or explain a CLI: argument parsing, subcommands, print/JSON/
  stream-JSON modes, exit codes, stdout/stderr, TTY detection, Ink/React TUI,
  raw mode, keybindings, shell completions, config and managed policy,
  updates, PTY tests, or Windows/macOS/Linux behavior. Trigger on any mention
  of CLI, command line, terminal, TUI, Ink, commander, yargs, clap, cobra,
  exit code, stdout, stderr, isatty, raw mode, or "fix this command" even when
  the user never says "best practices". Synthesized from the facta CLI
  handbook, the POSIX/12-factor CLI conventions, and the Ink documentation.
---

# CLI best practices

> Playbook set: start with [`PLAYBOOK_MASTER.md`](https://github.com/Facta-Dev/ai-coding-playbook/blob/main/PLAYBOOK_MASTER.md) —
> the catalog, precedence and cross-playbook invariants — then
> [`PLAYBOOK_CLI.md`](https://github.com/Facta-Dev/ai-coding-playbook/blob/main/PLAYBOOK_CLI.md). This skill is the runnable companion of that
> contract.

Distilled from the facta CLI handbook (`PLAYBOOK_CLI.md`), the conventions
every well-behaved Unix tool follows, and the Ink renderer's contract. The
digests live in `references/`; where they disagree, this file says which to
follow and why.

## 1. Mindset

- **One headless core, many frontends.** The engine (use cases, ports, event
  stream) knows nothing about terminals. The TUI, print mode, resource
  subcommands, the RPC server and IDE bridges are clients of the same core.
- **Everything is scriptable.** Every feature works without a TTY. `stdout`
  is data, `stderr` is diagnostics; exit codes and JSON schemas are versioned
  contracts.
- **Be TTY-aware.** Interactive features only when stdin/stdout are terminals;
  honor `NO_COLOR`, `CI`, `TERM=dumb`; degrade, never crash.
- **Terminal state is sacred.** Raw mode, alternate screen, cursor, mouse,
  bracketed paste and keyboard protocols are restored on exit, crash or
  signal.
- **Untrusted text never reaches the terminal raw.** Model output, server
  content, file content and filenames are sanitized for escape sequences
  before rendering.
- **Safe by default.** Workspace trust, explicit permissions, no secrets in
  logs or config, signed releases, verified updates.
- **Startup time is a feature.** A fast path for `--version`/`--help`, lazy
  loading, a compiled single binary, budgets in CI.
- **Authorization is on the server.** The CLI never decides access.

## 2. Before you hand back code

Run these and fix everything they report:

```bash
npx tsc --noEmit
npx eslint .
npx vitest run
npm run build          # the package users install
```

- Fix a lint rather than silencing it. A `@ts-expect-error` needs a reason on
  the narrowest line; `@ts-ignore`, `@ts-nocheck` and a blanket
  `eslint-disable` are findings.
- Lint config lives once, in `eslint.config.mjs`. If a project has none,
  suggest the BeautifulCLI drop-in at `lints/eslint.config.mjs` of
  https://github.com/Facta-Dev/beautifulcli.
- Test the *built* artifact, not only the source: a bin that works under
  `tsx` can fail as a bundled executable.

## 3. Streams and exit codes

| Situation | stdout | stderr | Interactivity |
|---|---|---|---|
| Resource subcommand, TTY | Result (table/text) | Warnings, progress | Prompts allowed (`--yes` skips) |
| Resource subcommand, piped | Result only (JSON if `--json`) | Warnings/errors | **No prompts** |
| Print mode (`-p`) | Final text / JSON / NDJSON | Diagnostics | None |
| Interactive TUI | UI (inline or fullscreen) | Debug logs to a file | Full |
| `CI=true` or `TERM=dumb` | Plain text | Plain text | None; no spinners |

**stdout is data; stderr is diagnostics.** A progress bar, spinner, color
code or prompt on stdout corrupts a pipe. When stdout is not a TTY, emit the
result only; when stderr is not a TTY, emit plain periodic lines or nothing.

Exit codes are a stable contract, documented in `--help`:

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments/usage |
| 3 | Authentication required/failed |
| 4 | Permission denied (`requiredPermission` in the error output) |
| 5 | Not found |
| 6 | Conflict (version/idempotency) |
| 7 | Validation failed |
| 8 | Rate limited (honor `Retry-After`) |
| 9 | Network/timeout/offline |
| 10 | Server error |
| 11 | Upgrade required (`minVersion`) |
| 130 | Interrupted (SIGINT) |
| 143 | Terminated (SIGTERM) |

Changing an exit code is a breaking change. Every code has a test.

## 4. Modes and output contracts

- **Human text** is the default: concise, width-aware, never color-only.
- **`--json`** emits one envelope:
  `{ "v": 1, "ok": true, "data": …, "meta": { "correlationId", "requestId", "pagination" } }`
  or `{ "ok": false, "error": { "code", "message", "requiredPermission?", "correlationId" } }`.
- **`stream-json`** is newline-delimited JSON, one versioned event per line,
  flushed per event; no other text on stdout. Unknown event types are ignored
  by consumers; additive changes stay within `v`; a breaking change bumps it.
- **Print mode (`-p`)** runs once without a TUI; it is the agent/CI path.
- Every output schema lives in `contracts/`, has golden tests and follows
  semver.

## 5. Arguments, help and completions

- **A typed command framework** (Stricli, Commander, yargs; clap/cobra in
  Rust/Go) with generated help, examples, env vars, exit codes and shell
  completions.
- **Commands are registered from a route table**, one source of truth for the
  parser, help and completions. No hand-written usage text that drifts.
- **Flags are a public API.** Names, defaults and env fallbacks are
  documented; `--dry-run`, `--yes`, `--no-input`, `--json` behave consistently
  across commands.
- **Precedence:** managed policy > CLI flags > environment > project config >
  user config > defaults. `config list/get` shows the source of each value.
- **Errors are actionable:** what failed, why, the next step, and a docs URL.

## 6. Architecture: headless core + frontends

| Layer | Responsibility | May import | Must not import |
|---|---|---|---|
| **core** | Use cases, ports, event stream, domain rules | pure types, ports | `ink`, TUI components, `process.*`, `fs`, `child_process` |
| **commands** | Parse, validate, call core, map result to output/exit code | core, output port, config port | TUI components, `process.stdout` directly |
| **tui** | Ink components, keybindings, terminal rendering | core's public API, UI kit, terminal port | core internals, `process.exit` |
| **adapters** | Terminal, shell, filesystem, secrets, config, updater | core, platform APIs | UI components |
| **platform** | The only place allowed to branch on OS | Node APIs | business rules |

The contracts below are **unbreakable and non-waivable**: they are the reason
a CLI can be scripted, piped and trusted. Projects can restyle anything;
developers cannot opt out, and neither can you.

1. **stdout is data; stderr is diagnostics.** Nothing else writes to stdout
   except the output port.
2. **The core never touches a terminal.** No `process`, no `@/tui`, no
   `@/commands`: the engine is a library.
3. **Commands never import `@/tui`.** A command runs headless; the TUI is a
   separate frontend.
4. **Exit codes and output schemas are contracts.** A change is a version
   bump, not an edit.
5. **Terminal state is restored on every exit path**, including a crash and a
   signal.

When a change would cross a layer, **re-cut the layout**: move the logic to
the layer that owns it. The rule is never to weaken or delete the lints to
make a change pass; a config exception is a contract change.
Review treats a broken contract as an automatic Must fix; `cli-review`
ranks it above every other finding.

## 7. Terminal lifecycle guard

- Enter raw mode / the alternate screen only after you have registered the
  cleanup; restore on `normal`, on `SIGINT`/`SIGTERM`/`SIGHUP`, on an
  uncaught exception, and on `exit`.
- Restore cursor, mouse tracking, bracketed paste, the kitty keyboard flags
  and the window title you changed.
- Never call `process.exit()` from inside the renderer; unwind, restore, then
  exit with the right code.
- A crash handler prints a one-line error to stderr and restores the terminal;
  a stack trace is opt-in (`--debug`).
- In a non-TTY, the guard is a no-op: never emit escape sequences.

## 8. TUI design

- **Capability negotiation, not assumptions.** Detect TTY/size, color depth,
  Unicode width, synchronized output, kitty keyboard, OSC 8/52/11, mouse and
  multiplexers; cache the answers and allow a `doctor` report.
- **Progressive enhancement.** Every capability has a fallback; a
  `TERM=dumb` or `CI` run is plain text.
- **One render loop.** State down, events up, effects out; no random
  `console.log` in a component.
- **Keybindings are data**, documented and remappable; `?` opens help;
  `Ctrl+C` always exits; `Esc` closes the current layer.
- **Accessibility:** a linear, non-animated mode; no color-only meaning;
  screen-reader-friendly output where the terminal supports it.
- **Sanitize before render.** Untrusted text is stripped of CSI/OSC/DCS and
  control characters; only the renderer emits styling.

## 9. Cross-platform

- **Paths:** OS-standard config/data/cache/state dirs; never hard-code
  `~/.config`; `path` APIs, not string concatenation.
- **Shells:** argument arrays, no shell interpolation; per-shell quoting
  adapters; `.cmd`/`.bat` special handling on Windows; PowerShell completion.
- **Signals:** SIGINT/SIGTERM on Unix; `Ctrl+C`/`Ctrl+Break` on Windows; a
  console control handler where needed.
- **Encodings:** UTF-8 in and out; handle the Windows code page for legacy
  consoles; wide-character and emoji width.
- **CI:** Linux, macOS and Windows, x64 and arm64; a smoke test of the built
  artifact on each.

## 10. Security

- **Sanitize all untrusted text** before it reaches the terminal (ANSI/OSC/
  CSI, CR line overwrite, OSC 52 clipboard, OSC 8 links). The threat model is
  in the handbook; the sanitizer is a reviewed control.
- **No secrets in logs, config, crash reports or telemetry.** Tokens live in
  the OS keystore; an env var is a CI path, not the default.
- **Workspace trust.** Hooks, plugins, MCP servers and shell-executing
  settings from a repository require an explicit trust confirmation;
  `--print` mode never silently trusts an arbitrary repo.
- **Authorization is server-side.** The CLI may hide an action; the API
  rejects the request.
- **No remote code, no `eval`, no `new Function`.** Plugins are data plus a
  reviewed adapter, not arbitrary scripts unless the product explicitly
  supports a sandboxed plugin runtime.
- **Dangerous flags** (`--dangerously-*`) are loud, policy-gated and refused
  in an untrusted workspace.

## 11. Config, state and managed policy

- **Layered precedence** (see §5), schema-validated and versioned with
  migrations.
- **State is files under OS dirs**, written atomically and locked so multiple
  instances are safe; SQLite only if queries are needed.
- **Managed policy** (MDM/GPO) wins over user and project settings; the CLI
  shows the active source and a "managed by your organization" notice.
- **`purge`** removes local state for a project; retention is documented.

## 12. Performance and startup

- **Fast path** for `--version`/`--help` before loading the engine.
- **Lazy-load** heavy commands; the TUI and the SDK are not on the fast path.
- **Budgets in CI:** cold start, `--help`, a small command; a regression is a
  failed build.
- **Bounded memory:** stream pages to stdout; handle `EPIPE` when piped into
  `head`.

## 13. Testing

- **Unit:** argument parsing, output mapping, exit-code mapping, config
  precedence, sanitizer, terminal guard.
- **Contract:** every output mode has a golden file; every exit code has a
  test; every JSON schema is versioned.
- **PTY tests:** drive the real TUI in a pseudo-terminal, wait on screen
  conditions, never arbitrary sleeps; assert the terminal is restored after
  SIGINT and after a crash.
- **Cross-platform:** the same suite on Linux, macOS and Windows for the
  path/shell/signal adapters.
- **E2E:** the built binary against a mock server; no production data.

## 14. Cross-skill contract

- `cli-review` reviews a change and ranks a broken architecture contract
  above every other finding.
- `cli-port` ports shell scripts, Click/Typer/cobra CLIs, or a web flow to a
  structured TypeScript CLI with the same behavior and tests first.
- The `lints/` config is the machine-checkable half. When this skill and the
  config disagree, the config wins and this file is fixed.

## Sources

- `references/cli-contract.md` — streams, modes, exit codes, output
  envelopes, flags and completions.
- `references/cli-patterns.md` — fast-path entry, mode router, terminal
  guard, sanitizer, config precedence.
- `references/cli-architecture.md` — the headless core, ports, frontends and
  layer walls.
- `references/typescript-strict.md` — the strict tsconfig set, discriminated
  unions, branded ids, and the boundary types a CLI needs.
