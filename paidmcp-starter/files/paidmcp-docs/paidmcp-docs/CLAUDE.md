# CLAUDE.md - PaidMCP Server

> **For LLMs**: Start here. This document tells you what to read for any task.

## What is this project?

PaidMCP Server is a template for building MCP servers that charge Bitcoin Lightning payments for tool usage. It wraps the MCP SDK and adds payment gating via Nostr Wallet Connect (NWC).

**Read first**: [charter.md](docs/charter.md) for scope | [architecture.md](docs/architecture.md) for system design

## Quick Context Loading Guide

| Task Type | Load These Documents |
|-----------|---------------------|
| Understanding the system | `docs/architecture.md`, `docs/glossary.md` |
| Adding a new paid tool | `docs/guides/creating-tools.md`, `packages/tools/README.md` |
| Changing payment logic | `packages/server/README.md`, `docs/adr/001-two-phase-payment.md` |
| Adding transport mode | `docs/guides/transport-modes.md`, `packages/transports/README.md` |
| Custom storage backend | `docs/guides/custom-storage.md`, `packages/storage/README.md` |
| Debugging issues | `docs/guides/troubleshooting.md` + relevant module README |
| Understanding why X | Check `docs/adr/` for Architecture Decision Records |

## Critical Invariants

These rules are ALWAYS true. Violating them will break the system:

1. **Payment hashes are one-time use** — after tool execution, hash is invalidated
2. **Charge callback determines price** — runs BEFORE invoice generation
3. **Tool callback requires verified payment** — NEVER executes unpaid
4. **STDIO mode: no console.log** — use `console.error()` for debugging
5. **ES2022 imports need .js extension** — `import from "./file.js"` not `"./file"`
6. **Tool responses need both formats** — `content[]` AND `structuredContent`

## Project Structure

```
src/
├── index.ts           # Entry point, transport selection
├── mcp_server.ts      # Server init, tool registration
├── tools/             # Paid tool implementations
│   ├── index.ts       # Barrel export
│   └── *.ts           # One file per tool
├── storage/           # IStorage implementations
└── transports/        # HTTP/SSE handlers
```

## Commands

```bash
npm run build       # Compile TypeScript
npm start           # Run STDIO mode (Claude Desktop)
npm run start:http  # Run HTTP mode (web services)
npm run inspect     # Interactive testing with MCP Inspector
```

## Environment

Required: `NWC_URL` — Nostr Wallet Connect URL from your Lightning wallet

```bash
# .env
NWC_URL="nostr+walletconnect://pubkey?relay=wss://...&secret=..."
```

## Documentation Index

| Document | Purpose |
|----------|---------|
| [Charter](docs/charter.md) | What this project is and isn't |
| [Architecture](docs/architecture.md) | System design, data flows, dependencies |
| [Glossary](docs/glossary.md) | Term definitions |
| [Conventions](docs/conventions.md) | Code style, naming, structure rules |
| [ADRs](docs/adr/) | Why architectural decisions were made |
| [Quick Start](docs/guides/quick-start.md) | Setup from scratch |
| [Creating Tools](docs/guides/creating-tools.md) | Adding paid tools |
| [Transport Modes](docs/guides/transport-modes.md) | STDIO vs HTTP vs SSE |
| [Custom Storage](docs/guides/custom-storage.md) | Persistent payment tracking |
| [Troubleshooting](docs/guides/troubleshooting.md) | Common errors and fixes |
