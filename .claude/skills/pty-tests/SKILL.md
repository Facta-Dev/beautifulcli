---
name: pty-tests
description: "Writes deterministic pseudo-terminal e2e tests for the <app> CLI - spawn the compiled binary in a PTY, type keys, assert screen content through a headless emulator - covering interrupts, resize, paste and the terminal matrix."
division: testing
---

# <app> PTY Tests

A reusable workflow for driving the `<app>` CLI through a real pseudo-terminal and asserting what the screen shows. The TUI, the permission dialogs, the interrupt semantics and the resize behaviour only exist when a terminal is attached, so a fake-terminal unit test cannot prove them; a PTY test can. This skill produces the PTY harness, the deterministic screen assertions and the terminal-matrix coverage together.

## When to Activate

- A TUI interaction (permission dialog, interrupt, paste, resize) is to be pinned down.
- A terminal-lifecycle bug (raw mode, alternate screen, cursor, mouse left unrestored) is fixed.
- A terminal-matrix claim needs evidence: Windows Terminal, conhost, tmux, SSH, or a non-TTY CI runner.
- A reviewer asks for the interactive behaviour, not just the headless output.

Do not activate for pure headless behaviour: a print-mode or subcommand path with no TTY belongs in a contract or golden test, not a PTY test.

## Core Principles

- Spawn the real binary in a real PTY. `node-pty`/`pexpect`-style drivers on POSIX, ConPTY on Windows; a headless terminal emulator asserts the rendered screen.
- Deterministic, never sleepy. Wait on screen conditions (a string appears, a dialog renders), never on a fixed `sleep`; a timed sleep is a flaky test waiting to happen.
- Assert screen content, not implementation. The test reads what the user would see and asserts the state, not an internal flag.
- Cover the lifecycle. Interrupt (Esc cancels, first Ctrl+C cancels, second exits), resize, paste and crash must leave the terminal usable.
- The matrix is the coverage. At least one run per supported terminal family and one non-TTY run; a claim without a matrix row is unverified.

## Rules

- Anti-hallucination: the key sequences, the screen content and the terminal names must match the shipped binary; do not invent a capability the terminal does not negotiate.
- Every claim needs a source: cite the local playbook for the lifecycle rule and the terminal emulator documentation for a platform behaviour.
- Do not emit the final output as a fenced code block when raw output is expected.
- A test that waits on a fixed sleep is a REVISE: replace the sleep with a screen-condition wait.
- Every PTY test asserts the terminal is restored after the scenario, so a crash path cannot leave the shell unusable.
- Flaky tests are quarantined with an owner and an expiry, never silently retried until green.
- The test spawns the compiled binary, not the source, so what is asserted is what ships.

## Research References

Provenance table - every claim in a finding needs a row.

| claim | source | year | link |
| --- | --- | --- | --- |
| PTY e2e spawns the binary in a pseudo-terminal and asserts screen content | `PLAYBOOK_CLI.md` section 14 | 2024 | local file |
| The terminal lifecycle guard restores raw mode, alt screen and cursor on exit/crash/signal | `PLAYBOOK_CLI.md` section 5.3 | 2024 | local file |
| The terminal matrix and the deterministic-wait rule | `PLAYBOOK_CLI.md` section 14 | 2024 | local file |
| Interrupt semantics: Esc cancels, first Ctrl+C cancels, second exits | `PLAYBOOK_CLI.md` section 5.1 | 2024 | local file |
| ConPTY on Windows for pseudo-terminal control | Microsoft ConPTY documentation | 2024 | https://learn.microsoft.com/en-us/windows/console/console-virtual-terminal-sequences |

## Output Format

A harness plan plus a coverage note. Plain text - not a fenced block:

```
PTY TEST  permission-dialog-cancel

  harness:
    tests/_platform/e2e/permission-dialog.test.ts - spawns the compiled
    binary in a PTY, types the trigger, waits for the dialog screen, then
    Esc.

  scenario:
    1. spawn `myapp` in a PTY, assert the prompt renders
    2. type a command that requires a permission, wait for the dialog
    3. press Esc, assert the operation is cancelled
    4. assert the prompt is redrawn and the terminal is usable

  matrix:
    POSIX: GNOME Terminal (xterm-headless) | macOS Terminal | tmux
    Windows: Windows Terminal (ConPTY) | conhost
    non-TTY: CI runner (no prompts, plain output)

CHECKLIST
  [ ] spawns the compiled binary, not the source
  [ ] waits on screen conditions, never a fixed sleep
  [ ] asserts the terminal is restored after every scenario
  [ ] covers interrupt, resize and paste, not just happy-path input
  [ ] matrix row per terminal family plus one non-TTY run
  [ ] flaky tests quarantined with owner and expiry
```

Summary line: `pty-tests: N scenario(s) covered, matrix: M terminal(s) - verdict: APPROVE | REVISE`.
