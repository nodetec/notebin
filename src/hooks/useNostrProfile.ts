import { useQuery } from "@tanstack/react-query";
import { SimplePool } from "nostr-tools";
import { DEFAULT_RELAYS } from "~/lib/constants";
import type { NostrProfile } from "~/lib/nostr/createNostrProfile";
import { createNostrProfile } from "~/lib/nostr/createNostrProfile";
import { createNostrRelayMetadata } from "~/lib/nostr/createNostrRelayMetadata";

export async function getNostrProfile(
  publicKey?: string,
  checkMetadata?: boolean,
) {
  if (!publicKey) return null;

  const pool = new SimplePool();

  let relays: string[] = [];

  let writeRelays: string[] = [];
  let readRelays: string[] = [];

  if (checkMetadata) {
    const relayEvent = await pool.get(DEFAULT_RELAYS, {
      kinds: [10002],
      authors: [publicKey],
    });

    const nostrRelayMetadata = createNostrRelayMetadata(relayEvent);
    // make sure the relays are unique
    const uniqueRelays = [
      ...new Set([...DEFAULT_RELAYS, ...nostrRelayMetadata.writeRelays]),
    ];
    relays = uniqueRelays;
    writeRelays = nostrRelayMetadata.writeRelays;
    readRelays = nostrRelayMetadata.readRelays;
  }

  if (relays.length === 0) {
    relays = DEFAULT_RELAYS;
  }

  const profileEvent = await pool.get(relays, {
    kinds: [0],
    authors: [publicKey],
  });

  pool.close(relays);

  if (!profileEvent) return null;

  const nostrProfile = createNostrProfile(
    profileEvent,
    writeRelays,
    readRelays,
  );

  return nostrProfile;
}

export const useNostrProfile = (publicKey: string, checkMetadata = false) => {
  return useQuery<NostrProfile | null>({
    queryKey: ["profile", publicKey, checkMetadata],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    enabled: !!publicKey,
    queryFn: () => getNostrProfile(publicKey, checkMetadata),
  });
};
