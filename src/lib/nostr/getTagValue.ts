import type { Event } from "nostr-tools";

export function getTagValue(event?: Event | null, tag?: string | null) {
  if (!event || !tag) {
    return null;
  }

  return event.tags.find((t) => t[0] === tag)?.[1];
}
