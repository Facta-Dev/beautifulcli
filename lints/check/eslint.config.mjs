// Beautiful CLI drop-in lints
//
// Paste this into your repo root (read the overrides below first, then add
// your project-specific ignores on the first entry). It makes eslint enforce
// the rules from the cli-best-practices skill that a linter can check: the
// headless-core walls, the output-port rule, the no-remote-code rule, and the
// silencing requirements. Silence a rule locally with a reason, which the
// config requires.
//
// Everything beyond the pinned rules rides the typescript-eslint
// strictTypeChecked + stylisticTypeChecked presets. Make CI strict with:
//
//     npx eslint .
//
// The lints/check project proves every pinned rule fires: see
// scripts/check-lints.sh and tests/contracts/test_lints_contract.py.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";

const CORE_PLATFORM_MESSAGE =
  "The core never touches process, fs or child_process: platform access goes through a port — see the 'Architecture contract' in cli-best-practices.";

const CORE_TUI_MESSAGE =
  "The core never imports the TUI or a command: it is a headless library — see the 'Architecture contract' in cli-best-practices.";

const COMMAND_TUI_MESSAGE =
  "A command never imports the TUI: it runs headless and maps its result to output and an exit code — see the 'Architecture contract' in cli-best-practices.";

export default tseslint.config(
  { ignores: ["dist/", "node_modules/", "coverage/", "src/gen/"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      "@eslint-community/eslint-comments": eslintComments,
    },
    rules: {
      // stdout is data and goes through the output port, not console.*.
      "no-console": "error",
      // No remote code, no eval, no Function constructor.
      "no-eval": "error",
      "no-new-func": "error",
      "@typescript-eslint/no-implied-eval": "error",
      "no-debugger": "error",
      // Silencing must be narrow, explained, and rare: @ts-expect-error with a
      // reason on the narrowest line; ts-ignore and ts-nocheck are flat out.
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksConditionals: true, checksVoidReturn: true },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      // Muting attempts are themselves findings.
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",
      "@eslint-community/eslint-comments/require-description": ["error", { ignore: [] }],
    },
  },
  {
    // The core is a headless library: no process, fs, child_process, TUI or
    // command imports.
    files: ["src/core/**/*.{ts,tsx}", "src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "process", message: CORE_PLATFORM_MESSAGE },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "fs", message: CORE_PLATFORM_MESSAGE },
            { name: "node:fs", message: CORE_PLATFORM_MESSAGE },
            { name: "child_process", message: CORE_PLATFORM_MESSAGE },
            { name: "node:child_process", message: CORE_PLATFORM_MESSAGE },
            { name: "ink", message: CORE_TUI_MESSAGE },
          ],
          patterns: [
            { group: ["@/tui", "@/tui/*", "@/commands", "@/commands/*", "**/tui/*", "**/commands/*"], message: CORE_TUI_MESSAGE },
          ],
        },
      ],
    },
  },
  {
    // A command runs headless; the TUI is a separate frontend.
    files: ["src/commands/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [{ name: "ink", message: COMMAND_TUI_MESSAGE }],
          patterns: [{ group: ["@/tui", "@/tui/*", "**/tui/*"], message: COMMAND_TUI_MESSAGE }],
        },
      ],
    },
  },
);
