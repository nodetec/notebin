# Verification Protocols

Detailed 5-phase verification protocol for documentation audits.

## Phase Overview

```
Phase 1: Claim Extraction      → List ALL assertions before checking
Phase 2: Bidirectional Verify  → Docs→Code AND Code→Docs
Phase 3: Git Context           → Explain WHY drift occurred
Phase 4: Self-Verification     → Double-check before reporting
Phase 5: Output Generation     → Actionable report with fixes
```

---

## Phase 1: Documentation Claim Extraction

**Goal**: Create exhaustive list of all testable claims BEFORE checking any.

### Process

```
/phase.extract{
  process=[
    /read.documentation{
      files=["README.md", "docs/**/*.md", "*.md"],
      extract_all_assertions=true
    },
    /categorize.claims{
      categories=[
        "file_references",
        "code_references",
        "api_references",
        "example_code",
        "configuration"
      ]
    },
    /enumerate.exhaustively{
      list_all_before_checking="prevents_spot_check_bias"
    }
  ]
}
```

### Implementation Steps

1. **Enumerate all documentation files**:
   ```
   Glob: README.md
   Glob: docs/**/*.md
   Glob: *.md (root level)
   ```

2. **For each file, extract claims**:
   - Scan for code blocks (``` markers)
   - Scan for inline code (` markers)
   - Scan for file paths (./src/, /lib/, etc.)
   - Scan for function references
   - Scan for type/interface mentions

3. **Categorize each claim**:
   - `file_references`: Paths to files
   - `code_references`: Functions, methods, classes
   - `api_references`: Endpoints, routes
   - `example_code`: Code blocks meant to be runnable
   - `configuration`: Env vars, config keys

4. **Output**: Complete claims list with source locations

### Why Exhaustive First?

Spot-checking leads to:
- Confirmation bias (checking what you expect)
- Missing systematic issues
- Incomplete coverage

Exhaustive enumeration ensures:
- Every claim gets checked
- Patterns become visible
- No blind spots

---

## Phase 2: Bidirectional Verification

**Goal**: Check docs→code AND code→docs for complete coverage.

### Direction 1: Docs → Code

```
/phase.verify.direction_1="docs_to_code"{
  for_each_claim=[
    /glob{pattern="claimed_file_path"},
    /grep{pattern="claimed_function_or_type"},
    /read{file="found_file", verify="matches_claim"}
  ],
  record={status, evidence, confidence}
}
```

**Process**:
1. Take each claim from Phase 1
2. Search codebase for the claimed item
3. Record: Found/Not Found/Different
4. Attach evidence (file:line or search results)

### Direction 2: Code → Docs

```
/phase.verify.direction_2="code_to_docs"{
  scan_codebase=[
    /glob{pattern="**/*.{js,ts,py,rs}"},
    /extract{type="exports_and_public_api"},
    /compare{against="documented_items"}
  ],
  find_undocumented=[
    "new_exports",
    "new_public_functions",
    "new_types"
  ]
}
```

**Process**:
1. Scan all source files
2. Extract public API (exports, public functions, types)
3. Compare against documented items
4. Flag anything in code but not in docs

### Why Bidirectional?

| Direction | Catches |
|-----------|---------|
| Docs→Code | Stale paths, wrong signatures, deleted items |
| Code→Docs | New undocumented features, missing exports |

One direction alone misses half the problems.

---

## Phase 3: Git Context Analysis

**Goal**: Explain WHY discrepancies exist, not just WHAT.

### Process

```
/phase.contextualize{
  for_each_discrepancy=[
    /git.log{file="relevant_file", limit=10},
    /identify{
      recent_changes="explain_drift_cause",
      author="who_changed_it",
      commit_message="why_changed"
    }
  ],
  output={
    discrepancy,
    git_context,
    suggested_action
  }
}
```

### Implementation Steps

1. **For each discrepancy**:
   ```bash
   git log --oneline -10 -- {relevant_file}
   ```

2. **Identify relevant commits**:
   - Look for renames, refactors, parameter changes
   - Note commit hash, author, date

3. **For deep investigation**:
   ```bash
   git blame -L {line_start},{line_end} {file}
   git show {commit}:{file}
   ```

4. **Extract context**:
   - When did the drift occur?
   - Who made the change?
   - What was the reason (from commit message)?

### Context Output Format

```
Discrepancy: createUser(name) → createUser(name, options)
Git Context:
  - Commit: abc123 (2024-01-15)
  - Author: developer@example.com
  - Message: "Add options parameter for user creation flexibility"
Suggested Action: Update docs/api.md:45 to include options parameter
```

---

## Phase 4: Self-Verification

**Goal**: Double-check all findings before reporting to prevent false positives.

### Process

```
/phase.verify_findings{
  before_reporting=[
    /reread{
      source="original_documentation",
      confirm="docs_say_what_i_think"
    },
    /reread{
      source="code_section",
      confirm="code_is_what_i_found"
    },
    /check{
      alternative_locations=true,
      aliased_exports=true,
      re_exports=true
    },
    /consider{
      intentional_difference="internal_vs_public_api",
      version_specific="docs_for_different_version"
    }
  ],
  only_report_if="double_verified"
}
```

### Verification Checklist

Before reporting ANY discrepancy:

- [ ] Re-read the exact documentation section
- [ ] Confirm docs say what I think they say
- [ ] Re-read the exact code section
- [ ] Confirm code is what I found
- [ ] Check alternative locations (re-exports, aliases)
- [ ] Consider if difference is intentional (internal API)
- [ ] Consider version-specific documentation

### Why Double-Check?

False positives are costly:
- Erode trust in audit results
- Waste reviewer time
- May lead to incorrect "fixes"

A 5% false positive rate on 100 findings = 5 wrong items = damaged credibility.

---

## Phase 5: Actionable Output Generation

**Goal**: Generate report with specific, actionable fixes.

### Process

```
/phase.report{
  format={
    categorized_discrepancies=[
      {category="missing", items=[]},
      {category="incorrect", items=[]},
      {category="stale", items=[]},
      {category="undocumented", items=[]}
    ],
    confidence_levels="attached_to_each",
    suggested_fixes="exact_edits_provided",
    git_context="why_drift_occurred"
  }
}
```

### Output Requirements

Every finding MUST include:

1. **Category**: missing / incorrect / stale / undocumented
2. **Location**: Exact file:line in documentation
3. **Evidence**: What the code actually shows
4. **Confidence**: certain / probable / needs_verification
5. **Git Context**: Why the drift occurred
6. **Suggested Fix**: Exact edit to make

### Report Structure

See `references/output-templates.md` for full templates.

Priority ordering:
1. **Critical** (Certain) — Must fix immediately
2. **Warning** (Probable) — Should fix soon
3. **Suggestion** (Needs Verification) — Review with maintainer

---

## Memory Attractors

Patterns to watch for across audits:

```
/recursive.memory.attractor{
  attractors=[
    {pattern="renamed_files_stale_paths", strength=0.95},
    {pattern="signature_parameter_changes", strength=0.95},
    {pattern="undocumented_exports", strength=0.9},
    {pattern="deprecated_but_documented", strength=0.9},
    {pattern="example_code_outdated", strength=0.85}
  ]
}
```

These patterns are high-confidence indicators of documentation drift. When detected, increase scrutiny in related areas.
