import type { Event } from "nostr-tools";

export interface NostrRelayMetadata {
  event: Event | null;
  relays: string[];
  readRelays: string[];
  writeRelays: string[];
}

export function createNostrRelayMetadata(event: Event | null) {
  if (!event) {
    return {
      event: null,
      relays: [],
      readRelays: [],
      writeRelays: [],
    };
  }

  const relays = event?.tags?.map((tag) => tag[1] ?? "").filter(Boolean) ?? [];

  const readRelays =
    event?.tags
      ?.filter((tag) => tag[2] !== "write")
      .map((tag) => tag[1] ?? "")
      .filter(Boolean) ?? [];

  const writeRelays =
    event?.tags
      ?.filter((tag) => tag[2] !== "read")
      .map((tag) => tag[1] ?? "")
      .filter(Boolean) ?? [];

  return { event, relays, readRelays, writeRelays };
}
