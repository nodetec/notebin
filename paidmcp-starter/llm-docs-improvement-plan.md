# Documentation Improvement Plan: PaidMCP Server

## Executive Summary

Your current `CLAUDE.md` is a solid **tutorial/reference document**, but it's structured as a monolithic guide rather than an **LLM-optimized documentation system**. Based on the principles we discussed, you need to restructure into a **layered, modular documentation architecture** that enables an LLM to work effectively as the codebase grows.

---

## Analysis of Current CLAUDE.md

### What It Does Well

| Strength | Evidence |
|----------|----------|
| **Comprehensive setup** | Full project initialization, dependencies, tsconfig |
| **Clear code patterns** | Reusable templates for tools, transports, storage |
| **API reference** | Constructor signatures, type definitions, interfaces |
| **Anti-patterns section** | Explicit "don't do this" guidance |
| **Troubleshooting** | Common errors with causes and fixes |
| **Quality checklist** | Verification steps before deployment |
| **End-to-end example** | Complete weather tool implementation |

### What's Missing (LLM-Critical Gaps)

| Gap | Impact on LLM Effectiveness |
|-----|----------------------------|
| **No module cards** | LLM can't quickly understand what each module does without reading all code |
| **No architecture diagram** | LLM lacks mental model of how components interact |
| **No glossary** | Terms like "NWC", "outbox pattern", "payment_hash" may be misunderstood |
| **No ADRs** | LLM doesn't know *why* decisions were made (e.g., why two-phase payment?) |
| **No invariants** | LLM may violate hidden rules (e.g., payment_hash is one-time use) |
| **No dependency rules** | No explicit "what can import what" guidance |
| **No task-based context guidance** | LLM doesn't know what to load for different task types |
| **No file size/structure conventions** | As codebase grows, no guardrails for maintainability |
| **Monolithic structure** | 800+ lines is too long for efficient context loading |

---

## Recommended Documentation Structure

Replace your single `CLAUDE.md` with this layered structure:

```
docs/
├── CLAUDE.md              # Entry point: "start here" + pointers
├── charter.md             # What this project is and isn't
├── architecture.md        # System overview, component map, data flows
├── glossary.md            # Shared vocabulary
├── conventions.md         # Code style, file structure, naming rules
├── adr/                   # Architecture Decision Records
│   ├── 001-two-phase-payment.md
│   ├── 002-nwc-over-lnurl.md
│   └── 003-stateless-http.md
└── guides/                # Task-specific guides (extracted from current doc)
    ├── quick-start.md
    ├── creating-tools.md
    ├── transport-modes.md
    ├── custom-storage.md
    └── troubleshooting.md

packages/                  # Or src/ - your module structure
├── server/
│   └── README.md          # Module card
├── tools/
│   └── README.md          # Module card
├── storage/
│   └── README.md          # Module card
└── transports/
    └── README.md          # Module card
```

---

## Document Templates

### 1. New CLAUDE.md (Entry Point)

```markdown
# CLAUDE.md - PaidMCP Server

> **For LLMs**: Start here. This document tells you what to read for any task.

## What is this project?

PaidMCP Server is a template for building MCP servers that charge Bitcoin Lightning payments for tool usage. See [charter.md](docs/charter.md) for scope and constraints.

## Quick Context Loading Guide

| Task Type | Load These Documents |
|-----------|---------------------|
| **Understanding the system** | architecture.md, glossary.md |
| **Adding a new tool** | guides/creating-tools.md, packages/tools/README.md |
| **Changing payment logic** | packages/server/README.md, adr/001-two-phase-payment.md |
| **Adding transport mode** | guides/transport-modes.md, packages/transports/README.md |
| **Debugging issues** | guides/troubleshooting.md, relevant module README |
| **Understanding a decision** | Check docs/adr/ for relevant ADR |

## Critical Invariants (Always True)

1. **Payment hashes are one-time use** - once a tool executes, the hash is invalidated
2. **Charge callback runs before payment** - determines invoice amount
3. **Tool callback runs only after verified payment** - never executes unpaid
4. **STDIO mode: no console.log** - breaks the protocol, use stderr
5. **ES2022 imports require .js extension** - even for .ts source files

## Key Files

- `src/index.ts` - Entry point, transport selection
- `src/mcp_server.ts` - Server initialization, tool registration
- `src/tools/` - Paid tool implementations
- `src/storage/` - Payment hash persistence
- `src/transports/` - HTTP/SSE transport handlers

## Commands

```bash
npm run build      # Compile TypeScript
npm start          # Run STDIO mode
npm run start:http # Run HTTP mode
npm run inspect    # Interactive testing with MCP Inspector
```

## Documentation Map

- [Charter](docs/charter.md) - Project scope and constraints
- [Architecture](docs/architecture.md) - System design and data flows
- [Glossary](docs/glossary.md) - Term definitions
- [Conventions](docs/conventions.md) - Code style and structure rules
- [ADRs](docs/adr/) - Why decisions were made
- [Guides](docs/guides/) - How to do specific tasks
```

---

### 2. docs/charter.md

```markdown
# Project Charter: PaidMCP Server Template

## Purpose

Enable developers to build MCP servers that monetize tool usage via Bitcoin Lightning micropayments.

## What This Project IS

- A **template/starter** for paid MCP servers
- An **integration layer** between MCP SDK and Lightning wallets
- A **reference implementation** of the two-phase payment pattern

## What This Project IS NOT

- A wallet implementation (uses NWC for wallet operations)
- A payment processor (relies on Lightning Network)
- A full MCP server (you build your tools on top)
- Production-ready without customization (especially storage)

## Key Constraints

| Constraint | Rationale |
|------------|-----------|
| NWC-only wallet integration | Standardized protocol, works with any NWC wallet |
| Stateless HTTP by default | Simplifies scaling, avoids session management |
| Memory storage default | Simple for development; must replace for production |
| ES2022 modules | Modern JavaScript, required by MCP SDK |

## Success Criteria

A successful implementation:
1. Generates Lightning invoices for tool calls
2. Verifies payment before tool execution
3. Prevents replay attacks (one-time payment hashes)
4. Works with Claude Desktop (STDIO) and web services (HTTP)

## Out of Scope

- Fiat currency conversion
- Subscription/credit models (pay-per-call only)
- Multi-wallet support (single NWC connection)
- Built-in rate limiting (implement in your tools)
```

---

### 3. docs/architecture.md

```markdown
# Architecture Overview

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Client                                │
│                  (Claude Desktop / Web App)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MCP Protocol (STDIO or HTTP)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PaidMcpServer                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │   Transport     │  │  Tool Registry  │  │ Payment Layer  │  │
│  │  (STDIO/HTTP)   │  │                 │  │    (NWC)       │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│       IStorage          │     │         NWC Wallet              │
│  (payment hash state)   │     │   (invoice generation/verify)   │
└─────────────────────────┘     └─────────────────────────────────┘
```

## Payment Flow (Two-Phase)

```
Phase 1: Invoice Generation
─────────────────────────────
Client ──[tool call, no hash]──▶ Server
                                    │
                                    ├── Charge callback → { satoshi, description }
                                    ├── NWC: create invoice
                                    ├── Storage: save payment_hash as valid
                                    │
Client ◀──[payment_request, hash]── Server

Phase 2: Execution
─────────────────────────────
Client ──[tool call + hash]──▶ Server
                                    │
                                    ├── Storage: check hash is valid
                                    ├── NWC: verify payment received
                                    ├── Tool callback → result
                                    ├── Storage: invalidate hash
                                    │
Client ◀──[tool result]──────── Server
```

## Module Dependency Rules

```
index.ts
    └── mcp_server.ts
            ├── tools/* (registers tools)
            ├── storage/* (payment state)
            └── transports/* (HTTP handlers)

Rules:
- tools/ → may import from storage/ (for custom persistence)
- tools/ → must NOT import from transports/
- transports/ → imports mcp_server.ts only
- storage/ → no internal dependencies (pure implementations)
```

## Data Flow: Tool Execution

1. **Request arrives** via transport (STDIO message or HTTP POST)
2. **Server routes** to registered tool by name
3. **Payment check**:
   - No hash → run charge callback → generate invoice → return payment instructions
   - Has hash → verify with storage → verify with NWC → proceed
4. **Tool executes** (your business logic)
5. **Hash invalidated** in storage
6. **Response returned** via transport

## Cross-Cutting Concerns

| Concern | Location | Pattern |
|---------|----------|---------|
| Error handling | Each tool callback | Throw Error, caught by server |
| Logging | Tools only (stderr in STDIO) | `console.error()` |
| Validation | Tool input schemas | Zod schemas with `.describe()` |
| Payment pricing | Charge callbacks | Dynamic based on params |
```

---

### 4. docs/glossary.md

```markdown
# Glossary

## Core Concepts

| Term | Definition |
|------|------------|
| **MCP** | Model Context Protocol - standard for LLM tool integration |
| **PaidMCP** | Extension of MCP that adds payment gating to tools |
| **Tool** | A function exposed to the LLM via MCP protocol |
| **Paid Tool** | A tool that requires Lightning payment before execution |

## Payment Terms

| Term | Definition |
|------|------------|
| **NWC** | Nostr Wallet Connect - protocol for wallet operations over Nostr relays |
| **Lightning Invoice** | A payment request on the Bitcoin Lightning Network |
| **payment_request** | The encoded Lightning invoice string (starts with `lnbc...`) |
| **payment_hash** | Unique identifier for a payment, used to verify and track |
| **satoshi (sat)** | Smallest unit of Bitcoin (1 BTC = 100,000,000 sats) |
| **Charge Callback** | Function that determines payment amount for a tool call |
| **Two-Phase Payment** | Pattern: (1) generate invoice, (2) verify payment then execute |

## Transport Terms

| Term | Definition |
|------|------------|
| **STDIO** | Standard Input/Output - communication via stdin/stdout streams |
| **Streamable HTTP** | HTTP-based MCP transport for web services |
| **SSE** | Server-Sent Events - legacy streaming transport |
| **Stateless Mode** | Each request creates new server instance (no session) |
| **Session Mode** | Server maintains state across requests (SSE pattern) |

## Storage Terms

| Term | Definition |
|------|------------|
| **IStorage** | Interface for payment hash persistence |
| **Valid Hash** | A payment_hash that has been created but not yet used |
| **Invalidated Hash** | A payment_hash that has been used (cannot be reused) |

## Code Patterns

| Term | Definition |
|------|------------|
| **Barrel Export** | `index.ts` that re-exports from multiple files |
| **Tool Registration** | `registerPaidTool()` call that defines a paid tool |
| **Structured Content** | Typed output object in tool response |
```

---

### 5. docs/adr/001-two-phase-payment.md

```markdown
# ADR-001: Two-Phase Payment Flow

## Status
Accepted

## Context

We need to charge for tool execution, but:
- We can't require payment before the user knows the cost
- Costs may vary based on input parameters
- Lightning invoices are one-time use and expire

## Decision

Implement a two-phase payment flow:

1. **Phase 1 (Invoice)**: Client calls tool without payment_hash
   - Charge callback computes cost from params
   - Server generates Lightning invoice via NWC
   - Returns payment_request + payment_hash to client

2. **Phase 2 (Execute)**: Client calls tool with payment_hash
   - Server verifies payment via NWC
   - Tool callback executes
   - Hash is invalidated (one-time use)

## Consequences

### Positive
- Dynamic pricing based on inputs
- Client sees cost before committing
- Standard Lightning payment UX
- Replay attack prevention via hash invalidation

### Negative
- Two round trips required
- Client must handle payment UX
- Invoice expiry creates time pressure

### Risks
- Race condition if same hash used concurrently (mitigated by storage check)
- Lost payments if client crashes after paying (hash remains valid until used)

## Alternatives Considered

1. **Prepaid credits**: Rejected - adds account management complexity
2. **Post-execution billing**: Rejected - no enforcement mechanism
3. **Fixed pricing**: Rejected - limits flexibility for complex tools
```

---

### 6. Module Card Template (packages/tools/README.md)

```markdown
# Module: tools

## Purpose

Contains paid tool implementations. Each tool is a self-contained unit that:
- Defines its input/output schema
- Implements charge logic (pricing)
- Implements execution logic (business value)

## Public API

```typescript
// Each tool exports a registration function
export function registerMyTool(server: PaidMcpServer): void
```

## Invariants

1. Every tool MUST have both charge callback and tool callback
2. Input schemas MUST use Zod with `.describe()` on all fields
3. Tool callbacks MUST return `{ content: [...], structuredContent: T }`
4. Charge callbacks MUST return `{ satoshi: number, description: string }`
5. Tools MUST NOT use console.log (breaks STDIO mode)

## Dependencies

- **Allowed**: `@getalby/paidmcp`, `zod`, external APIs
- **Forbidden**: Direct imports from `transports/`

## File Structure

```
tools/
├── index.ts              # Barrel export: registerAllTools()
├── my_tool.ts            # One file per tool
└── another_tool.ts
```

## Adding a New Tool

1. Create `src/tools/new_tool.ts` using the template pattern
2. Export registration function: `export function registerNewTool(server)`
3. Add to barrel export in `index.ts`
4. Call registration in `mcp_server.ts`

## Testing Locally

```bash
npm run build
npm run inspect  # Opens MCP Inspector
# Select your tool, provide test inputs, observe payment flow
```
```

---

### 7. docs/conventions.md

```markdown
# Code Conventions

## File Structure

| Rule | Example |
|------|---------|
| One tool per file | `tools/get_weather.ts` |
| Max 200 LOC per file | Split large tools into helpers |
| Barrel exports for directories | `tools/index.ts` re-exports all |
| Descriptive file names | `database_storage.ts` not `db.ts` |

## Naming

| Type | Convention | Example |
|------|------------|---------|
| Tool names | snake_case | `get_weather`, `send_email` |
| Functions | camelCase | `registerGetWeatherTool` |
| Types/Interfaces | PascalCase | `WeatherResult`, `IStorage` |
| Files | snake_case | `get_weather.ts` |
| Env vars | SCREAMING_SNAKE | `NWC_URL`, `PORT` |

## Import Rules

```typescript
// CORRECT: .js extension required for ES2022
import { createMcpServer } from "./mcp_server.js";

// WRONG: Missing extension
import { createMcpServer } from "./mcp_server";
```

## Tool Callback Return Format

```typescript
// ALWAYS return this structure
return {
  content: [
    { type: "text", text: JSON.stringify(result) }
  ],
  structuredContent: result,  // Typed object matching outputSchema
};
```

## Error Handling

```typescript
// Throw errors - server catches and formats them
if (!geoData.length) {
  throw new Error(`City not found: ${params.city}`);
}

// For STDIO debugging only
console.error("Debug:", someValue);  // stderr, not stdout
```

## Zod Schema Conventions

```typescript
inputSchema: {
  // ALWAYS include .describe() for LLM context
  city: z.string().describe("The city to get weather for"),
  
  // Use .optional() with clear descriptions
  units: z.enum(["celsius", "fahrenheit"])
    .optional()
    .describe("Temperature units (default: celsius)"),
}
```
```

---

## Migration Plan

### Phase 1: Extract and Restructure (Day 1)

1. Create `docs/` directory structure
2. Write `charter.md` from scratch (defines scope)
3. Write `architecture.md` (extract/expand from current doc)
4. Write `glossary.md` (extract terms, add definitions)
5. Write `conventions.md` (extract patterns, make explicit)

### Phase 2: Create ADRs (Day 1-2)

1. `001-two-phase-payment.md` - core payment decision
2. `002-nwc-over-lnurl.md` - why NWC specifically
3. `003-stateless-http.md` - why no session management

### Phase 3: Split Guides (Day 2)

Extract from current CLAUDE.md into:
1. `guides/quick-start.md` - sections 1-4
2. `guides/creating-tools.md` - section 4 (tools) + example
3. `guides/transport-modes.md` - section 5
4. `guides/custom-storage.md` - section 6
5. `guides/troubleshooting.md` - sections 11-12

### Phase 4: Add Module Cards (Day 2-3)

Create README.md in each source directory:
1. `src/tools/README.md`
2. `src/storage/README.md`
3. `src/transports/README.md`

### Phase 5: Rewrite Entry Point (Day 3)

Replace current CLAUDE.md with the new entry point that:
- Links to all other docs
- Provides task-based navigation
- States critical invariants upfront

---

## Validation Checklist

After migration, verify:

- [ ] Any task can be understood from ≤3 documents
- [ ] Each module has a README under 2 pages
- [ ] Every exported symbol has a docstring
- [ ] No cross-module imports except through defined APIs
- [ ] All ADRs explain "why", not just "what"
- [ ] Glossary covers all domain-specific terms
- [ ] Entry point CLAUDE.md is under 100 lines
- [ ] Total docs are more navigable than 800-line monolith
