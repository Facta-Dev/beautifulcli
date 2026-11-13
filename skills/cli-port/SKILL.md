---
name: cli-port
description: >-
  Port an existing command-line tool or terminal UI to a structured,
  scriptable TypeScript CLI with the same behavior: a POSIX shell script, a
  legacy Node script, a Click/Typer, cobra, commander or yargs CLI, or a web
  flow that needs a terminal entry point. Use this skill whenever the user
  asks to migrate, convert, rewrite, or port a script or CLI, or to modernize
  a TUI. Trigger on port, migrate, convert, rewrite as a CLI, "turn this bash
  script into a command", "move this to Ink", or a pasted script. Port the
  tests first, keep behavior identical, and write a PORTING.md.
---

# CLI port

A port preserves behavior while changing the implementation. The output is not
a shell script wrapped in TypeScript; it is a command a Unix user would have
written, with the same observable behavior and tests proving it.

## 1. The order of work

1. **Read the source and its tests.** The tests are the specification. If
   there are none, write characterization tests against the current behavior
   first (stdout, stderr, exit codes, files written).
2. **Port the tests first.** Same cases, same assertions, expressed in the
   target harness. A port without a failing test is a rewrite with hope.
3. **Map every input and output.** Arguments, flags, env vars, stdin, files,
   stdout, stderr, exit codes, signals, side effects.
4. **Define the core.** Move the logic out of `main` into use cases; the
   command becomes parse → call → map output/exit code.
5. **Port the behavior.** One command at a time; keep the old script runnable
   during the transition if the project needs a cutover.
6. **Run the gates.** `tsc`, `eslint`, tests, the built artifact, a pipe and
   a PTY smoke test.
7. **Write `PORTING.md`.** Every deliberate difference, every shell trick not
   reproduced, every flag/env change, and why.

## 2. Shell script → TypeScript mapping

| Shell | TypeScript CLI |
|---|---|
| `$1`, `$2` | A typed positional argument; validate and name it |
| `getopts` / a `while` on `$1` | A typed parser (Commander, Stricli, yargs) with help/completions |
| `set -euo pipefail` | Explicit `Result` handling; never an unhandled rejection |
| `echo` | The output port (`stdout` data); diagnostics to `stderr` |
| `>&2` | `stderr` through the diagnostics port |
| `exit 1` | The documented exit-code map (usage 2, forbidden 4, …) |
| `read -p` | A prompt only when stdin is a TTY; `--yes`/`--no-input` paths |
| `$HOME/.config` | The OS config dir (`env-paths`/`xdg`/Known Folders) |
| `curl` | The generated SDK with auth, retry and the error envelope |
| `jq` in a pipeline | `--json`/`--stream-json` output modes with a versioned schema |
| `trap ... EXIT` | The terminal guard + cleanup on every exit path |
| `eval`/string `sh -c` | No `eval`; argument arrays and a reviewed adapter |
| `$(...)` parsing text | Structured values from the SDK or a typed parser |

## 3. Another CLI framework → TypeScript

- **Click/Typer (Python), cobra (Go), clap (Rust):** keep the command tree,
  flags, defaults, env fallbacks and exit codes. Map every command to a
  route-table entry; generate help and completions from it.
- **Commander/yargs (Node):** keep the names, but move the handler body into
  a use case; the parser is an adapter, not the application.
- **A TUI in another framework (blessed, textual, bubbletea):** map the state
  and events to Ink components; keep keybindings in data; port the terminal
  guard first, because it is the part that is hardest to notice is missing.

## 4. Web flow → CLI

- **Same SDK, different frontend.** The CLI is another client of the same
  API; do not duplicate the request logic.
- **Same states.** loading, empty, error, forbidden, ready — rendered as
  text/JSON, not as a web screen.
- **Auth:** OAuth device flow (RFC 8628) for headless/SSH, loopback + PKCE
  when a browser is available; tokens in the OS keystore.
- **Long operations:** `202` + `--wait` with progress on stderr; Ctrl+C stops
  waiting, not the server job unless `--cancel-on-interrupt`.
- **Destructive actions** require `--yes` or an explicit confirmation; a
  non-TTY never prompts.

## 5. Behavior parity checklist

- [ ] Every command, flag, positional, env var and config key exists with the
      same default and precedence.
- [ ] stdout carries only the result; stderr carries diagnostics.
- [ ] Every exit code is documented and tested.
- [ ] `--json`/`--stream-json` outputs match a versioned schema.
- [ ] `--help`, `--version` and completions are generated and correct.
- [ ] Non-TTY: no prompts, no spinners, no color; a pipe works (`EPIPE`).
- [ ] Terminal state is restored on success, error, SIGINT, SIGTERM and
      crash.
- [ ] Config/state live in the OS dirs, written atomically and locked.
- [ ] Signals map to the documented exit codes.
- [ ] The original tests pass, ported; new tests cover the CLI-only paths.
- [ ] `PORTING.md` lists every deliberate difference.

## 6. What not to do

- **Do not keep `main` as the application.** A 900-line `main` with 40 flags
  is the script you meant to replace; move the logic into use cases.
- **Do not shell out for what the SDK can do.** `curl`/`jq` in the happy path
  loses the error envelope, retries and auth.
- **Do not print progress to stdout** because the old script did; that is the
  bug a pipe exposes.
- **Do not skip the PTY tests.** A TUI that looks right once and leaves the
  terminal broken on Ctrl+C is not ported.
- **Do not silently change behavior.** Reproduce the old quirk, pin it with a
  test, and list the fix as a follow-up — or fix it deliberately and say so.

## 7. Cross-skill contract

- `cli-best-practices` is the target style; every ported command follows it.
- `cli-review` reviews the port before release and ranks a broken
  architecture contract above every other finding.
- The `lints/` config is the machine-checkable half; a port that needs a lint
  exception is a port that has not finished.
