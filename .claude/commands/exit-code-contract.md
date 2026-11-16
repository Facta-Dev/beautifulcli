---
name: exit-code-contract
description: "Delegate to the exit-code-contract skill for the <app> CLI."
division: client
---

# /exit-code-contract

## Delegate

Delegate to the **exit-code-contract** skill.

Activate when a stable `<app>` CLI contract changes: an exit code, an output
schema, a flag name, the stdout/stderr split or the stream-json envelope. The
skill produces the version bump, the golden fixture and the consumer updates
together, so a script in the field keeps working after the change.

Do not activate for a change that touches no machine-readable surface: an
internal refactor, a pure function or a UI state no script parses needs no
contract change.
