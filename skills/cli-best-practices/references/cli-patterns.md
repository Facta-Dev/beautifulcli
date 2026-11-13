# CLI patterns

The patterns a scriptable CLI needs, with the failure mode each prevents.

## 1. Fast-path entry and mode router

```tsx
// src/bin/main.ts — no engine import on the fast path.
const argv = process.argv.slice(2);
if (argv.includes("--version") || argv.includes("-v")) {
  process.stdout.write(`${version}\n`);
  process.exit(0);
}
if (argv.includes("--help") || argv.includes("-h")) {
  process.stdout.write(helpText());
  process.exit(0);
}
const mode = detectMode(argv);        // tui | print | json | stream | command
const { run } = await import("./router.js");
process.exitCode = await run(mode, argv);
```

- `--version` and `--help` never load the engine, the SDK or the TUI.
- The mode router decides once: TUI vs print vs resource subcommand.
- No `process.exit()` deep in the code; return an exit code and set
  `process.exitCode`.

## 2. Terminal guard

```tsx
// The cleanup is registered before entering raw mode.
const cleanup = (): void => {
  process.stdout.write("\x1b[?25h");   // cursor
  process.stdout.write("\x1b[?1049l"); // alternate screen
  process.stdin.setRawMode?.(false);
};
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(130); });
process.on("SIGTERM", () => { cleanup(); process.exit(143); });
process.on("uncaughtException", (error) => {
  cleanup();
  process.stderr.write(`error: ${error.message}\n`);
  process.exit(1);
});
```

- Restore cursor, alternate screen, mouse tracking, bracketed paste, kitty
  keyboard flags and the window title.
- The guard is a no-op when stdout is not a TTY; never emit escape sequences
  into a pipe.
- A crash prints one line to stderr; the stack is `--debug`.

## 3. Output port

```ts
type StreamEvent = { v: 1; type: string; sessionId: string; payload: Record<string, unknown> };

interface OutputPort {
  data(text: string): void;          // stdout
  diagnostic(text: string): void;    // stderr
  json(value: unknown): void;        // stdout, one envelope
  event(event: StreamEvent): void;   // stdout, NDJSON
  progress(phase: string, percent?: number): void; // stderr, TTY only
}
```

- Commands write through the port; `console.log` and raw
  `process.stdout.write` are findings.
- The port decides color/width/TTY behavior once; commands do not branch on
  `isatty`.

## 4. Error to exit code

```tsx
type CliError =
  | { kind: "usage" }
  | { kind: "unauthenticated" }
  | { kind: "forbidden"; requiredPermission?: string }
  | { kind: "notFound" }
  | { kind: "conflict" }
  | { kind: "validation"; message: string }
  | { kind: "rateLimited"; retryAfterSeconds?: number }
  | { kind: "network" }
  | { kind: "server"; correlationId?: string }
  | { kind: "upgradeRequired"; minVersion: string };

function exitCode(error: CliError): number {
  switch (error.kind) {
    case "usage": return 2;
    case "unauthenticated": return 3;
    case "forbidden": return 4;
    case "notFound": return 5;
    case "conflict": return 6;
    case "validation": return 7;
    case "rateLimited": return 8;
    case "network": return 9;
    case "server": return 10;
    case "upgradeRequired": return 11;
  }
}
```

- The switch is exhaustive; a new kind is a compile error.
- The human message goes to stderr; the JSON error envelope goes to stdout.
- The correlation id is shown so support can find the request.

## 5. Config precedence

```text
managed policy > CLI flags > environment > project local > project > user > defaults
```

- Every source is schema-validated; the merged result carries the source of
  each value so `config get` can explain it.
- Atomic writes (write a temp file, fsync, rename); a lock for concurrent
  instances.
- Secrets never live in config; the token store is the OS keystore.

## 6. Device-code sign-in

- `POST /device_authorization` → print the URL and user code to stderr.
- Poll with `interval`; back off on `slow_down`; respect `expires_in`.
- Store the token in the OS keystore; never echo it.
- `auth status` prints identity, scopes and expiry — no secrets.

## 7. Sanitizer

- Strip 7-bit ESC-prefixed CSI/OSC/DCS/PM/APC and C0/C1 control characters
  (keep `\n` and `\t`, strip `\r`); the renderer re-adds its own styling.
- OSC 52 (clipboard) is write-only and size-capped; OSC 8 URLs are scheme-
  validated and displayed.
- The sanitizer runs on model output, server content, file content and
  filenames before they reach the terminal.

## 8. PTY tests

- Drive the built binary in a pseudo-terminal; wait on a screen condition
  (`expect`-style), never `sleep`.
- Assert the TUI renders the state, reacts to a key, and restores the
  terminal after `Ctrl+C`.
- Assert a crash restores the cursor/alternate screen and exits 1.
- Assert a piped run has no escape sequences and no prompt.
