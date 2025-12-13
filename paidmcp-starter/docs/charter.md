# Project Charter: PaidMCP Server

## Purpose

Enable developers to build MCP servers that monetize tool usage via Bitcoin Lightning micropayments.

## What This Project IS

- A **template/starter** for building paid MCP servers
- An **integration layer** between MCP SDK and Lightning wallets via NWC
- A **reference implementation** of the two-phase payment pattern
- A **learning resource** for MCP + Lightning development

## What This Project IS NOT

- A wallet (uses external wallets via NWC protocol)
- A payment processor (relies on Lightning Network infrastructure)
- A complete MCP server (you build your tools on top of this template)
- Production-ready as-is (default MemoryStorage loses state on restart)

## Key Constraints

| Constraint | Rationale |
|------------|-----------|
| NWC-only wallet integration | Standardized protocol, wallet-agnostic |
| Two-phase payment flow | Enables dynamic pricing, prevents unpaid execution |
| Stateless HTTP by default | Simplifies horizontal scaling |
| ES2022 modules required | MCP SDK requirement |
| Memory storage as default | Simple for development; production needs replacement |

## Target Users

1. **Developers** building AI tools who want micropayment monetization
2. **Lightning enthusiasts** exploring MCP integrations
3. **AI tool creators** seeking alternative revenue models

## Success Criteria

A successful PaidMCP server:

1. ✅ Generates Lightning invoices for tool calls
2. ✅ Blocks execution until payment is verified
3. ✅ Prevents replay attacks (one-time payment hashes)
4. ✅ Works with Claude Desktop (STDIO transport)
5. ✅ Works with web applications (HTTP transport)
6. ✅ Supports dynamic pricing based on inputs

## Out of Scope

These features are explicitly NOT part of this project:

- Fiat currency conversion or display
- Subscription or credit-based billing models
- Multi-wallet / multi-NWC-connection support
- Built-in rate limiting (implement per-tool as needed)
- User authentication (tools are anonymous by design)
- Payment refunds or disputes
