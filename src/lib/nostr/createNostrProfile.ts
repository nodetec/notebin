import type { Event } from "nostr-tools";
import { nip19 } from "nostr-tools";
import { getAvatar } from "~/lib/utils";

export interface NostrProfile {
  event: Event;
  pubkey: string;
  npub?: string;
  shortNpub?: string;
  writeRelays?: string[];
  readRelays?: string[];
  relay?: string;
  about?: string;
  lud06?: string;
  lud16?: string;
  name?: string;
  nip05?: string;
  picture?: string;
  website?: string;
  banner?: string;
  location?: string;
  github?: string;
  twitter?: string;
  [key: string]: unknown;
}

export const createNostrProfile = (
  event: Event,
  writeRelays?: string[],
  readRelays?: string[],
): NostrProfile => {
  if (!event) {
    throw new Error("Event is required");
  }

  const npub = nip19.npubEncode(event.pubkey);
  const shortNpub = `${npub.slice(0, 4)}..${npub.slice(-4)}`;

  // Initialize base profile with required fields
  const profileEvent: NostrProfile = {
    event,
    pubkey: event.pubkey,
    npub,
    shortNpub,
    writeRelays,
    readRelays,
  };

  try {
    // Parse the content and ensure it's an object
    const content = event.content ? JSON.parse(event.content) : {};
    if (typeof content !== "object" || content === null) {
      throw new Error("Invalid profile content format");
    }

    // Safely merge the parsed content with the base profile
    for (const [key, value] of Object.entries(content)) {
      if (value !== undefined && value !== null) {
        profileEvent[key] = value;
      }
    }

    if (!profileEvent.picture) {
      profileEvent.picture = getAvatar(event.pubkey);
    }
    return profileEvent;
  } catch (err) {
    console.error(
      "Error parsing profile content:",
      err instanceof Error ? err.message : "Unknown error",
    );
    if (!profileEvent.picture) {
      profileEvent.picture = getAvatar(event.pubkey);
    }
    return profileEvent;
  }
};
