<p align="center">
  <img src="assets/icon.png" alt="Beautiful CLI: a terminal prompt on a dark field" width="160">
</p>

# Beautiful CLI

Three standard [Agent Skills](https://agentskills.io) and a lints config that
teach coding agents to write, review, port, and enforce idiomatic
**cross-platform command-line tools and terminal UIs** on TypeScript + Node:

- **`cli-best-practices`** loads whenever an agent writes or changes a CLI,
  and steers it toward a headless core, a stable exit-code contract and a
  safe terminal.
- **`cli-review`** reviews existing code — a command, parser, output path,
  TUI, or diff — and writes a prioritized report where every finding cites the
  rule it breaks and shows the fix.
- **`cli-port`** ports shell scripts, Click/Typer/cobra/commander CLIs, or a
  web flow to a structured TypeScript CLI with the same behavior, porting the
  original tests first.
- **`lints/`** is a drop-in ESLint 9 flat config whose layer walls and
  no-remote-code rules run in CI.

They work with Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Gemini CLI,
and any other agent that reads the Agent Skills format.

## Why

A CLI is a public API that happens to have a terminal attached. The failures
are contracts, not syntax:

- A progress bar on stdout corrupts every pipe that consumes the command.
- An exit code changes from 1 to 2, and a CI script silently stops failing.
- A prompt in a non-TTY hangs a pipeline.
- A crashed TUI leaves the terminal in raw mode.
- A token is printed in `--debug`.
- A `curl | jq` happy path bypasses the SDK's retries, auth and error
  envelope.

Beautiful CLI is the contract that catches those before review.

## Install

### Claude Code

```bash
/plugin marketplace add Facta-Dev/beautifulcli
/plugin install beautiful-cli@beautiful-cli
```

### OpenAI Codex and ChatGPT

The repository ships a portable `plugin.json` with the `com.openai` interface
block. Point Codex at the repository, or package it with:

```bash
python3 scripts/package-openai-plugin.py --out beautiful-cli.zip
```

### Any agent

Copy `skills/cli-best-practices`, `skills/cli-review`, and `skills/cli-port`
into your agent's skills directory. Each skill is a `SKILL.md` plus a
`references/` digest; no runtime, no network.

## A worked example

Without the skill, an agent writes a command that works in a terminal and
fails everywhere else:

```tsx
// Without the skill: progress on stdout, a prompt in a pipe, exit 1 for usage.
async function main(): Promise<void> {
  console.log("Loading...");
  const name = await ask("Project name? ");
  const result = await sdk.app.projects.create({ name });
  console.log(`Created ${result.data.id}`);
  if (!result.ok) {
    console.error(result.error.message);
    process.exit(1);
  }
}
```

Problems: the progress and the result share stdout; `ask` prompts even when
stdin is a pipe; a usage error and a server error both exit 1; the SDK result
is read before it is checked.

With the skill, the command is headless, the output goes through one port,
and the exit code is a contract:

```tsx
// With the skill: parse → use case → output + exit code.
export async function runCreate(argv: string[], io: Container): Promise<number> {
  const parsed = CreateArgs.safeParse(argv);
  if (!parsed.success) {
    io.output.diagnostic(`error: ${parsed.error.message}\n`);
    return 2;
  }
  const result = await io.core.createProject(parsed.data);
  if (!result.ok) {
    io.output.diagnostic(`error: ${result.error.message}\n`);
    return exitCode(result.error);
  }
  io.output.data(`${result.data.id}\n`);
  return 0;
}
```

The stream, exit-code and mode contracts are in
[`skills/cli-best-practices/references/cli-contract.md`](skills/cli-best-practices/references/cli-contract.md).

## The architecture contract

```text
bin/main (fast path, mode router)
  ├─ commands (parse → core → output/exit code)  ──►  core
  ├─ tui (Ink components, keybindings)           ──►  core public API
  └─ adapters (terminal, shell, fs, secrets, config, updater)  ──►  platform
core (use cases, ports, event stream)  ──►  domain
```

| Layer | Owns | Must not import |
|---|---|---|
| **domain** | Entities, rules, pure types | `process`, `fs`, Ink, the SDK |
| **core** | Use cases, orchestration, ports, events | `@/tui`, `@/commands`, `process.*`, `fs`, `child_process` |
| **commands** | Parse, call core, map output/exit code | `@/tui`, `process.stdout` directly |
| **tui** | Ink components, keybindings, rendering | core internals, `process.exit` |
| **adapters** | Terminal, shell, fs, secrets, config, updater | UI components |
| **platform** | The only OS branch | business rules |

The unbreakable rules:

1. stdout is data; stderr is diagnostics.
2. The core never touches a terminal or `process`.
3. Commands never import `@/tui`.
4. Exit codes and output schemas are contracts.
5. Terminal state is restored on every exit path, including a crash.

## The lints config

[`lints/eslint.config.mjs`](lints/eslint.config.mjs) is a copy-in ESLint 9
flat config. It pins:

- **Layer walls:** `no-restricted-imports` for the core and commands;
  `no-restricted-globals` for `process` in the core.
- **No remote code:** `no-eval`, `no-new-func`, `no-implied-eval`,
  `no-debugger`.
- **One output path:** `no-console` (stdout goes through the output port).
- **Type discipline:** `ban-ts-comment`, `consistent-type-imports`,
  `explicit-module-boundary-types`, `no-unnecessary-type-assertion`,
  `switch-exhaustiveness-check`.
- **Async discipline:** `no-floating-promises`, `no-misused-promises`.
- **Silencing:** eslint-comments requires a description and rejects an
  unlimited disable.

[`lints/check/`](lints/README.md) is the violation harness: one deliberate
file per rule with a `// expect:<rule>` marker, plus a clean control.
[`scripts/check-lints.sh`](scripts/check-lints.sh) fails if a marked rule stays
quiet, if anything unmarked fires, or if `tsc --noEmit` fails on the same
files.

## What it does not do

- The skills contain instructions and reference text only. They make no
  network calls and collect no data ([PRIVACY.md](PRIVACY.md)).
- When a Node.js toolchain is available, the skills run `tsc`, `eslint`, and
  `vitest` on your project; without one, they work from the code alone.
- The lint config is a copy-in unit, not a dependency.
- The skills do not replace a PTY test suite or a cross-platform CI matrix;
  they tell the agent what those must prove.

## Repository layout

```text
skills/
  cli-best-practices/   SKILL.md + references/ (contract, patterns,
                        architecture, strict TypeScript)
  cli-review/           SKILL.md (report format, ranking, waived gates)
  cli-port/             SKILL.md (shell/legacy CLI → TypeScript)
lints/
  eslint.config.mjs     the drop-in
  check/                the violation harness + byte-identical config
scripts/
  check-skill.py        frontmatter, links, evals, manifests
  check-lints.sh        every pinned rule fires
  check-examples.py     TypeScript blocks compile
  examples.json         the ledger of deliberately skipped blocks
  package-openai-plugin.py
tests/                  unit, contracts, integration, e2e
examples/
  review-cli.md         a full worked review
```

## Sources

- The facta CLI handbook (`PLAYBOOK_CLI.md`): headless core, streams, exit
  codes, terminal guard, modes, config, updates.
- The POSIX/Unix CLI conventions: stdout/stderr, exit status, `--help`,
  `--version`, composability.
- The Ink documentation: components, rendering, input, the terminal lifecycle.

## Contributing

Rule proposals are welcome; open an issue with the
[rule template](.github/ISSUE_TEMPLATE/propose-a-rule.yml) and a source. A
rule without a source and a failing example is a preference, not a rule. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## Siblings

Beautiful CLI is part of the Beautiful series for the facta playbooks:
[beautiful-j2ee](https://github.com/Facta-Dev/beautiful-j2ee),
[beautifulandroid](https://github.com/Facta-Dev/beautifulandroid),
[beautifulextension](https://github.com/Facta-Dev/beautifulextension),
[beautifulgo](https://github.com/Facta-Dev/beautifulgo),
[beautifulios](https://github.com/Facta-Dev/beautifulios),
[beautifulnodejs](https://github.com/Facta-Dev/beautifulnodejs),
[beautifulpython](https://github.com/Facta-Dev/beautifulpython),
[beautifulqt](https://github.com/Facta-Dev/beautifulqt),
[beautifulreact](https://github.com/Facta-Dev/beautifulreact),
[beautifulreactnative](https://github.com/Facta-Dev/beautifulreactnative),
[beautifulrust](https://github.com/Facta-Dev/beautifulrust).

## License

MIT — see [LICENSE](LICENSE).
