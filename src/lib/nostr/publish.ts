import { SimplePool } from "nostr-tools";
import type { Event } from "nostr-tools";

export async function publish(event: Event, relays: string[]) {
  if (!event) {
    return false;
  }
  console.log("event", event);

  const pool = new SimplePool();

  await Promise.any(pool.publish(relays, event));

  const retrievedEvent = await pool.get(relays, {
    ids: [event.id],
  });

  console.log("retrievedEvent", retrievedEvent);

  pool.close(relays);

  if (!retrievedEvent) {
    return false;
  }

  return true;
}
