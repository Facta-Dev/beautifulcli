# CLI architecture contract

The layer contract from the facta CLI handbook, reduced to what a scriptable
tool must keep. It is enforced by `lints/eslint.config.mjs`; this file explains
why each wall exists.

## 1. The layers

```text
bin/main (fast path, mode router)
  ├─ commands (parse → core → output/exit code)  ──►  core
  ├─ tui (Ink components, keybindings)           ──►  core public API
  └─ adapters (terminal, shell, fs, secrets, config, updater)  ──►  platform
core (use cases, ports, event stream)  ──►  domain
```

| Layer | Responsibility | May import | Must not import |
|---|---|---|---|
| **domain** | Entities, rules, pure types | nothing platform-specific | `process`, `fs`, Ink, the SDK |
| **core** | Use cases, orchestration, ports, event stream | domain, ports | `ink`, TUI components, `@/commands`, `process.*`, `fs`, `child_process` |
| **commands** | Parse, validate, call core, map result to output/exit code | core, output port, config port | `@/tui`, `process.stdout` directly |
| **tui** | Ink components, keybindings, terminal rendering | core's public API, UI kit, terminal port | core internals, `process.exit` |
| **adapters** | Terminal, shell, filesystem, secrets, config, updater | core, platform APIs | UI components |
| **platform** | The only place allowed to branch on OS | Node APIs | business rules |
| **contracts** | Output schemas, event envelopes, exit codes | nothing | everything else |

The walls are not style. A core that imports `process` cannot be tested
without a terminal; a command that writes to `process.stdout` corrupts a
pipe; a TUI that imports core internals makes the headless mode a second
implementation.

## 2. Ports

The consumer declares the port; the adapter implements it.

| Port | Declared by | Implemented by |
|---|---|---|
| `OutputPort` | core/commands | stdout/stderr adapter |
| `TerminalPort` | tui | `process.stdin/stdout`, raw mode, resize |
| `ShellPort` | core | `child_process` with argument arrays |
| `SecretStorePort` | core | OS keystore adapter |
| `ConfigPort` | core | layered config adapter |
| `ClockPort` | domain/core | system clock (tests use a fake) |
| `SdkClient` | core | generated SDK with auth/retry/envelope |
| `UpdaterPort` | core | signed manifest + atomic swap |
| `TelemetryPort` | core | opt-in OTel exporter |
| `OpenerPort`/`ClipboardPort` | core | `open`, OSC 52/native tool |

A port belongs to the consumer. A use case that needs "the API" depends on
`SdkClient`, not on the generated client module; the composition root wires
the real adapter.

## 3. Composition roots

- **`bin/main`** builds the container lazily: config, secret store, SDK,
  output port, clock. The fast path (`--version`/`--help`) does not build it.
- **Commands** receive the container; they do not construct adapters.
- **The TUI** receives the core's public API and the terminal port; it does
  not build the SDK.
- Tests build the same container with fakes; the use case does not change.

## 4. Command registry and route table

- One registry declares every command: name, description, positionals, flags,
  env fallbacks, permissions, examples, exit codes.
- The parser, `--help`, completions and docs are generated from it; there is
  no second hand-written list.
- A resource command maps to the URL contract: `sdk.{userType}.{module}.
  {resource}`; the command name mirrors the resource.
- One feature = one backend slice; the feature folder and the command share
  the name.

## 5. Modes

- **TUI**: interactive when stdin/stdout are TTYs; otherwise refuse with an
  actionable message.
- **Print**: one shot, no TUI, final output only; the agent/CI path.
- **JSON/stream**: structured output; no human text on stdout.
- **Resource subcommands**: table/text on a TTY, JSON when piped or `--json`.

## 6. Config and state

- Precedence: managed policy > flags > env > project local > project > user >
  defaults; each value carries its source.
- State under OS dirs: config, data, cache, state, runtime;
  atomic writes; a lock for concurrent instances.
- Migrations are versioned; a downgrade is refused with a clear message.
- `purge` removes local state for a project; secrets are wiped on sign-out.

## 7. Security and trust

- Workspace trust: a repository's hooks, plugins, MCP servers and
  shell-executing settings require an explicit confirmation; print mode never
  silently trusts an arbitrary repo.
- Authorization is server-side; the CLI hides actions, it does not decide
  access.
- No remote code, `eval` or `new Function`; plugins are data plus a reviewed
  adapter unless the product ships a sandboxed runtime.
- Untrusted text is sanitized before rendering (CSI/OSC/DCS, CR, OSC 52/8).

## 8. Observability

- Local logs under the state dir, rotated, redacted; `--debug` categories.
- Correlation IDs propagated from the SDK to logs and error output.
- Telemetry is opt-in, redacted, never contains tokens or file content.
- `doctor` prints versions, config sources, terminal capabilities, update
  channel and policy source.

## 9. Testing the layers

- **domain/core:** plain Vitest; no terminal, no fs.
- **commands:** parse → use case with a fake SDK; assert output and exit code.
- **output:** golden files for text/JSON/stream; a pipe test for `EPIPE`.
- **tui/terminal:** PTY tests; screen conditions, terminal restored on
  SIGINT/crash.
- **adapters:** path/shell/signal tests on Linux, macOS and Windows.
- **E2E:** the built binary against a mock server; no production data.

## 10. The enforcement map

| Rule | Where |
|---|---|
| core never touches `process`/`fs`/Ink | `no-restricted-globals` for `src/core/**`: `process`; `no-restricted-imports`: `@/tui`, `ink` |
| commands never import `@/tui` | `no-restricted-imports` for `src/commands/**` |
| stdout via the output port | `no-console` |
| no remote code | `no-eval`, `no-new-func`, `no-implied-eval` |
| no silenced types | `@typescript-eslint/ban-ts-comment` |
| no unlimited disables | `@eslint-community/eslint-comments/*` |

When a change needs an exception, re-cut the layout; do not add a path to the
exception list. A config exception is a contract change.
