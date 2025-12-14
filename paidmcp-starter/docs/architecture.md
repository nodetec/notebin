# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Client                                │
│                  (Claude Desktop / Web App)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ MCP Protocol
                           │ (STDIO or HTTP Streamable)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PaidMcpServer                               │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐    │
│  │  Transport   │   │    Tool      │   │  Payment Layer   │    │
│  │   Layer      │──▶│   Registry   │──▶│     (NWC)        │    │
│  │              │   │              │   │                  │    │
│  │ • STDIO      │   │ • Route by   │   │ • Create invoice │    │
│  │ • HTTP       │   │   tool name  │   │ • Verify payment │    │
│  │ • SSE        │   │ • Validate   │   │                  │    │
│  └──────────────┘   └──────────────┘   └──────────────────┘    │
│                                                │                 │
└────────────────────────────────────────────────┼─────────────────┘
                                                 │
                    ┌────────────────────────────┴───────┐
                    │                                    │
                    ▼                                    ▼
        ┌───────────────────┐              ┌─────────────────────┐
        │     IStorage      │              │    Lightning Wallet │
        │                   │              │       (via NWC)     │
        │ • isValid(hash)   │              │                     │
        │ • setValid(hash)  │              │ • Alby              │
        │                   │              │ • Zeus              │
        │ Implementations:  │              │ • Any NWC wallet    │
        │ • MemoryStorage   │              └─────────────────────┘
        │ • RedisStorage    │
        │ • DatabaseStorage │
        └───────────────────┘
```

## Two-Phase Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Invoice Generation                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Client                              Server                      │
│    │                                   │                         │
│    │──── tool_call(params) ──────────▶│                         │
│    │     (no payment_hash)             │                         │
│    │                                   │                         │
│    │                          ┌────────┴────────┐               │
│    │                          │ Charge Callback │               │
│    │                          │ → { satoshi: N, │               │
│    │                          │    description } │               │
│    │                          └────────┬────────┘               │
│    │                                   │                         │
│    │                          ┌────────┴────────┐               │
│    │                          │ NWC: Create     │               │
│    │                          │ Lightning Invoice│               │
│    │                          └────────┬────────┘               │
│    │                                   │                         │
│    │                          ┌────────┴────────┐               │
│    │                          │ Storage: Save   │               │
│    │                          │ hash as VALID   │               │
│    │                          └────────┬────────┘               │
│    │                                   │                         │
│    │◀── { payment_request,  ──────────│                         │
│    │      payment_hash }               │                         │
│    │                                   │                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: Execution (after user pays invoice)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Client                              Server                      │
│    │                                   │                         │
│    │──── tool_call(params,  ─────────▶│                         │
│    │      payment_hash)                │                         │
│    │                                   │                         │
│    │                          ┌────────┴────────┐               │
│    │                          │ Storage: ATOMIC │               │
│    │                          │ tryClaimFor     │               │
│    │                          │ Processing()    │               │
│    │                          │ VALID→PROCESSING│               │
│    │                          └────────┬────────┘               │
│    │                                   │                         │
│    │                          ┌────────┴────────┐               │
│    │                          │ NWC: Verify     │               │
│    │                          │ Payment Received│               │
│    │                          └────────┬────────┘               │
│    │                                   │                         │
│    │                         (if not paid: releaseBack()        │
│    │                          → PROCESSING→VALID, return error) │
│    │                                   │                         │
│    │                          ┌────────┴────────┐               │
│    │                          │ Tool Callback   │               │
│    │                          │ → Execute logic │               │
│    │                          └────────┬────────┘               │
│    │                                   │                         │
│    │                          ┌────────┴────────┐               │
│    │                          │ Storage:        │               │
│    │                          │ consume()       │               │
│    │                          │ PROCESSING→     │               │
│    │                          │ INVALID         │               │
│    │                          └────────┬────────┘               │
│    │                                   │                         │
│    │◀── { content,          ──────────│                         │
│    │      structuredContent }          │                         │
│    │                                   │                         │
└─────────────────────────────────────────────────────────────────┘
```

## Module Dependency Rules

```
src/
├── index.ts ─────────────────┐
│                             │
├── mcp_server.ts ◀───────────┘
│       │
│       ├──▶ tools/*          (imports tool registration functions)
│       ├──▶ storage/*        (imports IStorage implementation)
│       └──▶ @getalby/paidmcp (imports PaidMcpServer)
│
├── tools/
│       │
│       ├──▶ @getalby/paidmcp (PaidMcpServer type)
│       ├──▶ zod              (schema definitions)
│       └──▶ external APIs    (your tool's dependencies)
│       ✗ FORBIDDEN: transports/*
│
├── storage/
│       │
│       └──▶ @getalby/paidmcp (IStorage interface)
│       ✗ NO internal dependencies (pure implementations)
│
└── transports/
        │
        ├──▶ mcp_server.ts    (createMcpServer function)
        ├──▶ @modelcontextprotocol/sdk (transport classes)
        └──▶ express          (HTTP framework)
        ✗ FORBIDDEN: tools/*, storage/*
```

## Payment State Machine

> **Important**: The basic `IStorage` interface has a TOCTOU vulnerability.
> See [ADR-004: Atomic Payment Claims](./adr/004-atomic-payment-claims.md) for the fix.

### Three-State FSM (Recommended)

```
                        setValid()
          (none) ──────────────────────────▶ VALID
                                              │
                                              │ tryClaimForProcessing()
                                              │ (ATOMIC operation)
                                              ▼
                                         PROCESSING
                                        ┌─────────────┐
                                        │  Blocks     │
                                        │  concurrent │
                                        │  claims     │
                                        └─────────────┘
                                         /           \
                      releaseBack()     /             \  consume()
                     (payment not      /               \ (payment
                      verified)       /                 \ verified)
                                     ▼                   ▼
                                  VALID              INVALID
                                (user can           (one-time
                                 retry)              use done)
```

### State Transitions

| From | To | Trigger | Atomic? |
|------|----|---------|---------|
| (none) | VALID | Invoice generated | N/A |
| VALID | PROCESSING | `tryClaimForProcessing()` | **Yes (critical)** |
| PROCESSING | VALID | `releaseBack()` | Yes |
| PROCESSING | INVALID | `consume()` | Yes |

### Why Three States?

The original two-state model (VALID/INVALID) has a race condition:

```
VULNERABLE (two states):
─────────────────────────────────────────────────────
Request A: isValid() → true
Request B: isValid() → true    ← Both see VALID!
Request A: setValid(false)
Request B: setValid(false)
Both execute → DOUBLE SPEND
─────────────────────────────────────────────────────

SAFE (three states):
─────────────────────────────────────────────────────
Request A: tryClaimForProcessing() → true (VALID → PROCESSING)
Request B: tryClaimForProcessing() → false (blocked by PROCESSING)
Request A: verify, execute, consume()
Request B: rejected immediately
─────────────────────────────────────────────────────
```

## Key Interfaces

### IStorage (Basic - Deprecated)

> **Warning**: This interface is vulnerable to TOCTOU attacks.
> Use `IPaymentStorage` instead for production.

```typescript
interface IStorage {
  isValid(paymentHash: string): Promise<boolean>;
  setValid(paymentHash: string, valid: boolean): Promise<void>;
}
```

### IPaymentStorage (Recommended)

```typescript
type PaymentState = 'VALID' | 'PROCESSING' | 'INVALID';

interface IPaymentStorage {
  setValid(paymentHash: string, metadata?: PaymentMetadata): Promise<void>;
  tryClaimForProcessing(paymentHash: string): Promise<boolean>;  // ATOMIC
  releaseBack(paymentHash: string): Promise<void>;
  consume(paymentHash: string): Promise<void>;
  getState(paymentHash: string): Promise<PaymentState | null>;
}
```

See [Distributed Storage Guide](./guides/distributed-storage.md) for implementations.

### Tool Registration
```typescript
server.registerPaidTool(
  name: string,
  config: { inputSchema, outputSchema, ... },
  chargeCallback: (params) => { satoshi, description },
  toolCallback: (params) => { content, structuredContent }
);
```

### Transport Selection
```typescript
// index.ts determines transport based on MODE env var
switch (process.env.MODE) {
  case "HTTP": runHTTP(); break;
  case "STDIO": 
  default: runSTDIO(); break;
}
```

## Error Handling Flow

```
Tool Callback throws Error
         │
         ▼
PaidMcpServer catches
         │
         ▼
Formats as MCP error response
         │
         ▼
Transport sends to client
         │
         ▼
Client sees error message (payment_hash NOT invalidated if error before execution)
```

## State Management

| Component | State Location | Persistence |
|-----------|---------------|-------------|
| Payment hashes | IStorage implementation | Depends on impl |
| Server config | Environment variables | Process lifetime |
| Tool registry | PaidMcpServer instance | Per-request (HTTP) or process (STDIO) |
| NWC connection | NWCWallet instance | Process lifetime |
