---
name: "<app> Ship"
description: "Prepares the <app> CLI release - the green gate evidence, the version bump, the changelog entry and the pull request body - without publishing, deploying or committing on its own."
division: core
---

# <app> Ship

A reusable workflow for preparing a release of the `<app>` CLI. The skill assembles the evidence a reviewer needs - the gate output, the version, the changed public surface - and drafts the pull request body. It never publishes, never pushes, never merges and never tags: those are human actions on a repository the agent does not own.

## When to Activate

- The user asks to ship, release or open a pull request for the CLI.
- A change set is complete and every gate is green, and the release preparation is the remaining work.
- A distribution step needs the version and the changelog assembled.

Do not activate for an ordinary commit in the middle of a feature, and do not activate to bypass a red gate - a failing gate stops the release, it does not annotate it.

## Core Principles

- The gate output is the evidence. The release notes quote the actual `make ci` and `npm run evals` results from this session, not a recollection of an earlier run.
- The version lives in one place. The version string in `src/bin/main.ts` is the release version; `dist/` is generated and never edited.
- The public surface is restated on every release. A change to the exit-code table, the envelope, a flag name or the stdout/stderr split is called out explicitly, because those are the parts a script in the field actually depends on.
- The agent prepares; the human publishes. No tag is pushed, no release is published and no branch is force-pushed by this workflow.

## Rules

- No fabricated data: the gate results, the commit hashes and the version come from commands actually run in this session, or the release stops with a named missing step.
- Every claim needs a source: cite the command whose output supports each statement in the pull request body.
- Do not emit the final pull request body as a fenced code block when raw output is expected - it is plain Markdown to be pasted.
- Never commit a lockfile: the lockfile belongs to the renamed copy and `scripts/rename.sh` removes it from the template.
- Never force-push and never push to a shared branch without the user's explicit instruction.
- If a gate is red, stop and report which gate failed and its output; do not ship a known-red build.
- The changelog entry describes user-visible change only; internal refactors are listed as housekeeping, not as features.
- Do not include secrets, tokens or personal identifiers in the pull request body.

## Research References

Provenance table - every claim in a finding needs a row.

| claim | source | year | link |
| --- | --- | --- | --- |
| The release version lives in the source and is emitted to `dist/` by the build | `src/bin/main.ts`, `tsconfig.json` | 2024 | local file |
| The gates that must be green before a release | `Makefile`, `package.json` | 2024 | local file |
| The template verifies itself by staging a renamed copy and running every gate on it | `scripts/verify-template.sh` | 2024 | local file |
| The exit-code table and the envelope that must be restated on every release | `src/core/contracts.ts` | 2024 | local file |
| The distribution and signing posture for a published CLI | `PLAYBOOK_CLI.md` section 12 | 2024 | local file |

## Output Format

Raw structured prose plus a paste-ready pull request body. Not a fenced block:

```
### <app> ship - release preparation

Gate evidence (run in this session):
  make ci         -> <actual result>
  npm run evals   -> <actual result>

Version:  <version from src/bin/main.ts>

Public surface changed:
  - exit-code table / envelope / flag names / stream split - or "none"

CHECKLIST
  [ ] every gate green in this session
  [ ] version bumped in src/bin/main.ts only
  [ ] no lockfile in the commit
  [ ] changelog entry written (user-visible change only)
  [ ] pull request body reviewed by a human before publishing

--- pull request body ---

Title: <type>: <summary>

Body:
  What changed and why, in two or three sentences.
  The gates that were run and their result.
  The public surface, unchanged or with the version bump.
  The user-visible change, or "none".
  The risks and the rollback.

--- end pull request body ---

Next (human): review, merge, tag and publish.
```

Summary line: `ship: <version> - gates: N passed, N failed - verdict: READY | BLOCKED`.
