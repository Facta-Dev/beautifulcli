# Graph Report - .  (2026-11-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 887 nodes · 1199 edges · 120 communities (76 shown, 44 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f8292415`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Beautiful CLI
- write
- HarnessTest
- Path
- _support.py
- check-examples.py
- interface
- test_checker_failure_paths.py
- What You Must Do When Invoked
- YamlParser
- GateScript
- CLI best practices
- package.json
- compilerOptions
- 2. Categories, in ranking order
- workflow_text
- CLI architecture contract
- BestPractices
- A worked review: the deploy command
- CLI patterns
- graphify reference: extra exports and benchmark
- TypeScript strict for CLIs
- CLI port
- _load
- <app> Output Contract Reviewer Agent
- <app> Packaging Reviewer Agent
- <app> Architect Agent
- <app> Build Resolver Agent
- <app> Code Reviewer Agent
- <app> Planner Agent
- <app> TDD Guide Agent
- <app> Injection and Trust Reviewer Agent
- <app> Test Author Agent
- <app> Add Command
- <app> Claim Check skill
- <app> Clean-Room Rebuild skill
- <app> Corpus Retrieval skill
- <app> Diagnosing Bugs skill
- <app> Domain Modeling skill
- <app> Exit Code Contract
- <app> Grilling skill
- <app> Learn
- <app> Packaging
- <app> Plan
- <app> PTY Tests
- <app> Research skill
- <app> Review
- <app> Ship
- <app> Spec
- <app> Test-Driven Development skill
- <app> Verified Status skill
- <app> Visual Review skill
- graphify reference: query, path, explain
- build
- beautifulcli — agent instructions
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- index.ts
- consistent-type-imports.ts
- check-lints.sh
- guard-bash.sh
- /add-command
- /claim-check
- /clean-room-rebuild
- /corpus-retrieval
- /diagnosing-bugs
- /domain-modeling
- /exit-code-contract
- /grilling
- /learn
- /packaging
- /plan
- /pty-tests
- /research
- /review
- /ship
- /spec
- /tdd
- /verified-status
- /visual-review
- Playbooks for `beautifulcli` — load on demand
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- switch-exhaustiveness.ts
- CLAUDE.md
- README.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- extraction-spec.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- eval.ts
- new-func.ts
- no-unnecessary-type-assertion.ts
- view
- second
- view

## God Nodes (most connected - your core abstractions)
1. `write()` - 35 edges
2. `CheckSkillTests` - 35 edges
3. `build_valid_repo()` - 32 edges
4. `Checker` - 26 edges
5. `check_repo()` - 17 edges
6. `YamlParser` - 16 edges
7. `CLI best practices` - 16 edges
8. `Beautiful CLI` - 15 edges
9. `interface` - 14 edges
10. `compilerOptions` - 12 edges

## Surprising Connections (you probably didn't know these)
- `add_portable_plugin()` --calls--> `write()`  [EXTRACTED]
  tests/unit/test_check_skill_unit.py → tests/_support.py
- `build_valid_repo()` --calls--> `write()`  [EXTRACTED]
  tests/unit/test_check_skill_unit.py → tests/_support.py

## Import Cycles
- None detected.

## Communities (120 total, 44 thin omitted)

### Community 0 - "Beautiful CLI"
Cohesion: 0.05
Nodes (37): Added, Changelog, [Unreleased], Contributing, Good first contributions, License, Making a change, Style (+29 more)

### Community 1 - "write"
Cohesion: 0.18
Nodes (9): write(), add_portable_plugin(), build_valid_repo(), CheckSkillTests, error_messages(), formatted(), png_header(), portable_with() (+1 more)

### Community 2 - "HarnessTest"
Cohesion: 0.07
Nodes (7): DomainWallTest, EndToEndTest, FallbackTest, FindBlocksTest, HarnessTest, MappingTest, RepoTest

### Community 3 - "Path"
Cohesion: 0.16
Nodes (17): check_repo(), Checker, _fold_block(), format_problem(), _is_relative(), _json_key_line(), main(), _normalize_url() (+9 more)

### Community 4 - "_support.py"
Cohesion: 0.09
Nodes (16): ledger_data(), ledger_paths(), ledger_skip_count(), LedgerAgrees, LedgerShape, path -> the file entry, only for entries that are objects., Count of block specs that ledger a skip (the checker must match it)., The checker's skipped count must equal the ledger's skip count. (+8 more)

### Community 5 - "check-examples.py"
Cohesion: 0.13
Nodes (33): apply_harness(), as_text(), Block, build_project(), check_brackets(), check_quotes(), check_repo(), doc_files() (+25 more)

### Community 6 - "interface"
Cohesion: 0.07
Nodes (29): author, name, url, interface, publication, description, extensions, com.openai (+21 more)

### Community 7 - "test_checker_failure_paths.py"
Cohesion: 0.10
Nodes (15): BrokenTsBlock, CopiedRepoFailures, DeletedLints, GuardedRepoCase, has_eslint(), A broken ```ts block in a bare doc tree fails check-examples., Failure paths that mutate a full copy of the repo., Text surgery on a copy's lints: removing a pinned rule from BOTH the     drop-in (+7 more)

### Community 8 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 9 - "YamlParser"
Cohesion: 0.25
Nodes (8): Exception, _parse_quoted(), parse_yaml(), Any, Small YAML subset: maps, lists, quoted scalars, | and > blocks., _split_flow(), YamlError, YamlParser

### Community 10 - "GateScript"
Cohesion: 0.12
Nodes (7): ConfigPairing, explicit_rules(), GateScript, HarnessCoverage, marker_names(), The shell contract: bounded runs, surfaced stderr, explicit non-JSON., Rule ids configured at the top level of any rules block in the config.

### Community 11 - "CLI best practices"
Cohesion: 0.12
Nodes (16): 10. Security, 11. Config, state and managed policy, 12. Performance and startup, 13. Testing, 14. Cross-skill contract, 1. Mindset, 2. Before you hand back code, 3. Streams and exit codes (+8 more)

### Community 12 - "package.json"
Cohesion: 0.13
Nodes (14): description, devDependencies, eslint, @eslint-community/eslint-plugin-eslint-comments, @eslint/js, @types/node, typescript, typescript-eslint (+6 more)

### Community 13 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, baseUrl, lib, module, moduleResolution, noEmit, noUncheckedIndexedAccess, paths (+6 more)

### Community 14 - "2. Categories, in ranking order"
Cohesion: 0.13
Nodes (14): 1. Report shape, 2. Categories, in ranking order, 3. Waived gates, 4. How to review, 5. Worked example, 6. Cross-skill contract, Architecture contracts (always Must fix, ranked first), CLI review (+6 more)

### Community 15 - "workflow_text"
Cohesion: 0.22
Nodes (5): CheckerSteps, Every existing CI job keeps its exact entrypoint and pin., The unittest gate: the full discovery is the CI job itself., TestsJob, workflow_text()

### Community 16 - "CLI architecture contract"
Cohesion: 0.17
Nodes (11): 10. The enforcement map, 1. The layers, 2. Ports, 3. Composition roots, 4. Command registry and route table, 5. Modes, 6. Config and state, 7. Security and trust (+3 more)

### Community 17 - "BestPractices"
Cohesion: 0.29
Nodes (4): BestPractices, bp_body(), ReviewSkill, rv_body()

### Community 18 - "A worked review: the deploy command"
Cohesion: 0.20
Nodes (9): A worked review: the deploy command, Must fix, Should fix, The fixed module, The module under review, The report, Verdict, Waived gates (+1 more)

### Community 19 - "CLI patterns"
Cohesion: 0.20
Nodes (9): 1. Fast-path entry and mode router, 2. Terminal guard, 3. Output port, 4. Error to exit code, 5. Config precedence, 6. Device-code sign-in, 7. Sanitizer, 8. PTY tests (+1 more)

### Community 20 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 21 - "TypeScript strict for CLIs"
Cohesion: 0.22
Nodes (8): 1. The strict set, 2. Discriminated unions, 3. Branded ids, 4. Result types, 5. Boundary types, 6. Async and process discipline, 7. Type-level review questions, TypeScript strict for CLIs

### Community 22 - "CLI port"
Cohesion: 0.22
Nodes (8): 1. The order of work, 2. Shell script → TypeScript mapping, 3. Another CLI framework → TypeScript, 4. Web flow → CLI, 5. Behavior parity checklist, 6. What not to do, 7. Cross-skill contract, CLI port

### Community 23 - "_load"
Cohesion: 0.36
Nodes (4): _load(), ManifestPairing, Path, skill_dirs()

### Community 24 - "<app> Output Contract Reviewer Agent"
Cohesion: 0.29
Nodes (6): <app> Output Contract Reviewer Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 25 - "<app> Packaging Reviewer Agent"
Cohesion: 0.29
Nodes (6): <app> Packaging Reviewer Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 26 - "<app> Architect Agent"
Cohesion: 0.29
Nodes (6): <app> Architect Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 27 - "<app> Build Resolver Agent"
Cohesion: 0.29
Nodes (6): <app> Build Resolver Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 28 - "<app> Code Reviewer Agent"
Cohesion: 0.29
Nodes (6): <app> Code Reviewer Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 29 - "<app> Planner Agent"
Cohesion: 0.29
Nodes (6): <app> Planner Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 30 - "<app> TDD Guide Agent"
Cohesion: 0.29
Nodes (6): <app> TDD Guide Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 31 - "<app> Injection and Trust Reviewer Agent"
Cohesion: 0.29
Nodes (6): <app> Injection and Trust Reviewer Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 32 - "<app> Test Author Agent"
Cohesion: 0.29
Nodes (6): <app> Test Author Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 33 - "<app> Add Command"
Cohesion: 0.29
Nodes (6): <app> Add Command, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 34 - "<app> Claim Check skill"
Cohesion: 0.29
Nodes (6): <app> Claim Check skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 35 - "<app> Clean-Room Rebuild skill"
Cohesion: 0.29
Nodes (6): <app> Clean-Room Rebuild skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 36 - "<app> Corpus Retrieval skill"
Cohesion: 0.29
Nodes (6): <app> Corpus Retrieval skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 37 - "<app> Diagnosing Bugs skill"
Cohesion: 0.29
Nodes (6): <app> Diagnosing Bugs skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 38 - "<app> Domain Modeling skill"
Cohesion: 0.29
Nodes (6): <app> Domain Modeling skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 39 - "<app> Exit Code Contract"
Cohesion: 0.29
Nodes (6): <app> Exit Code Contract, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 40 - "<app> Grilling skill"
Cohesion: 0.29
Nodes (6): <app> Grilling skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 41 - "<app> Learn"
Cohesion: 0.29
Nodes (6): <app> Learn, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 42 - "<app> Packaging"
Cohesion: 0.29
Nodes (6): <app> Packaging, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 43 - "<app> Plan"
Cohesion: 0.29
Nodes (6): <app> Plan, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 44 - "<app> PTY Tests"
Cohesion: 0.29
Nodes (6): <app> PTY Tests, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 45 - "<app> Research skill"
Cohesion: 0.29
Nodes (6): <app> Research skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 46 - "<app> Review"
Cohesion: 0.29
Nodes (6): <app> Review, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 47 - "<app> Ship"
Cohesion: 0.29
Nodes (6): <app> Ship, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 48 - "<app> Spec"
Cohesion: 0.29
Nodes (6): <app> Spec, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 49 - "<app> Test-Driven Development skill"
Cohesion: 0.29
Nodes (6): <app> Test-Driven Development skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 50 - "<app> Verified Status skill"
Cohesion: 0.29
Nodes (6): <app> Verified Status skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 51 - "<app> Visual Review skill"
Cohesion: 0.29
Nodes (6): <app> Visual Review skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 52 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 53 - "build"
Cohesion: 0.53
Nodes (5): build(), main(), package_files(), Path, Files to package, relative to root, in a stable order.

### Community 54 - "beautifulcli — agent instructions"
Cohesion: 0.50
Nodes (3): beautifulcli — agent instructions, graphify, Model routing (Claude Code + Ollama)

### Community 55 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 56 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 57 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 60 - "check-lints.sh"
Cohesion: 0.83
Nodes (3): bounded(), fail(), check-lints.sh script

### Community 61 - "guard-bash.sh"
Cohesion: 0.83
Nodes (3): has(), has_i(), guard-bash.sh script

## Knowledge Gaps
- **368 isolated node(s):** `name`, `version`, `private`, `type`, `description` (+363 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `write()` connect `write` to `HarnessTest`, `_support.py`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `render()` connect `check-examples.py` to `Path`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `load_script()` connect `_support.py` to `write`, `HarnessTest`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _398 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Beautiful CLI` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `HarnessTest` be split into smaller, more focused modules?**
  _Cohesion score 0.07419712070874862 - nodes in this community are weakly interconnected._
- **Should `_support.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08558558558558559 - nodes in this community are weakly interconnected._