---
name: packaging
description: "Delegate to the packaging skill for the <app> CLI."
division: client
---

# /packaging

## Delegate

Delegate to the **packaging** skill.

Activate when a `<app>` CLI release is to be built and shipped: the
single-binary build per OS/arch, the signing and notarization, the update
manifest and the installer channel. The skill produces the build steps, the
signing steps and the manifest together, so the release is signed, monotonic
and reversible.

Do not activate for a code change that does not touch distribution: a new
command, a bug fix or a refactor needs no packaging work.
