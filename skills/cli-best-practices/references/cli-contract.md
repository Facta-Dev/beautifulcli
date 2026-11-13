# CLI contract digest

The stream, mode, exit-code and help contract every command must keep. The
facta CLI handbook (`PLAYBOOK_CLI.md`) is the full source; this is the review
checklist.

## 1. Streams

| Stream | Carries | Never carries |
|---|---|---|
| stdout | The result (text, JSON, NDJSON) | Progress, spinners, prompts, logs, color when piped |
| stderr | Diagnostics: warnings, progress, prompts, errors | The result a script parses |
| stdin | Piped input when present | A required prompt in a non-TTY |

- `isatty(1)` decides interactive output; `isatty(2)` decides progress.
- `NO_COLOR`, `FORCE_COLOR`, `--color=auto|always|never`, `CI`,
  `TERM=dumb` are honored in that order (flag wins).
- A non-TTY run never prompts; it fails with an actionable message and a
  `--yes`/`--no-input` hint.
- `EPIPE` on stdout ends the process quietly (0) when the consumer closed the
  pipe.

## 2. Modes

| Mode | Flag | Output |
|---|---|---|
| Human | default | Width-aware table/text |
| JSON | `--json` / `--output-format json` | One envelope |
| Stream | `--output-format stream-json` | NDJSON, one event per line |
| Print | `-p`/`--print` | One shot, no TUI, final text/JSON |
| Quiet | `--quiet` | Errors only, on stderr |

The JSON envelope:

```ts
type Envelope<T> =
  | { v: 1; ok: true; data: T; meta?: { correlationId?: string; requestId?: string; pagination?: { cursor?: string; hasMore: boolean } } }
  | { v: 1; ok: false; error: { code: string; message: string; requiredPermission?: string; correlationId?: string } };
```

The stream event:

```ts
type StreamEvent =
  | { v: 1; type: "start"; sessionId: string; payload: Record<string, unknown> }
  | { v: 1; type: "progress"; sessionId: string; payload: { phase: string; percent?: number } }
  | { v: 1; type: "result"; sessionId: string; payload: { ok: boolean; exitCode: number } }
  | { v: 1; type: "error"; sessionId: string; payload: { code: string; message: string; correlationId?: string } };
```

- Unknown event types are ignored by consumers; additive changes stay within
  `v`; a breaking change bumps it.
- Partial-message and hook-lifecycle events are opt-in flags.
- No other text on stdout in either mode.

## 3. Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments/usage |
| 3 | Authentication required/failed |
| 4 | Permission denied (`forbidden`; `requiredPermission` in the error) |
| 5 | Not found |
| 6 | Conflict (version/idempotency) |
| 7 | Validation failed |
| 8 | Rate limited (honor `Retry-After`) |
| 9 | Network/timeout/offline |
| 10 | Server error |
| 11 | Upgrade required (`minVersion`) |
| 130 | Interrupted (SIGINT) |
| 143 | Terminated (SIGTERM) |

Map every SDK error `kind` to exactly one code; a new kind is a contract
change. A usage error is 2, never 1. A permission denial is 4, never 1.

## 4. Flags and env

- `-h/--help`, `-v/--version` (fast path, no engine load).
- `-p/--print`, `--output-format text|json|stream-json`, `--output <file>`.
- `--json`, `--query <expr>`, `--fields a,b`.
- `--profile`, `--tenant` (sent as a header, validated server-side).
- `--yes/-y`, `--dry-run`, `--no-input`.
- `--limit`, `--cursor`, `--all`.
- `--wait`, `--timeout`, `--no-wait`.
- `--idempotency-key`.
- `--debug [categories]`, `--verbose`, `--quiet`.
- `--config <path>`, `--settings <file>`.
- Env fallbacks: token, API URL, profile; never a secret printed.

## 5. Help, completions and docs

- Generated from the command registry: usage, examples, flags, env vars,
  exit codes, links.
- `completion bash|zsh|fish|powershell`; the completion table is generated
  from the same registry.
- "Did you mean" suggestions; concise errors with a next step and a docs URL.
- Man pages/markdown reference generated, not hand-written.

## 6. Accessibility and i18n

- `--accessible`/`HMD_ACCESSIBLE=1`: no spinners/animations, linear output,
  descriptive text, ASCII fallback, no color-only meaning.
- Width is grapheme-aware (CJK/emoji); RTL is considered for text output.
- `LANG`/`LC_*` and UTF-8 are honored; the Windows code page is handled.
