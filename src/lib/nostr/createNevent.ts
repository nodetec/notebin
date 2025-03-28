import { nip19 } from "nostr-tools";
import type { Event } from "nostr-tools";
import type { EventPointer } from "nostr-tools/nip19";

export function createNevent(event: Event, relays: string[]) {
  const eventPointer: EventPointer = {
    id: event.id,
    relays: relays,
    author: event.pubkey,
    kind: event.kind,
  };

  const nevent = nip19.neventEncode(eventPointer);

  return nevent;
}
