# Cognitive Tools for Documentation Auditing

Detailed specifications for the mental tools used during documentation audits.

## 1. Claim Extractor

**Purpose**: Parse documentation into testable assertions.

### Extraction Targets

```
/cognitive.tool{
  name="claim_extractor",
  extracts=[
    "file_paths",           // './src/utils/helper.js'
    "function_signatures",  // 'createUser(name: string, email: string)'
    "type_definitions",     // 'interface User { id: number; }'
    "exports",              // 'export { helper, utils, types }'
    "code_examples",        // ```javascript blocks
    "api_endpoints",        // 'GET /api/users/:id'
    "configuration_keys"    // 'DEBUG=true'
  ],
  output="structured_claims_list"
}
```

### Extraction Process

1. Read documentation file
2. Identify all code blocks, inline code, and path references
3. Categorize each into claim types
4. Create structured list with:
   - Claim text
   - Claim type
   - Source location (file:line)
   - Category (file_ref, code_ref, api_ref, example, config)

### Example Output

```json
{
  "claims": [
    {
      "text": "./src/utils/helper.js",
      "type": "file_path",
      "source": "README.md:23",
      "category": "file_references"
    },
    {
      "text": "createUser(name: string, email: string)",
      "type": "function_signature",
      "source": "docs/api.md:45",
      "category": "code_references"
    }
  ]
}
```

---

## 2. Evidence Gatherer

**Purpose**: Systematically verify claims against codebase.

### Verification Strategies

```
/cognitive.tool{
  name="evidence_gatherer",
  strategies=[
    {claim_type="file_path", verify="Glob for file, Read if found"},
    {claim_type="function", verify="Grep for signature, Read context"},
    {claim_type="export", verify="Read index files, compare exports"},
    {claim_type="type", verify="Grep for definition, validate shape"},
    {claim_type="example", verify="Check syntax, verify imports exist"}
  ]
}
```

### Evidence Format

For each claim, record:

```json
{
  "claim": "original assertion from docs",
  "status": "verified|missing|incorrect|stale",
  "evidence": "file:line or 'not found after searching X locations'",
  "confidence": "certain|probable|needs_verification",
  "actual": "what the code actually shows (if different)"
}
```

### Verification Commands

| Claim Type | Primary Tool | Fallback |
|------------|--------------|----------|
| File path | `Glob: {exact_path}` | `Glob: **/{filename}` |
| Function | `Grep: "function {name}"` | `Grep: "{name}.*="` |
| Export | `Read: index.{ts,js}` | `Grep: "export.*{name}"` |
| Type | `Grep: "interface {name}"` | `Grep: "type {name}"` |
| Example imports | `Grep: "from ['\"].*{module}"` | Check package.json |

---

## 3. Diff Analyzer

**Purpose**: Compare documented state vs actual state.

### Comparison Types

```
/cognitive.tool{
  name="diff_analyzer",
  comparisons=[
    {type="exports", compare="documented_list vs actual_index_exports"},
    {type="signatures", compare="documented_params vs actual_params"},
    {type="file_structure", compare="documented_paths vs glob_results"},
    {type="types", compare="documented_shape vs actual_definition"}
  ]
}
```

### Output Structure

```json
{
  "matches": [
    {"documented": "X", "actual": "X", "location": "file:line"}
  ],
  "discrepancies": [
    {
      "documented": "createUser(name)",
      "actual": "createUser(name, options)",
      "severity": "high",
      "type": "signature_mismatch"
    }
  ],
  "undocumented": [
    {"feature": "newHelper()", "location": "src/utils/index.js:34"}
  ]
}
```

### Severity Classification

| Severity | Criteria |
|----------|----------|
| **Critical** | Missing file, wrong path, deleted export |
| **High** | Signature mismatch, type definition wrong |
| **Medium** | Outdated example, stale code block |
| **Low** | Minor naming differences, formatting |

---

## 4. Git Archaeologist

**Purpose**: Explain WHY discrepancies exist through git history.

### Commands

```
/cognitive.tool{
  name="git_archaeologist",
  commands=[
    "git log --oneline -10 -- {file}",
    "git log --oneline --all --source -- {file}",
    "git show {commit}:{file}",
    "git blame -L {start},{end} {file}"
  ]
}
```

### Insight Categories

| Insight | Indicators | Impact |
|---------|------------|--------|
| **Recent rename** | `git log` shows move/rename | Update paths in docs |
| **Parameter change** | Function signature modified | Update signature in docs |
| **Feature addition** | New export not in docs | Add documentation |
| **Deprecation** | Code removed, docs remain | Remove from docs |
| **Refactoring** | Structure changed | Comprehensive update needed |

### Archaeology Process

1. For each discrepancy, identify the relevant file(s)
2. Run `git log --oneline -10 -- {file}` to see recent history
3. Look for commits that explain the drift:
   - Renames: "renamed", "moved", "reorganized"
   - Changes: "refactor", "update", "fix"
   - Additions: "add", "implement", "new"
   - Removals: "remove", "delete", "deprecate"
4. Extract commit hash, author, date, message
5. Include in report as context

---

## 5. Confidence Scorer

**Purpose**: Calibrate certainty of findings to prevent false positives.

### Confidence Levels

```
/cognitive.tool{
  name="confidence_scorer",
  levels={
    certain={
      criteria=["file_does_not_exist", "function_not_found", "export_missing"],
      confidence=1.0,
      evidence_required="glob/grep showing absence"
    },
    probable={
      criteria=["signature_mismatch", "type_shape_different", "outdated_example"],
      confidence=0.8,
      evidence_required="side_by_side_comparison"
    },
    needs_verification={
      criteria=["semantic_change_possibly_intentional", "alternative_location_possible"],
      confidence=0.5,
      evidence_required="human_review_suggested"
    }
  }
}
```

### Scoring Process

1. **Start with evidence quality**:
   - Direct absence (glob returns nothing) → Certain
   - Mismatch found (different content) → Probable
   - Ambiguous (might be elsewhere) → Needs verification

2. **Adjust for context**:
   - Internal/private API → Lower confidence (may be intentional)
   - Public API → Higher confidence (should be documented)
   - Recent git activity → Higher confidence (likely real drift)

3. **Apply double-check**:
   - Re-read documentation source
   - Re-verify code location
   - Check alternative locations
   - Only then assign final confidence

### Confidence Thresholds for Reporting

| Confidence | Report As | Action |
|------------|-----------|--------|
| ≥ 0.9 | **Critical** | Must fix |
| 0.7-0.9 | **Warning** | Should fix |
| 0.5-0.7 | **Suggestion** | Verify with maintainer |
| < 0.5 | Don't report | Insufficient evidence |
