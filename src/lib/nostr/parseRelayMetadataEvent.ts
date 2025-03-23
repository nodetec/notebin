import type { Event } from "nostr-tools";

export interface RelayMetadata {
  relays: string[];
  readRelays: string[];
  writeRelays: string[];
}

export function parseRelayMetadataEvent(event?: Event | null): RelayMetadata {
  if (!event) return { relays: [], readRelays: [], writeRelays: [] };

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

  return { relays, readRelays, writeRelays };
}
