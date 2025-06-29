import { create, windowScheduler } from "@yornaath/batshit";
import { SimplePool } from "nostr-tools";
import { DEFAULT_RELAYS } from "~/lib/constants";
import type { NostrProfile } from "~/lib/nostr/createNostrProfile";
import { createNostrProfile } from "~/lib/nostr/createNostrProfile";

export const profileBatcher = create({
  fetcher: async (publicKeys: string[]) => {
    const pool = new SimplePool();

    const profileEvents = await pool.querySync(DEFAULT_RELAYS, {
      kinds: [0],
      authors: publicKeys,
    });

    pool.close(DEFAULT_RELAYS);

    const profiles: Record<string, NostrProfile | null> = {};

    for (const publicKey of publicKeys) {
      const profileEvent = profileEvents.find(
        (event) => event.pubkey === publicKey,
      );
      if (profileEvent) {
        profiles[publicKey] = createNostrProfile(profileEvent, [], []);
      } else {
        profiles[publicKey] = null;
      }
    }

    return profiles;
  },
  resolver: (profiles, publicKey) => {
    return profiles[publicKey] || null;
  },
  scheduler: windowScheduler(50), // 50ms window for batching
});
