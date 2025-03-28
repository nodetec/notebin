import { useQuery } from "@tanstack/react-query";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { SimplePool } from "nostr-tools";
import {
  createNostrRelayMetadata,
  type NostrRelayMetadata,
} from "~/lib/nostr/createNostrRelayMetadata";

export async function getNostrRelayMetadata(
  publicKey: string,
  relays?: string[],
) {
  const pool = new SimplePool();

  const relayEvent = await pool.get(relays ?? DEFAULT_RELAYS, {
    kinds: [10002],
    authors: [publicKey],
  });

  pool.close(relays ?? DEFAULT_RELAYS);

  return createNostrRelayMetadata(relayEvent);
}

export const useNostrRelayMetadata = (publicKey: string, relays?: string[]) => {
  return useQuery<NostrRelayMetadata>({
    queryKey: ["nostrRelayMetadata", publicKey],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: Number.POSITIVE_INFINITY,
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: () => getNostrRelayMetadata(publicKey, relays),
    enabled: !!publicKey,
  });
};
