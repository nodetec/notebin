import { nip19 } from "nostr-tools";

export interface Nip05ResolutionResult {
  publicKey?: string;
  npub?: string;
  relays?: string[];
  error?: string;
}

export async function resolveNip05(
  nip05: string,
): Promise<Nip05ResolutionResult> {
  if (!nip05) {
    return { error: "NIP-05 identifier is required" };
  }

  // Validate format (should be like email: local@domain)
  const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!emailRegex.test(nip05)) {
    return { error: "Invalid NIP-05 format. Use format: user@domain.com" };
  }

  const [localPart, domain] = nip05.split("@");

  // Validate local part (only a-z0-9-_. allowed according to NIP-05)
  const localPartRegex = /^[a-z0-9._-]+$/i;
  if (!localPartRegex.test(localPart)) {
    return {
      error:
        "Local part contains invalid characters. Only a-z, 0-9, -, _, . are allowed",
    };
  }

  try {
    // Construct the well-known URL
    const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(localPart)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return {
        error: `Failed to fetch NIP-05 data: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Check if the response has the required structure
    if (!data.names || typeof data.names !== "object") {
      return { error: "Invalid response format: missing 'names' object" };
    }

    // Get the public key for the local part
    const publicKey = data.names[localPart];
    if (!publicKey) {
      return { error: `Name '${localPart}' not found at ${domain}` };
    }

    // Convert to npub
    const npub = nip19.npubEncode(publicKey);

    // Get relays if available
    const relays = data.relays?.[publicKey] || [];

    return { publicKey, npub, relays };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        return {
          error: "Resolution timed out. Please check the domain is accessible.",
        };
      }
      return { error: `Resolution failed: ${error.message}` };
    }
    return { error: "Unknown error occurred during resolution" };
  }
}
