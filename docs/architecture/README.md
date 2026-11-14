# beautifulcli — Architecture Diagrams

Rendered with [Archify](https://github.com/tt-a1i/archify). Each entry is a standalone,
explorable HTML page (inline SVG, dark/light themes, live motion) paired with its source
JSON candidate. The set documents the CLI/TUI stack this repo teaches: a thin command
layer that parses and validates, a headless core use case, a typed SDK for the wire, the
local state directories and the OS keystore, and the stdout/stderr contract that keeps
results and diagnostics apart — with the skills, the ESLint layer walls, the tests and
the CI gates as the delivery mechanism.

| Diagram | Type | What it shows | JSON | HTML |
|---|---|---|---|---|
| c4-containers | architecture | Container view: caller → command → core → `SdkClient` → product API, with the local state directories, the OS keystore and the stdout/stderr surfaces — plus the build/run/quality gates | [json](c4-containers.json) | [html](c4-containers.html) |
| services-slices | architecture | Layer topology: command/UI, the headless core use case, the typed SDK and the ports (`ConfigPort`, `SecretStorePort`, `Clock`, `Reporter`), with the lint walls that keep the domain free of process, terminal and network code | [json](services-slices.architecture.json) | [html](services-slices.architecture.html) |
| auth-algorithm | workflow | The credential and trust algorithm: flag/env/config precedence, `SecretStorePort` over the OS keystore, token refresh, the 401/403 split and the sign-out wipe | [json](auth-algorithm.workflow.json) | [html](auth-algorithm.workflow.html) |
| outbox-algorithm | workflow | The async delivery path: the command pipeline, the event stream, backpressure, retry with a bound and the exit code that reports a partial failure | [json](outbox-algorithm.workflow.json) | [html](outbox-algorithm.workflow.html) |
| auth-sequence | sequence | One authenticated request end to end: resolve the credential, call the SDK, refresh once on 401, map the error envelope and print the result | [json](auth-sequence.sequence.json) | [html](auth-sequence.sequence.html) |
| outbox-sequence | sequence | The async trace in time: command → core → streamed events → final envelope, with the interrupt and the flush on exit | [json](outbox-sequence.sequence.json) | [html](outbox-sequence.sequence.html) |
| database-dataflow | dataflow | Where local state and results go: config, secrets and state directories on one side, the SDK and API on the wire, and stdout/stderr as the two output channels (the four-stage layout keeps the corridors readable) | [json](database-dataflow.dataflow.json) | [html](database-dataflow.dataflow.html) |
| runtime-lifecycle | lifecycle | Process runtime states: parse → validate → execute → render → exit, with the usage error, the interrupted run, the bounded retry and the success/partial-failure endings | [json](runtime-lifecycle.lifecycle.json) | [html](runtime-lifecycle.lifecycle.html) |

Authored with Archify, sibling set of the facta backend kits. The diagram content is
grounded in the architecture contract in the README and in the digests the skills carry
(`skills/cli-best-practices/references/cli-contract.md`, `cli-patterns.md`,
`cli-architecture.md`, `strict-typescript.md`).

**Adapted roles.** Three file names keep the series shape but document the CLI mechanism
rather than a backend fiction: `auth-*` is the **credential and trust boundary** (the
keystore-backed token store, not an auth server), `outbox-*` is the **async delivery
pipeline and event stream** (the CLI has no broker), and `database-dataflow` is the
**local state + wire + output** flow (the CLI keeps no second copy of business data).
