---
name: review
description: "Runs the <app> CLI pre-landing checklist - layer boundaries, stream split, contract coverage, TTY safety and test adequacy - producing a severity-ranked verdict against `make ci`."
division: core
---

# <app> Review

A reusable pre-landing review checklist for the `<app>` CLI. An agent invokes this skill; the agent supplies the contextual judgement, the skill supplies the deterministic procedure. Five fixed categories are walked in the same order every time: layer boundaries, stream split, contract coverage, TTY safety, and test adequacy. The output is raw structured prose with a verdict, never a fenced block.

## When to Activate

- Before landing any change under `src/`, `tests/` or `evals/`.
- Whenever a request asks for a "review", a "gate check" or a "pre-landing pass".
- A change touches a use case, an adapter, a contract or the composition root.
- A follow-up review after fixes from a prior `/review` pass.

Do not activate for documentation-only changes with no source edits. This skill COMPLEMENTS the `code-reviewer` core agent rather than replacing it: the agent reasons freely about intent and tradeoffs, while this skill walks the same five categories in the same order every time.

## Core Principles

- **Checklist, not judgement.** Five fixed categories, always in this order: layer boundaries, stream split, contract coverage, TTY safety, test adequacy.
- **`process` and `node:` belong to `src/adapters/`.** Any use of a Node builtin inside `src/core/` is a BLOCK; ESLint and the architecture test enforce it, and the review states which rule caught it.
- **stdout is data, stderr is diagnostics.** A write of UI chrome (spinners, progress, color) to stdout when piped is a BLOCK.
- **Contracts are versioned.** A changed exit code or output shape without a version bump and a golden fixture is a BLOCK.
- **No prompt in a pipe.** A command that prompts when stdin/stdout are not terminals is a BLOCK; CI and pipes hang.
- **Tests accompany the change.** A new command without a use-case test and an adapter test is a WARN; a changed boundary without an architecture test is a BLOCK.

## Rules

- No fabricated data: do not invent file paths or line numbers. If a file was not read this session, list it under "not reviewed" instead of guessing.
- Every claim needs a source: a finding cites the file and line actually read, or it is tagged "unverified".
- No code-fenced final output where raw output is expected: the verdict is raw structured prose.
- Read each touched file before reporting on it; unread files are listed separately.
- BLOCK only on a real finding: a layer violation, a stdout chrome write when piped, a changed contract without a version bump and fixture, a prompt in a pipe, or a changed boundary without an architecture test.
- WARN on style-grade issues: a thin but present justification, a duplicated constant that belongs in the contracts, a test that could assert more precisely.
- APPROVE only when all five categories show no BLOCK-level finding.

## Research References

Provenance table - every claim in a finding needs a row.

| claim | source | year | link |
| --- | --- | --- | --- |
| `process` and `node:` are restricted outside `src/adapters/**` | `eslint.config.mjs` | 2024 | local file |
| The architecture rules the static test asserts | `tests/architecture.test.ts` | 2024 | local file |
| The stream split, the envelope and the exit-code table | `src/core/contracts.ts`, `src/adapters/io.ts` | 2024 | local file |
| The TTY and pipe rules | `PLAYBOOK_CLI.md` section 4.1 | 2024 | local file |
| The test tiers and the gates | `PLAYBOOK_TESTS.md` | 2024 | local file |
| The CLI stream contract and the trust boundary | `PLAYBOOK_CLI.md` section 4 | 2024 | local file |

## Output Format

Raw structured prose - not a code fence:

```
### <app> review - pre-landing checklist

Gate: make ci (lint + test + evals + build)

Findings:
- [BLOCK|WARN] layer-boundary @ <file>:<line> - <what> | fix: <suggestion>
- [BLOCK|WARN] stream-split @ <file>:<line> - <what> | fix: <suggestion>
- [BLOCK|WARN] contract-coverage @ <file>:<line> - <what> | fix: <suggestion>
- [BLOCK|WARN] tty-safety @ <file>:<line> - <what> | fix: <suggestion>
- [BLOCK|WARN] test-adequacy @ <file>:<line> - <what> | fix: <suggestion>

Not reviewed (not read):
- <file>

Verdict: APPROVE | WARN | BLOCK
```
