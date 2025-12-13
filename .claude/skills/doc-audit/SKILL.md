---
name: doc-audit
description: Documentation-Code consistency auditing with bidirectional verification. This skill should be used when auditing documentation accuracy against codebase reality, detecting stale docs, finding undocumented features, or verifying API references.
---

# Documentation Audit Skill

Systematic verification of documentation claims against codebase evidence with calibrated confidence and git-aware context.

## Critical Invariants

Before ANY audit or report, ensure:

1. **Exhaustive enumeration** — list ALL claims before checking ANY (prevents spot-check bias)
2. **Bidirectional verification** — always check docs→code AND code→docs
3. **Double verification** — re-read both doc and code before flagging discrepancy
4. **Evidence attachment** — every finding MUST have file:line proof
5. **Git context** — explain WHY drift occurred, not just WHAT
6. **Confidence calibration** — assign certainty levels (certain/probable/needs_verification)
7. **Actionable output** — every finding includes specific fix suggestion

## Task-Based Workflows

Determine the audit type, then follow the corresponding workflow:

| Audit Type | Workflow | Phases to Run |
|------------|----------|---------------|
| Quick README check | → [Quick Audit](#quick-audit-workflow) | 1, 2 (docs→code only), 5 |
| Single file audit | → [Single File Audit](#single-file-audit-workflow) | All phases, focused scope |
| Full project audit | → [Full Audit](#full-audit-workflow) | All phases, exhaustive |
| API docs verification | → [API Audit](#api-audit-workflow) | Focus on exports, signatures |
| Stale docs detection | → [Staleness Audit](#staleness-audit-workflow) | Git-heavy, recent changes |

---

### Quick Audit Workflow

For fast README or single-doc verification (~5 min):

1. **Extract claims** from target doc only
2. **Verify docs→code** for critical paths (file refs, main exports)
3. **Skip** code→docs direction
4. **Skip** deep git archaeology
5. **Report** using Quick Report format

---

### Single File Audit Workflow

For thorough single-file verification:

1. **Extract ALL claims** from the target file
2. **Verify bidirectionally** — both directions
3. **Git context** for any discrepancies found
4. **Double-verify** before reporting
5. **Report** using Quick Report format with git context

---

### Full Audit Workflow

For comprehensive project documentation audit:

1. **Enumerate all docs**: `README.md`, `docs/**/*.md`, `*.md`, inline JSDoc
2. **Extract ALL claims** across all docs — see `references/cognitive-tools.md`
3. **Run all 5 phases** — see `references/verification-protocols.md`
4. **Generate full report** — see `references/output-templates.md`

---

### API Audit Workflow

For API documentation verification:

1. **Focus extraction** on: exports, function signatures, type definitions
2. **Scan codebase** for all public exports (`index.ts`, `index.js`, `mod.rs`)
3. **Compare** documented vs actual exports
4. **Flag**: missing docs for public API, incorrect signatures, deprecated items
5. **Report** with code→docs emphasis

---

### Staleness Audit Workflow

For detecting outdated documentation:

1. **Get git history** of doc files: `git log --oneline -20 -- docs/`
2. **Get git history** of source files: `git log --oneline -20 -- src/`
3. **Compare timestamps** — docs older than recent code changes = suspect
4. **Verify suspected stale sections** against current code
5. **Report** with timeline context

---

## Claim Types to Extract

When parsing documentation, extract these testable assertions:

| Claim Type | Example | Verification Method |
|------------|---------|---------------------|
| File paths | `./src/utils/helper.js` | Glob for file existence |
| Function signatures | `createUser(name: string)` | Grep + Read context |
| Type definitions | `interface User { id: number }` | Grep for definition |
| Exports | `export { helper, utils }` | Read index files |
| Code examples | ` ```javascript ` blocks | Verify imports exist |
| API endpoints | `GET /api/users/:id` | Grep route definitions |
| Config keys | `DEBUG=true` | Check env/config files |

---

## Confidence Levels

Assign confidence to each finding:

| Level | Criteria | Evidence Required |
|-------|----------|-------------------|
| **Certain** (1.0) | File doesn't exist, function not found, export missing | Glob/Grep showing absence |
| **Probable** (0.8) | Signature mismatch, type shape different, outdated example | Side-by-side comparison |
| **Needs Verification** (0.5) | Possibly intentional, alternative location possible | Human review suggested |

---

## Anti-Patterns

Avoid these common audit mistakes:

| Anti-Pattern | Problem | Correct Approach |
|--------------|---------|------------------|
| Spot-checking | Misses systematic issues | Exhaustive enumeration first |
| Trust doc structure | Docs may not reflect code | Verify structure independently |
| Report without double-check | False positives erode trust | Re-read both sources |
| Only check deletions | Misses undocumented additions | Bidirectional checking |
| Ignore git history | Findings lack context | Always explain WHY |
| Skip code→docs | Miss new undocumented features | Always check both directions |

---

## Tool Usage Patterns

Map cognitive tasks to actual tools:

| Task | Tools | Pattern |
|------|-------|---------|
| Find docs | Glob | `**/*.md`, `docs/**/*` |
| Extract claims | Read | Parse markdown systematically |
| Verify file exists | Glob | Check claimed path |
| Find function | Grep | Search for signature |
| Read context | Read | Get surrounding code |
| Git history | Bash | `git log`, `git blame` |
| Compare exports | Read + diff | Index files vs docs |

---

## Resources

### references/

- `cognitive-tools.md` — Detailed claim extractor, evidence gatherer, diff analyzer, git archaeologist, confidence scorer
- `verification-protocols.md` — Full 5-phase verification protocol with pseudo-code
- `output-templates.md` — Complete and quick report templates
