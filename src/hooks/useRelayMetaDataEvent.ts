import { useQuery } from "@tanstack/react-query";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { SimplePool } from "nostr-tools";

export async function getRelayMetadataEvent(
  relays: string[],
  publicKey: string | undefined
) {
  if (!publicKey) {
    return null;
  }

  const pool = new SimplePool();

  const relayEvent = await pool.get(relays, {
    kinds: [10002],
    authors: [publicKey],
  });

  pool.close(relays);

  return relayEvent;
}

export const useRelayMetadataEvent = (
  publicKey: string | undefined,
  relays?: string[]
) => {
  return useQuery({
    queryKey: ["relayMetadataEvent", publicKey],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: Number.POSITIVE_INFINITY,
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: () => getRelayMetadataEvent(relays ?? DEFAULT_RELAYS, publicKey),
    enabled: !!publicKey,
  });
};
