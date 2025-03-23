import { useQuery } from "@tanstack/react-query";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { SimplePool, type Event } from "nostr-tools";

export async function getProfileEvent(publicKey?: string, relays?: string[]) {
  if (!publicKey) return null;

  const pool = new SimplePool();

  const profileEvent = await pool.get(relays ?? DEFAULT_RELAYS, {
    kinds: [0],
    authors: [publicKey],
  });

  pool.close(relays ?? DEFAULT_RELAYS);

  return profileEvent;
}

export const useProfileEvent = (publicKey?: string, relays?: string[]) => {
  return useQuery<Event | null>({
    queryKey: ["profile", publicKey, relays],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    enabled: !!publicKey && !!relays,
    queryFn: () => getProfileEvent(publicKey, relays),
  });
};
