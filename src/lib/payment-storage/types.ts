/**
 * Payment State Machine
 *
 * States:
 * - VALID: Invoice created, awaiting payment/claim
 * - PROCESSING: Claimed for verification, blocks concurrent claims
 * - INVALID: Consumed or expired, cannot be used
 *
 * Transitions:
 * - (none) → VALID: setValid() after invoice generation
 * - VALID → PROCESSING: tryClaimForProcessing() - ATOMIC
 * - PROCESSING → VALID: releaseBack() if payment not verified
 * - PROCESSING → INVALID: consume() after successful execution
 *
 * @see docs/adr/004-atomic-payment-claims.md
 */
export type PaymentState = "VALID" | "PROCESSING" | "INVALID";

export interface PaymentMetadata {
  toolName: string;
  paramsHash: string;
  created: number;
  processingStarted?: number;
}

export interface IPaymentStorage {
  /**
   * Create a valid payment hash after invoice generation.
   * Transition: (none) → VALID
   */
  setValid(paymentHash: string, metadata?: Partial<PaymentMetadata>): Promise<void>;

  /**
   * Atomic claim: VALID → PROCESSING
   *
   * This is the critical operation that prevents TOCTOU race conditions.
   * Returns true if successfully claimed, false if:
   * - Hash doesn't exist
   * - Hash is already PROCESSING (another request claimed it)
   * - Hash is INVALID (already consumed)
   *
   * Also handles stale PROCESSING states (>30s timeout).
   */
  tryClaimForProcessing(paymentHash: string): Promise<boolean>;

  /**
   * Release: PROCESSING → VALID
   *
   * Used when payment verification fails (user hasn't paid yet).
   * Preserves the hash so user can retry after paying.
   */
  releaseBack(paymentHash: string): Promise<void>;

  /**
   * Consume: PROCESSING → INVALID
   *
   * Used after successful tool execution.
   * The hash can never be used again.
   */
  consume(paymentHash: string): Promise<void>;

  /**
   * Get current state (for debugging/monitoring).
   * Returns null if hash doesn't exist.
   */
  getState(paymentHash: string): Promise<PaymentState | null>;

  /**
   * Check if storage is healthy/connected.
   */
  ping(): Promise<boolean>;
}
