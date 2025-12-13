import { hexToBytes } from "@noble/hashes/utils";

export const parseUint8Array = (secretKeyString: string | undefined) => {
  if (!secretKeyString) {
    return undefined;
  }

  if (secretKeyString === "0") {
    return undefined;
  }

  // Check if it's a hex string (64 chars for 32 bytes, no commas)
  if (secretKeyString.length === 64 && !secretKeyString.includes(",")) {
    try {
      return hexToBytes(secretKeyString);
    } catch {
      // Fall through to comma-separated parsing
    }
  }

  // Legacy format: comma-separated numbers
  const numbersArray = secretKeyString
    .split(",")
    .map((num) => Number.parseInt(num, 10));
  const uint8Array = new Uint8Array(numbersArray);

  return uint8Array;
};
