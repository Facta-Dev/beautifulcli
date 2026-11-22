---
name: packaging
description: "Builds and ships a <app> CLI artifact - the single-binary build per OS/arch, the signing and notarization, the update manifest and the installer channel - so the release is signed, monotonic and reversible."
division: client
---

# <app> Packaging

A reusable workflow for turning the `<app>` CLI source into a shippable, verifiable release. A build that is not signed, not monotonic or not reversible is not a release; it is a build log. This skill produces the single-binary build, the signing steps, the update manifest and the installer wiring together.

## When to Activate

- A release candidate is to be built for one or more OS/arch targets.
- A new distribution channel (package manager, npm wrapper, container image) is added.
- The update manifest, the signing job or the rollback path changes.
- A reviewer asks whether an artifact is verifiable before it ships.

Do not activate for a code change that does not touch distribution: a new command, a bug fix or a refactor needs no packaging work.

## Core Principles

- Single binary per OS/arch. x64 and arm64, glibc and musl on Linux; the build is reproducible and the artifact is smoke-tested on a clean machine before shipping.
- Signed, then monotonic, then reversible. The signature, the monotonic version and the rollback path are checked in that order; no later check excuses a failure of an earlier one.
- Keys never leave the isolated CI job. Signing runs in a dedicated job with approval; a signing secret on a developer machine is a compromise.
- No update without trust. The manifest is signed, the hash is verified before apply, and a downgrade or an unsigned artifact is rejected and reported.
- Installers verify, they do not trust. `curl | sh`, package-manager channels and the npm optional-dependency wrapper all verify a checksum or signature; no channel installs from a bare URL.

## Rules

- Anti-hallucination: the build targets, the signing requirements and the manifest fields must match the shipped artifact; do not invent a hash or a version that was not built.
- Every claim needs a source: cite the local build script for the target and the playbook for the signing rule.
- Do not emit the final output as a fenced code block when raw output is expected.
- An unsigned, hash-mismatched or downgrade manifest is a BLOCK.
- A channel that installs without verifying a checksum or signature is a REVISE: add the verification step.
- Every release ships a post-build smoke test per target and a rollback test, so the artifact boots and the previous version survives.
- The Windows rule is honoured: a running `.exe` cannot be overwritten - stage the new file and swap on next launch.

## Research References

Provenance table - every claim in a finding needs a row.

| claim | source | year | link |
| --- | --- | --- | --- |
| Single-binary packaging per OS/arch and the Bun/Node SEA/Deno trade-offs | `PLAYBOOK_CLI.md` section 12.1 | 2024 | local file |
| Authenticode, notarization and GPG/cosign signing requirements per OS | `PLAYBOOK_CLI.md` section 12.2 | 2024 | local file |
| Signed manifest, monotonic version and atomic swap with rollback | `PLAYBOOK_CLI.md` section 12.3 | 2024 | local file |
| Installer trust: versioned URLs, published checksums, non-root install | `PLAYBOOK_CLI.md` section 12.1 | 2024 | local file |
| A running Windows executable cannot be replaced; swap on next launch | `PLAYBOOK_CLI.md` section 6.1 | 2024 | local file |

## Output Format

A release plan plus a trust summary. Plain text - not a fenced block:

```
RELEASE  <app>  v2.4.1  channel: stable

  targets:
    apps/cli/dist/<app>-linux-x64, linux-arm64, linux-x64-musl, macos-x64,
    macos-arm64, windows-x64, windows-arm64

  signing:
    windows: Authenticode (CI job, HSM)
    macos:   Developer ID + hardened runtime + notarization
    linux:   GPG-signed repo + cosign archive signatures

  manifest:
    packaging/manifest.json - signed Ed25519, monotonic 2.4.1 >
    minSupportedVersion 2.3.0, per-target hash and size

  smoke:
    scripts/ci/post-build.sh - launch smoke per target on a clean machine

TRUST
  signature: present | version: monotonic | rollback: retained
  downgrade: rejected | unsigned: rejected

CHECKLIST
  [ ] reproducible single binary per target
  [ ] signing configured and never weakened
  [ ] manifest signed and hash-verified before apply
  [ ] rollback path tested
  [ ] installer channel verifies a checksum or signature
  [ ] post-build smoke green on a clean machine
```

Summary line: `packaging: N target(s) built, trust: signed/monotonic/reversible - verdict: APPROVE | REVISE`.
