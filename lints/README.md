# Beautiful CLI lints

The two-file unit that turns the cli-best-practices skill into red-on-save
output:

- `eslint.config.mjs` — the drop-in. Paste it next to your `package.json`; it
  makes eslint enforce the machine-checkable rules from the skill: the layer
  walls (the core never imports `@/tui`, `@/commands`, `process`, `fs` or
  `child_process`; a command never imports `@/tui`), the no-remote-code rule
  (`no-eval`, `no-new-func`, `no-implied-eval`), `no-console` (stdout goes
  through the output port), promise discipline and the type rules.
  Everything else rides the typescript-eslint `strictTypeChecked` +
  `stylisticTypeChecked` presets. Adjust the layer globs when your project
  renames its folders, never the rule.
- `check/` — the violation harness that proves every pinned rule fires:
  `src/` holds one file per rule family, each violating line carrying a
  `// expect:<rule>` comment on the line above it. `clean.ts` carries no
  markers and must stay fully quiet.

The harness files are layer-shaped on purpose (`src/core/`,
`src/commands/`, `src/tui/`): the `no-restricted-imports` and
`no-restricted-globals` overrides key on those file globs, so the violations
must sit in files the drop-in actually targets. `scripts/check-lints.sh` fails
if a marked rule stays quiet, if anything unmarked fires, or if `tsc --noEmit`
fails on the same files — every eslint/tsc invocation is bounded by a
timeout, stderr is always surfaced, and a non-JSON eslint report is an
explicit error, never a guess.

To wire it in CI:

```bash
npx eslint .
bash scripts/check-lints.sh   # only in the BeautifulCLI repo itself
```

Add the repo as a dependency of nothing — it is a copy-in config. Keep the
check project's `eslint.config.mjs` byte-identical to the drop-in; the lints
gate, `scripts/check-lints.sh` and
`tests/contracts/test_lints_contract.py` all enforce it.
