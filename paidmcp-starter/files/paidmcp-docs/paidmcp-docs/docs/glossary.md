# Glossary

## MCP Concepts

| Term | Definition |
|------|------------|
| **MCP** | Model Context Protocol — an open standard for connecting AI assistants to external tools and data sources |
| **MCP Server** | A service that exposes tools to MCP clients via the MCP protocol |
| **MCP Client** | An application (like Claude Desktop) that connects to MCP servers |
| **Tool** | A function exposed via MCP that an AI can call to perform actions |
| **Transport** | The communication layer between client and server (STDIO, HTTP, SSE) |

## PaidMCP Concepts

| Term | Definition |
|------|------------|
| **PaidMCP** | Extension of the MCP SDK that adds Lightning payment requirements to tools |
| **PaidMcpServer** | The main class that wraps McpServer with payment functionality |
| **Paid Tool** | A tool registered with `registerPaidTool()` that requires payment |
| **Charge Callback** | Function that runs first to determine payment amount; signature: `(params) => { satoshi, description }` |
| **Tool Callback** | Function that runs after payment verification; contains the actual tool logic |
| **Two-Phase Payment** | The pattern where tool calls require two requests: (1) get invoice, (2) execute with payment proof |

## Lightning/Bitcoin Terms

| Term | Definition |
|------|------------|
| **Lightning Network** | A layer-2 payment network on Bitcoin enabling instant, low-fee transactions |
| **Invoice** | A payment request on Lightning; one-time use, has expiry |
| **payment_request** | The encoded invoice string, starts with `lnbc...` (mainnet) or `lnbcrt...` (regtest) |
| **payment_hash** | A unique 32-byte identifier for a payment; used to track and verify |
| **Satoshi (sat)** | The smallest unit of Bitcoin; 1 BTC = 100,000,000 satoshis |
| **NWC** | Nostr Wallet Connect — protocol for remote wallet operations over Nostr relays |
| **NWC URL** | Connection string for NWC; format: `nostr+walletconnect://pubkey?relay=...&secret=...` |

## Storage Terms

| Term | Definition |
|------|------------|
| **IStorage** | Interface defining payment hash persistence; methods: `isValid()`, `setValid()` |
| **MemoryStorage** | Default implementation; stores hashes in memory; loses state on restart |
| **Valid Hash** | A payment_hash that was created but not yet used for tool execution |
| **Invalid Hash** | A payment_hash that has been consumed; cannot be reused (replay protection) |

## Transport Terms

| Term | Definition |
|------|------------|
| **STDIO** | Standard Input/Output transport; communication via stdin/stdout streams; used by Claude Desktop |
| **HTTP Streamable** | HTTP-based transport supporting streaming responses; used for web services |
| **SSE** | Server-Sent Events; legacy streaming transport; requires session management |
| **Stateless Mode** | Server creates new instance per request; no session state; default for HTTP |
| **Session Mode** | Server maintains state across requests; required for SSE transport |

## Code Pattern Terms

| Term | Definition |
|------|------------|
| **Barrel Export** | An `index.ts` file that re-exports symbols from multiple files in a directory |
| **Tool Registration** | The `registerPaidTool()` call that defines a tool's schema and callbacks |
| **structuredContent** | The typed object in tool responses; must match `outputSchema` |
| **content** | The MCP-standard response array; typically `[{ type: "text", text: "..." }]` |

## Zod Terms

| Term | Definition |
|------|------------|
| **Zod** | TypeScript-first schema validation library used for input/output schemas |
| **Schema** | A Zod definition describing the shape and constraints of data |
| `.describe()` | Zod method to add descriptions; REQUIRED for LLM context about parameters |
| `.optional()` | Zod method marking a field as not required |

## Error Terms

| Term | Definition |
|------|------------|
| **McpError** | Error class from MCP SDK with error codes |
| **ErrorCode** | Enum of standard MCP error codes (InternalError, InvalidParams, etc.) |
| **Payment verification failed** | Error when NWC reports invoice not paid |
| **Invalid payment_hash** | Error when hash not found in storage or already used |
