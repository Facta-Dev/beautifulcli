---
name: add-command
description: "Delegate to the add-command skill for the <app> CLI."
division: client
---

# /add-command

## Delegate

Delegate to the **add-command** skill.

Activate when the user asks to scaffold a new `<app>` CLI subcommand under
`src/features/<scope>/adapters/in/` - a use case, a thin argv handler, an
output schema and the command-registry wiring - together with the contract and
golden-test gate. The skill produces the wiring sketch and the boundary
checklist in one change, so a command never lands without its registration,
its exit-code mapping and its golden fixture.

Do not activate for an in-slice refactor that adds no new command and no new
cross-boundary dependency - that is ordinary implementation work.
