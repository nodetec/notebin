import { createHash } from "crypto";

/**
 * Create a deterministic hash of tool parameters.
 * Used to bind payment hashes to specific request parameters,
 * preventing payment hash theft attacks.
 *
 * @param params - The parameters to hash (will be sorted for consistency)
 * @returns SHA256 hex digest of the canonical JSON representation
 *
 * @example
 * ```typescript
 * const hash = hashParams({ language: "typescript", tags: ["api"] });
 * // Always produces the same hash for the same params
 * ```
 *
 * @see docs/adr/004-atomic-payment-claims.md
 */
export function hashParams(params: Record<string, unknown>): string {
  // Filter out undefined values and sort keys for deterministic hashing
  const filtered: Record<string, unknown> = {};
  const sortedKeys = Object.keys(params).sort();

  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== undefined && value !== null) {
      // Sort array values for consistency
      if (Array.isArray(value)) {
        filtered[key] = [...value].sort();
      } else {
        filtered[key] = value;
      }
    }
  }

  const canonical = JSON.stringify(filtered);
  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Extract the relevant params for binding from tool arguments.
 * Only includes params that affect the tool's behavior.
 *
 * @param args - Full tool arguments
 * @param toolName - Name of the tool
 * @returns Params object suitable for hashing
 */
export function extractBindableParams(
  args: Record<string, unknown>,
  toolName: string
): Record<string, unknown> {
  switch (toolName) {
    case "searchSnippetsPremium":
      return {
        language: args.language,
        tags: args.tags,
        keyword: args.keyword,
        limit: args.limit,
      };
    default:
      // For unknown tools, use all non-payment params
      const { payment_hash, ...rest } = args;
      return rest;
  }
}
