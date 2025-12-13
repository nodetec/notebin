import { botttsNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatar(seed: string | undefined) {
  return createAvatar(botttsNeutral, {
    seed: seed ?? "",
  }).toDataUri();
}

export function getExtension(filename: string) {
  // Find the position of the first dot
  const firstDotPos = filename.indexOf(".");

  // No extension
  if (firstDotPos === -1) {
    return undefined;
  }

  // Return everything after the first dot
  return filename.substring(firstDotPos + 1);
}

/**
 * Detects if a string is base64-encoded and decodes it if so.
 * Returns the decoded content and whether it was base64-encoded.
 */
export function decodeBase64Content(content: string): {
  content: string;
  isBase64Encoded: boolean;
} {
  // Skip if content is too short or contains obvious non-base64 patterns
  if (content.length < 20 || content.includes(" ") || content.includes("\n")) {
    return { content, isBase64Encoded: false };
  }

  // Check if string matches base64 pattern (alphanumeric, +, /, optional = padding)
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  if (!base64Regex.test(content)) {
    return { content, isBase64Encoded: false };
  }

  try {
    const decoded = atob(content);

    // Verify the decoded content is valid UTF-8 text (not binary)
    // Check if it contains mostly printable characters
    const printableRatio =
      decoded.split("").filter((char) => {
        const code = char.charCodeAt(0);
        // Printable ASCII + common whitespace
        return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13;
      }).length / decoded.length;

    // If more than 90% printable, consider it valid text
    if (printableRatio > 0.9) {
      return { content: decoded, isBase64Encoded: true };
    }
  } catch {
    // Not valid base64
  }

  return { content, isBase64Encoded: false };
}
