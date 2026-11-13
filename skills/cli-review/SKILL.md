---
name: cli-review
description: >-
  Review a command-line tool or terminal UI on TypeScript + Node — a command,
  an argument parser, the print/JSON modes, exit codes, the TUI, terminal
  handling, config, updates, or a diff — and produce a prioritized report
  where every finding cites the file and line, the rule it breaks, and the
  smallest fix. Use this skill whenever the user asks to review, audit,
  critique, or "find problems in" a CLI, a TUI, a shell script, a command
  parser, or a terminal output path. Trigger on review, audit, code review,
  PR review, "what is wrong with this CLI", "check these exit codes", "review
  this TUI", or a pasted command/worker file. Architecture and stream/exit
  contracts always rank first.
---

# CLI review

A review is a prioritized list of findings, not a rewrite. Read the whole
change first. Every finding has four parts: **location** (file and line),
**severity**, **the rule it breaks** (named or quoted), and **the smallest
fix**. If you cannot cite a rule or a user-visible consequence, it is not a
finding; it is a preference for the Notes section, if anywhere.

## 1. Report shape

```text
## Verdict
<one paragraph: what this change does, whether it is safe to ship, and the
single most important thing to fix>

## Must fix
1. <file>:<line> — <finding>. Rule: <rule or contract>. Fix: <smallest fix>.

## Should fix
...

## Notes
...

## Waived gates
...
```

- **Must fix** blocks merge or release: a broken layer, a corrupted pipe, a
  wrong exit code, a terminal left in raw mode, a token in a log, a remote
  code path.
- **Should fix** is worth doing in this change or the next: a slow startup, a
  missing completion, a config precedence bug that is not yet user-visible.
- **Notes** is optional. Do not pad the report to look thorough.

## 2. Categories, in ranking order

### Architecture contracts (always Must fix, ranked first)

A broken architecture contract (ranked above everything) is a Must fix even
when the command works. Check:

- `core` imports `ink`, a TUI component, `process.*`, `fs`, or
  `child_process`; the engine must be a library.
- A command imports `@/tui` or writes to `process.stdout` directly instead
  of the output port.
- The TUI imports core internals or calls `process.exit`.
- A second command parser, help text or completion table that drifts from the
  route table.
- Authorization decided in the client.

Name the violated rule and quote it; the fix is to move the logic to the layer
that owns it.

### Streams and exit codes

- A progress bar, spinner, color code, prompt or debug line on stdout.
- A prompt in a non-TTY (`CI`, piped stdout, `--no-input` missing).
- The wrong exit code: 0 on failure, 1 for usage, a changed code, a missing
  code path.
- `--json` not an envelope, a schema drifted without a version bump, or
  non-JSON text mixed into `stream-json`.
- Color/progress not gated by `NO_COLOR`, `CI`, `TERM=dumb`, `isatty`.
- `EPIPE` not handled when piped into `head`.

### Terminal lifecycle and TUI

- Raw mode, alternate screen, cursor, mouse, bracketed paste or keyboard
  flags not restored on exit, `SIGINT`, `SIGTERM`, or a crash.
- `process.exit()` inside the renderer; a cleanup path that never runs.
- Escape sequences emitted when stdout is not a TTY.
- Untrusted text rendered raw: CSI/OSC/DCS, CR line overwrite, OSC 52,
  OSC 8 links, control characters.
- A capability assumed instead of detected; no fallback for `TERM=dumb`,
  `CI`, or a narrow terminal.
- `console.log` inside a component; state mutated outside the render loop.
- Keybindings not documented or not remappable; `Ctrl+C` not exiting.

### Security

- A secret in a log, config file, crash report, telemetry event or URL.
- A repository's hooks, plugins or MCP servers executed before an explicit
  workspace-trust confirmation.
- `eval`/`new Function`/remote code where the product does not sandbox it.
- A `--dangerously-*` flag that is not loud, policy-gated and refused in an
  untrusted workspace.
- A client-side permission check presented as access control.
- A token read from an untrusted env var without a documented reason.

### Cross-platform

- A hard-coded `/` path, `~/.config`, a POSIX-only signal, a POSIX shell
  interpolation, or a Windows code-page assumption.
- `child_process` with a shell string instead of an argument array; no
  `.cmd`/`.bat` handling.
- A CI matrix without Windows or arm64; a path/shell adapter untested on one
  OS.

### Config and state

- A precedence layer missing or duplicated; managed policy losing to user
  config.
- A non-atomic write, no lock for multiple instances, a state file in the
  project directory that should be in the OS state dir.
- A migration that loses data, or a schema change without one.
- `purge` that leaves secrets or state behind.

### Tests

- No exit-code test; no golden output test; no PTY test for the TUI; a PTY
  test with `sleep` instead of a screen condition.
- No cross-platform test for the path/shell/signal adapters.
- No test that the terminal is restored after SIGINT or a crash.
- A test that asserts implementation instead of behavior.

## 3. Waived gates

If the diff deletes or weakens a lint, a test, a type, an exit code or a
terminal-safety check, flag the deletion itself, loudly — even when the new
code looks fine. Look for:

- A removed `eslint-disable` **or a new one without a description**; a
  `@ts-expect-error` that suppresses a real error; `@ts-ignore` or
  `@ts-nocheck`.
- A lint rule turned off in `eslint.config.mjs`, a layer wall removed, or a
  `no-restricted-imports` exception for one file.
- A skipped PTY test; a golden file regenerated without reading the diff; an
  exit code changed without a version bump.
- A `tsconfig` strictness flag turned off; `any` introduced at a boundary.

State the deletion, the reason it claims, and what it would take to keep the
gate. "Temporarily" is not a reason; an expiring waiver with an owner is.

## 4. How to review

1. **Read the change twice.** First for intent, then for the diff.
2. **Run the gates if you can:** `npx tsc --noEmit`, `npx eslint .`,
   `npx vitest run`, the build, a pipe/smoke test.
3. **Check the architecture and the stream contract first.** They are the
   expensive findings; style is cheap.
4. **Cite evidence.** File and line for every Must fix; a rule name or a
   quoted contract for every finding.
5. **Propose the smallest fix.** "Rewrite the command" is not a fix; "route
   output through `OutputPort` and map `forbidden` to exit 4" is.
6. **Stop when the change is safe.** An empty Should-fix section is a valid
   review.

## 5. Worked example

`examples/review-cli.md` is a full review of a small `deploy` command: the
buggy command and renderer, the findings in ranking order, and the fixed
module. It shows the layer violation first, then the stdout corruption, then
the exit-code bug, then the terminal-restore gap.

## 6. Cross-skill contract

- `cli-best-practices` defines the rules this review cites. When a finding
  and the skill disagree, the skill is the source.
- `cli-port` produces the change; this review checks it before release.
- The `lints/` config is the machine-checkable subset. A finding the config
  can catch should become a rule, not a repeated comment.
