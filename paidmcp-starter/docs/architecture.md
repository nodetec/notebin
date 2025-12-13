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
│    │                          │ Storage: Check  │               │
│    │                          │ hash is VALID   │               │
│    │                          └────────┬────────┘               │
│    │                                   │                         │
│    │                          ┌────────┴────────┐               │
│    │                          │ NWC: Verify     │               │
│    │                          │ Payment Received│               │
│    │                          └────────┬────────┘               │
│    │                                   │                         │
│    │                          ┌────────┴────────┐               │
│    │                          │ Tool Callback   │               │
│    │                          │ → Execute logic │               │
│    │                          └────────┬────────┘               │
│    │                                   │                         │
│    │                          ┌────────┴────────┐               │
│    │                          │ Storage: Set    │               │
│    │                          │ hash INVALID    │               │
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

## Key Interfaces

### IStorage
```typescript
interface IStorage {
  isValid(paymentHash: string): Promise<boolean>;
  setValid(paymentHash: string, valid: boolean): Promise<void>;
}
```

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
