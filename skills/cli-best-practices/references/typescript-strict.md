# TypeScript strict for CLIs

The tsconfig set and the type patterns that make a command hard to break. The
point is not "more types"; it is that an unhandled exit code or an unvalidated
argv fails to compile or is caught by the harness.

## 1. The strict set

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true
  }
}
```

- `noUncheckedIndexedAccess` turns `argv[0]` into `string | undefined`; the
  parser forces the check.
- `exactOptionalPropertyTypes` distinguishes an absent flag from an explicit
  `undefined`.
- `verbatimModuleSyntax` makes `import type` explicit; the bundler drops
  type-only imports without guessing.
- `module: NodeNext` matches the Node runtime; a bundled binary keeps the
  same extension rules.

## 2. Discriminated unions

```ts
type LoadState<T> =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; data: T }
  | { status: "error"; error: { code: string; correlationId?: string } };
```

- A literal `status`/`kind` is the discriminant; narrow with `switch`.
- Every switch is exhaustive: `default: { const _never: never = state; }` or
  `satisfies never`. A new variant is a compile error.
- The exit-code map is a switch over the error union; a new kind is a compile
  error, not a silent exit 1.

## 3. Branded ids

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };
type SessionId = Brand<string, "SessionId">;
type RunId = Brand<string, "RunId">;
```

A function that takes a `RunId` cannot receive a `SessionId` or a raw string.
Brand at the boundary (the argv parser, the SDK response), not in every
command.

## 4. Result types

```ts
type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };
```

- Use cases return `Result` for expected failures (usage, auth, network);
  throw only for programmer errors.
- A command maps `Result` to output + exit code; it does not throw past the
  boundary.
- Every error carries a stable `code`, a human message and a `correlationId`.

## 5. Boundary types

- Parse argv once with a typed parser; validate positionals, flags and env
  fallbacks.
- Parse config files, policy documents and API responses with a schema.
- `unknown` at the boundary, never `any`; narrow with the schema.
- A DTO is not a view model: map it in the command, not in the core.

## 6. Async and process discipline

- `no-floating-promises` and `no-misused-promises` are errors: await, `void`
  with an internal catch, or return the promise.
- A signal handler restores state and sets `process.exitCode`; it does not
  `process.exit()` mid-render.
- A stream writer handles `EPIPE` and backpressure; it does not buffer an
  unbounded response.

## 7. Type-level review questions

1. Could this state be a union instead of booleans?
2. Is every switch exhaustive, including the exit-code map?
3. Is this `as` justified and commented?
4. Is the id branded, or can a raw string stand in?
5. Is every external value parsed once (argv, config, API, file)?
6. Does the type survive `noUncheckedIndexedAccess`?
7. Does the error path return a `Result`, or throw past the command?
