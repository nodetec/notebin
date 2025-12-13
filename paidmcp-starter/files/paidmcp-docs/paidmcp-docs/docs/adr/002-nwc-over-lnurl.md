# ADR-002: NWC Over LNURL or Direct Node Connection

## Status

Accepted

## Context

To generate and verify Lightning invoices, we need to connect to a Lightning wallet. Options include:

1. **Direct node connection** (LND, CLN, etc.)
2. **LNURL** (protocol for Lightning URLs)
3. **NWC** (Nostr Wallet Connect)

## Decision

Use **Nostr Wallet Connect (NWC)** via the `@getalby/sdk` library.

## Rationale

### NWC Advantages

| Factor | NWC Benefit |
|--------|-------------|
| **Wallet agnostic** | Works with any NWC-compatible wallet (Alby, Zeus, etc.) |
| **No infrastructure** | Server doesn't need Lightning node access |
| **Simple config** | Single URL contains all connection info |
| **Security** | Private keys stay in user's wallet |
| **Portability** | User can switch wallets without code changes |

### Comparison

| Approach | Complexity | Flexibility | User Control |
|----------|------------|-------------|--------------|
| Direct node | High (need node access) | Low (one node) | None |
| LNURL | Medium (spec complexity) | Medium | Some |
| NWC | Low (one URL) | High | Full |

## Consequences

### Positive

- **Zero infrastructure**: No Lightning node to run/maintain
- **User choice**: Users pick their own wallet
- **Simple setup**: Just provide NWC URL in environment
- **Standard protocol**: Growing ecosystem support

### Negative

- **Network dependency**: Requires Nostr relay connectivity
- **Latency**: Extra network hop through relays
- **Wallet dependency**: User must have NWC-compatible wallet
- **Feature limits**: Only operations supported by NWC spec

### Trade-offs Accepted

- We accept relay latency for infrastructure simplicity
- We accept wallet compatibility requirement for user control
- We limit to NWC operations (sufficient for our use case)

## Implementation

```typescript
// Connection via environment variable
const nwcUrl = process.env.NWC_URL;
// "nostr+walletconnect://pubkey?relay=wss://...&secret=..."

// Used internally by PaidMcpServer
const wallet = new NWCWallet(nwcUrl);
```

## Related

- [NWC Protocol Spec](https://nwc.dev/)
- [Alby SDK](https://github.com/getAlby/sdk)
- `docs/guides/quick-start.md` - Getting an NWC URL
