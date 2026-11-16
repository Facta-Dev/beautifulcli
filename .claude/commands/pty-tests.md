---
name: pty-tests
description: "Delegate to the pty-tests skill for the <app> CLI."
division: testing
---

# /pty-tests

## Delegate

Delegate to the **pty-tests** skill.

Activate when an interactive `<app>` CLI behaviour is to be pinned down: a
permission dialog, an interrupt, a resize or a paste that only exists when a
terminal is attached, or a terminal-lifecycle bug that leaves the shell
unusable. The skill produces the PTY harness, the deterministic screen
assertions and the terminal-matrix coverage.

Do not activate for pure headless behaviour: a print-mode or subcommand path
with no TTY belongs in a contract or golden test, not a PTY test.
