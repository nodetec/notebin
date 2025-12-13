# ADR-001: Two-Phase Payment Flow

## Status

Accepted

## Context

We need to charge for tool execution via Lightning payments. Several constraints shape this decision:

1. **Dynamic pricing**: Tool costs may vary based on input parameters
2. **User awareness**: Users should see the cost before committing to pay
3. **Lightning invoice model**: Invoices are one-time use and have expiry times
4. **Replay prevention**: A payment should only authorize one execution

## Decision

Implement a **two-phase payment flow**:

### Phase 1: Invoice Generation
1. Client calls tool without `payment_hash`
2. Server runs charge callback to compute cost from params
3. Server generates Lightning invoice via NWC
4. Server stores `payment_hash` as VALID in storage
5. Server returns `payment_request` + `payment_hash` to client

### Phase 2: Execution
1. Client pays the Lightning invoice (external to our system)
2. Client retries tool call WITH `payment_hash`
3. Server checks storage: hash must be VALID
4. Server verifies payment via NWC
5. Server executes tool callback
6. Server sets hash to INVALID (consumed)
7. Server returns tool result

## Consequences

### Positive

- **Dynamic pricing**: Charge callback can compute cost based on any input
- **Transparent costs**: User sees exact amount before paying
- **Standard UX**: Follows normal Lightning payment flow
- **Replay protection**: One-time hashes prevent reuse attacks
- **Atomic execution**: Tool only runs after verified payment

### Negative

- **Two round trips**: Adds latency for paid tool calls
- **Client complexity**: Client must handle invoice display and retry
- **Invoice expiry**: Time pressure on users to complete payment
- **State requirement**: Must persist payment_hash validity

### Risks Mitigated

| Risk | Mitigation |
|------|------------|
| Concurrent hash use | Storage check before NWC verification |
| Payment without execution | Hash remains valid; user can retry |
| Execution without payment | NWC verification required |
| Hash replay | Invalidation after execution |

## Alternatives Considered

### Prepaid Credits

User deposits balance, deducted per tool call.

**Rejected because**:
- Adds account/balance management
- Requires user registration
- Complicates architecture significantly

### Post-Execution Billing

Execute first, bill after.

**Rejected because**:
- No enforcement mechanism
- Doesn't work for anonymous users
- Higher fraud risk

### Fixed Pricing Only

All tools cost same amount.

**Rejected because**:
- Limits flexibility
- Expensive tools subsidize cheap ones
- Can't charge based on complexity

## Related

- `packages/server/README.md` - Implementation details
- `docs/architecture.md` - System diagram showing flow
