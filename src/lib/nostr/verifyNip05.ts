export interface Nip05VerificationResult {
  valid: boolean;
  error?: string;
}

export async function verifyNip05(
  nip05: string,
  publicKey: string,
): Promise<Nip05VerificationResult> {
  if (!nip05 || !publicKey) {
    return {
      valid: false,
      error: "NIP-05 identifier and public key are required",
    };
  }

  // Validate format (should be like email: local@domain)
  const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!emailRegex.test(nip05)) {
    return {
      valid: false,
      error: "Invalid NIP-05 format. Use format: user@domain.com",
    };
  }

  const [localPart, domain] = nip05.split("@");

  // Validate local part (only a-z0-9-_. allowed according to NIP-05)
  const localPartRegex = /^[a-z0-9._-]+$/i;
  if (!localPartRegex.test(localPart)) {
    return {
      valid: false,
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
        valid: false,
        error: `Failed to fetch verification data: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Check if the response has the required structure
    if (!data.names || typeof data.names !== "object") {
      return {
        valid: false,
        error: "Invalid response format: missing 'names' object",
      };
    }

    // Check if our local part exists in the names
    const expectedPubkey = data.names[localPart];
    if (!expectedPubkey) {
      return {
        valid: false,
        error: `Name '${localPart}' not found in domain verification`,
      };
    }

    // Verify the public key matches (convert to lowercase for comparison)
    if (expectedPubkey.toLowerCase() !== publicKey.toLowerCase()) {
      return {
        valid: false,
        error:
          "Public key does not match the one registered for this NIP-05 identifier",
      };
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        return {
          valid: false,
          error:
            "Verification timed out. Please check the domain is accessible.",
        };
      }
      return { valid: false, error: `Verification failed: ${error.message}` };
    }
    return {
      valid: false,
      error: "Unknown error occurred during verification",
    };
  }
}
