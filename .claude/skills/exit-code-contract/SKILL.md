---
name: "<app> Exit Code Contract"
description: "Changes a stable <app> CLI contract - an exit code, an output schema, a flag name or the stream-json envelope - with the version bump, the golden fixture and the consumers updated together, so scripts keep working."
division: client
---

# <app> Exit Code Contract

A reusable workflow for changing the machine-readable surface of the `<app>` CLI. Every script in the field consumes the current exit codes, output shapes and flag names, so a change without a version bump and a golden fixture is a silent breaking change that no test in the repository will catch. This skill produces the contract change, the version bump, the golden fixture and the consumer updates together.

## When to Activate

- An exit code, an output shape or a flag name changes meaning.
- A new output format or envelope version is introduced.
- The stdout/stderr split or the TTY-vs-piped behaviour changes.
- A reviewer asks whether an existing script survives a surface change.

Do not activate for a change that touches no machine-readable surface: an internal refactor, a pure function or a UI state that no script parses needs no contract change.

## Core Principles

- The exit-code table is the contract. Every code has one documented meaning; 130/143 stay reserved for SIGINT/SIGTERM; a change is a breaking change and is versioned.
- stdout is data, stderr is diagnostics. The split is part of the contract, and anything that mixes them corrupts every pipeline downstream.
- No prompt in a pipe. A piped (non-TTY) invocation fails with an actionable message instead of prompting; `NO_COLOR`, `CI` and `TERM=dumb` degrade to plain text.
- Golden fixtures are code. `--help`, tables, JSON and error messages are snapshotted across width variants, no-color and the ASCII fallback; a reflow is a reviewed diff.
- Version the envelope. `--json` and `stream-json` carry a `v` field and a versioned schema; a shape change bumps the version and updates every consumer in the same change.

## Rules

- Anti-hallucination: the exit-code table, the output schema and the golden fixtures must exist in the tree; do not invent a code or a shape that was never shipped.
- Every claim needs a source: cite the local contract file for the current mapping and the playbook for the TTY rule.
- Do not emit the final output as a fenced code block when raw output is expected.
- A changed exit code, output shape or flag name without a version bump and a golden fixture is a BLOCK.
- A write of UI chrome to stdout when piped is a BLOCK: emit to stderr only.
- Every contract change ships a contract test and a regenerated golden fixture, so the change is exercised from the command and the snapshot, not only from the prose.
- The TTY-vs-piped behaviour is covered: a fixture that asserts no prompt when not a TTY must pass.

## Research References

Provenance table - every claim in a finding needs a row.

| claim | source | year | link |
| --- | --- | --- | --- |
| The exit-code table, stdout/stderr split and output formats | `PLAYBOOK_CLI.md` section 4.3 and 4.4 | 2024 | local file |
| Never write progress bars, spinners or color to stdout when not a TTY | `PLAYBOOK_CLI.md` section 4.1 | 2024 | local file |
| Golden output and contract tests are reviewed like code | `PLAYBOOK_CLI.md` section 14 | 2024 | local file |
| The JSON envelope shape `{ v, ok, data, meta }` and the error envelope | `PLAYBOOK_CLI.md` section 4.4 | 2024 | local file |
| The current exit-code mapping and output schemas | `src/contracts/` | 2024 | local file |

## Output Format

A contract plan plus a mapping summary. Plain text - not a fenced block:

```
CONTRACT  leads-list  exit code 7 -> 5

  table:
    src/contracts/exit-codes.ts - map "validation failed" to 7, keep 5 for
    "not found"; the command now exits 5 on a missing lead.

  schema:
    src/contracts/output.ts - the table envelope gains no new fields; the
    `v` field stays 1.

  consumers:
    src/features/funnels/adapters/in/leads-list.ts - emit exit 5 on not-found
    tests/funnels/cli/contract/leads-list.test.ts - assert the new mapping

  fixtures:
    tests/funnels/cli/contract/golden/leads-list.txt - regenerated

MAPPING
  0 success | 5 not-found (changed) | 7 validation (unchanged)

CHECKLIST
  [ ] exit-code table updated and versioned in the same change
  [ ] output schema bumped only if the shape changed
  [ ] every consumer updated in the same change
  [ ] contract test asserts the new mapping
  [ ] golden fixture regenerated and reviewed
  [ ] no-prompt-when-not-TTY still passes
  [ ] pnpm run test green
```

Summary line: `exit-code-contract: N contract(s) changed, mapping gap: none - verdict: APPROVE | REVISE`.
