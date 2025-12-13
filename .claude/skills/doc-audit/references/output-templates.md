# Output Templates

Report templates for documentation audits.

## Complete Audit Report

Use for full project audits.

```markdown
## Documentation Audit Report
**Date**: [YYYY-MM-DD]
**Scope**: [Full project | docs/ folder | README only]
**Auditor**: documentation-auditor agent

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Files Audited** | [X] |
| **Claims Verified** | [Y] |
| **Discrepancies Found** | [Z] |

### Confidence Breakdown
- **Certain (Must Fix)**: [count]
- **Probable (Should Fix)**: [count]
- **Needs Verification**: [count]

### Categories
- Missing: [count]
- Incorrect: [count]
- Stale: [count]
- Undocumented: [count]

---

## Critical Discrepancies (Certain - Must Fix)

### Missing Files/Functions

| Documentation Claim | Location | Evidence | Git Context | Suggested Fix |
|---------------------|----------|----------|-------------|---------------|
| `src/utils/old.js` | README.md:23 | File not found | Renamed in abc123 (2024-01-15) | Update to `src/lib/new.js` |

### Incorrect References

| Documentation | Location | Actual Code | Confidence | Fix |
|---------------|----------|-------------|------------|-----|
| `createUser(name)` | docs/api.md:45 | `createUser(name, options)` | Certain | Add `options` param |

---

## Warnings (Probable - Should Fix)

### Stale Examples

| Example Location | Issue | Evidence |
|------------------|-------|----------|
| README.md:45-52 | Import path changed | `'./old'` → `'./new'` |

### Outdated Signatures

| Documentation | Actual | Diff |
|---------------|--------|------|
| `getUser(id)` | `getUser(id, opts?)` | Added optional param |

---

## Suggestions (Needs Verification)

### Possible Intentional Differences

| Item | Location | Notes | Recommended Action |
|------|----------|-------|-------------------|
| `_internalHelper` | Not in docs | Underscore prefix suggests private | Verify with maintainer |

---

## Undocumented Features

Features found in code but not in documentation:

| Feature | Code Location | Recommendation |
|---------|--------------|----------------|
| `newHelper()` | src/utils/index.js:34 | Add to API docs |
| `UserOptions` type | src/types/index.ts:12 | Document in types section |

---

## Git Context Summary

Recent changes that may explain documentation drift:

| File | Recent Commits | Impact |
|------|----------------|--------|
| src/api/users.js | abc123: Refactored params | 3 signature mismatches |
| src/utils/index.ts | def456: Added exports | 2 undocumented features |

---

## Recommended Actions

### Priority 1: Immediate (Critical)
1. Update `README.md:23`: Change `src/utils/old.js` → `src/lib/new.js`
2. Update `docs/api.md:45`: Add `options` parameter to `createUser`

### Priority 2: Soon (Warnings)
1. Fix example at `README.md:45-52`: Update import path
2. Update signature for `getUser` in docs

### Priority 3: Review (Suggestions)
1. Confirm `_internalHelper` should remain undocumented
2. Review newly exported features for documentation

---

## Verification Methodology

- [x] All claims enumerated before checking (prevents spot-check bias)
- [x] Bidirectional verification (docs→code and code→docs)
- [x] Every finding has file:line evidence
- [x] All findings double-verified before reporting
- [x] Git history consulted for context
- [x] Confidence levels calibrated
- [x] Specific fixes provided for each issue
```

---

## Quick Report (Single File)

Use for single-file or quick audits.

```markdown
## Audit: [filename.md]
**Date**: [YYYY-MM-DD]

### Summary
- **Verified Claims**: [X/Y passed]
- **Discrepancies Found**: [Z]

### Findings

| Line | Claim | Status | Evidence | Fix |
|------|-------|--------|----------|-----|
| 23 | `import { foo }` | Missing | `foo` not exported from index | Change to `bar` |
| 45 | `./src/old.js` | Stale | Renamed to `./src/new.js` | Update path |
| 67 | `createUser(name)` | Incorrect | Actual: `createUser(name, opts)` | Add param |

### Git Context
- **Last doc update**: [date] - [commit message]
- **Last code change**: [date] - [commit message]
- **Drift period**: [X days/weeks]

### Quick Fixes
```diff
- Line 23: import { foo } from './utils'
+ Line 23: import { bar } from './utils'

- Line 45: See ./src/old.js for details
+ Line 45: See ./src/new.js for details
```
```

---

## Discrepancy Entry Format

Each individual discrepancy should include:

```markdown
### [Category]: [Brief Description]

**Location**: `[file]:[line]`
**Confidence**: [Certain|Probable|Needs Verification]

**Documented**:
```
[exact text from documentation]
```

**Actual**:
```
[what the code actually shows]
```

**Evidence**: [file:line showing the actual state]

**Git Context**:
- Commit: [hash] ([date])
- Author: [email]
- Message: "[commit message]"

**Suggested Fix**:
```diff
- [old text]
+ [new text]
```
```

---

## Undocumented Feature Entry

```markdown
### Undocumented: [feature name]

**Location**: `[file]:[line]`
**Type**: [export|function|type|endpoint]

**Code**:
```typescript
[the undocumented code]
```

**Recommendation**: [Add to X section | Create new section | Mark as internal]

**Suggested Documentation**:
```markdown
### [feature name]

[Suggested documentation text]
```
```

---

## Summary Statistics Block

Include at top of any report:

```markdown
## Audit Statistics

| Category | Count | % |
|----------|-------|---|
| Total Claims | [X] | 100% |
| Verified | [Y] | [Y/X]% |
| Discrepancies | [Z] | [Z/X]% |

| Confidence | Count |
|------------|-------|
| Certain | [A] |
| Probable | [B] |
| Needs Verification | [C] |

| Discrepancy Type | Count |
|------------------|-------|
| Missing | [D] |
| Incorrect | [E] |
| Stale | [F] |
| Undocumented | [G] |
```
