# A worked review: the deploy command

The subject is a small `deploy` command with a TUI progress view. It works in
a terminal on the happy path, and it has five findings that a review must rank
in a useful order. The fixed version follows the contract in
`cli-best-practices`.

## The module under review

```tsx
// src/commands/deploy.ts
import { render } from "ink";
import { DeployView } from "../tui/deploy-view";

export async function deploy(argv: string[]): Promise<void> {
  const env = argv[0];
  if (!env) {
    console.error("usage: deploy <env>");
    process.exit(1);
  }

  console.log("Deploying to", env);
  render(<DeployView env={env} />);

  const result = await fetch(`https://api.example.com/v1/deploy/${env}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
  });

  if (!result.ok) {
    console.log("deploy failed");
    process.exit(1);
  }

  console.log(await result.text());
}
```

## The report

### Verdict

The command works once in an interactive terminal, corrupts every pipe, and
gives a permission failure the same exit code as a network failure. Not safe
to ship; the architecture violation is first because it is the one the next
command will copy.

### Must fix

1. `deploy.ts:2` — a **command** imports `../tui/deploy-view`. Rule:
   *a command runs headless; the TUI is a separate frontend*. Fix: the command
   returns a result; `bin/main` chooses the TUI or print mode.
2. `deploy.ts:12` — progress (`console.log`) and the result share stdout.
   Rule: *stdout is data; stderr is diagnostics*. Fix: route the result
   through `OutputPort.data` and progress through `OutputPort.progress`.
3. `deploy.ts:5` — a usage error exits 1. Rule: *usage is exit 2; forbidden is
   4; network is 9*. Fix: return the documented code from the `CliError` map.
4. `deploy.ts:14` — a raw `fetch` with `process.env.API_TOKEN` bypasses the SDK
   and puts the token in the command. Rule: *the core calls the SDK through a
   port; the token lives in the secret store*. Fix: call
   `core.deploy(env)`; the SDK handles auth, retry and the error envelope.
5. `deploy.ts:15` — a non-TTY run still renders the Ink view. Rule: *a TUI
   only when stdin/stdout are TTYs; otherwise print mode*. Fix: choose the
   frontend in `main`.

### Should fix

6. `deploy.ts:18` — `console.log("deploy failed")` loses the server's
   correlation id and the reason. Fix: map the error envelope and print the
   correlation id to stderr.
7. `deploy.ts:12` — no terminal guard; a crash in the Ink view leaves the
   cursor/alternate screen as it was. Fix: register the guard before render,
   restore on exit/SIGINT/crash.
8. `deploy.ts:4` — `argv[0]` is not parsed or documented; flags are absent.
   Fix: use the command registry and `--help`/completions.

### Waived gates

None. The diff does not touch the lint config, the tests, or the exit-code
contract.

## The fixed module

```tsx
// src/commands/deploy.ts — headless: parse, call core, map output.
export async function runDeploy(
  argv: readonly string[],
  io: Container,
): Promise<number> {
  const parsed = DeployArgs.safeParse(argv);
  if (!parsed.success) {
    io.output.diagnostic(`usage: deploy <env>\n`);
    return 2;
  }

  const result = await io.core.deploy(parsed.data.env);
  if (!result.ok) {
    io.output.diagnostic(
      `error: ${result.error.message} (${result.error.correlationId ?? "no-id"})\n`,
    );
    return exitCode(result.error);
  }

  io.output.data(`${result.data.url}\n`);
  return 0;
}
```

```tsx
// src/bin/main.ts — the only place that chooses a frontend.
const mode = detectMode(argv, isatty(1) && isatty(0));
if (mode === "tui") {
  await renderWithGuard(<DeployView env={env} core={core} />);
} else {
  process.exitCode = await runDeploy(argv, container);
}
```

## What changed, and why it matters

| Finding | The fixed version |
|---|---|
| Command imports the TUI | command is headless; `main` chooses TUI/print |
| Progress and result on stdout | `OutputPort.data` vs `.progress` (stderr) |
| Usage and failures all exit 1 | the documented `CliError` → exit-code map |
| Raw fetch + token in the command | `core.deploy` through the SDK |
| TUI in a pipe | mode router checks `isatty` |
| No terminal guard | render wrapped in the guard |

The review is short on purpose. Five Must-fix findings, each with a location,
a rule, and a fix, is a better review than twenty comments that repeat the
same contract in different words.
