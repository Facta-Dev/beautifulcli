---
name: "<app> Add Command"
description: "Scaffold a new CLI subcommand (src/features/<scope>) in the <app> CLI - domain, application, adapters/in argv handler, contracts, and the command-registry wiring - with the contract and golden-test gate, as one change."
division: client
---

# <app> Add Command

A reusable scaffolding workflow for adding a new command to the `<app>` CLI. An agent (for example the planner or the architect role) invokes this skill to produce the command declaration, its contract, its wiring and its boundary checklist together - so a new command never lands without its registration, its output schema and its golden fixture. The output is a wiring sketch plus a boundary checklist, in plain text.

## When to Activate

- A new subcommand (`myapp <module> <resource> <verb>`) is requested.
- An existing command needs a new flag, a new output format or a new exit-code mapping.
- The hexagonal dependency direction must be verified after a wiring change: domain stays pure, application never reaches adapters, slices never import each other.
- A reviewer asks for the command plus contract bundle before approving a surface change.

Do not activate for an in-slice refactor that adds no new command and no new cross-boundary dependency - that is ordinary implementation work.

## Core Principles

- The command is a thin adapter over a use case. The argv handler parses flags and shapes output; the logic lives in `application/use-cases.ts`; a handler that carries business logic is a REVISE.
- The contract comes first. The exit-code mapping and the output schema land in `src/contracts/` before the handler that emits them, because print mode and the TUI render the same event stream.
- stdout is data, stderr is diagnostics. A command writes its result to stdout and warnings/progress to stderr; it never prompts when stdin/stdout are not terminals.
- The platform boundary belongs to `src/platform/`. A command that needs a shell, a path or a keystore takes it through a port; it never imports `process` or `fs` itself.
- Slices never import each other. A shape shared by two commands moves down to `src/contracts/`, never sideways.

## Rules

- Anti-hallucination: do not invent file paths, port names or import edges that are not in the tree. Every scaffolding step cites a file that exists or is being added.
- Every claim needs a source: cite the local playbook or the local file for a boundary rule; cite the official runtime documentation for a platform behaviour.
- Do not emit the final sketch as a fenced code block when raw output is expected - the sketch is plain text with labelled sections.
- Verify the cited files exist before reporting; a wiring step that cites a port that is not being added is a hallucination.
- A new command must appear in `src/features/<scope>/` **and** be registered in the command registry; one without the other is a REVISE.
- A command that prompts when not a TTY is a BLOCK: CI and pipes hang, and the no-prompt-when-not-TTY test fails.
- A command that writes UI chrome (spinners, color, progress bars) to stdout when piped is a BLOCK: it corrupts the data stream.
- A command that needs a new permission, a new durable config shape or a new platform adapter is out of scope for this skill - route it to `/exit-code-contract` or the architect.

## Research References

Provenance table - every claim in a finding needs a row. The link column points at the primary source actually read.

| claim | source | year | link |
| --- | --- | --- | --- |
| stdout is data, stderr is diagnostics and UI chrome; exit codes and JSON schemas are versioned contracts | `PLAYBOOK_CLI.md` section 4 | 2024 | local file |
| The slice layout and the dependency direction the linter enforces | `PLAYBOOK_CLI.md` section 3 and Appendix A | 2024 | local file |
| `process.platform` branching appears only under `platform/` | `PLAYBOOK_CLI.md` section 3.1 | 2024 | local file |
| Commands are generated from the route table and OpenAPI, then wrapped with UX | `PLAYBOOK_CLI.md` section 2.2 | 2024 | local file |
| Node `child_process` must use `execFile`/`spawn` with argument arrays, never string interpolation | `PLAYBOOK_SECURITY.md` section 16 | 2024 | local file |

## Output Format

A wiring sketch plus a boundary checklist, anchored to the command root. Plain text - not a fenced block:

```
COMMAND  myapp funnels leads list

  files:
    src/features/funnels/domain/        -> pure types (shared-kernel imports only)
    src/features/funnels/application/ports.ts   -> consumer-owned port types
    src/features/funnels/application/use-cases.ts -> orchestration over the ports
    src/features/funnels/adapters/in/leads-list.ts -> argv handler, thin
    src/features/funnels/adapters/out/  -> production adapters over the SDK/platform
    src/contracts/output.ts             -> the versioned output + exit-code mapping
    src/app/main.ts                     -> the command registry entry

  deps:
    src/contracts/       -> the shared DTOs, exit codes, stream-json envelope
    src/platform/        -> the only owner of process.platform, fs, child_process
    tests/funnels/cli/{unit,contract}/  -> the tiered tests + golden fixtures

CHECKLIST
  [ ] command declared under src/features/<scope>/adapters/in/
  [ ] use case owns the logic; the handler is a thin adapter
  [ ] exit-code mapping and output schema added to src/contracts/ first
  [ ] registered in the command registry (src/app/main.ts)
  [ ] stdout data, stderr diagnostics; no prompt when not a TTY
  [ ] no process/fs/child_process outside adapters
  [ ] contract + golden tests written; pnpm run test green
```

Summary line: `add-command: N command(s) scaffolded, M wiring step(s) - verdict: APPROVE | REVISE`.
