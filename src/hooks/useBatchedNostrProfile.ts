import { useQuery } from "@tanstack/react-query";
import { profileBatcher } from "~/lib/nostr/batchedProfiles";
import type { NostrProfile } from "~/lib/nostr/createNostrProfile";

export const useBatchedNostrProfile = (publicKey: string | undefined) => {
  return useQuery<NostrProfile | null>({
    queryKey: ["batchedProfile", publicKey],
    queryFn: async () => {
      if (!publicKey) return null;
      return profileBatcher.fetch(publicKey);
    },
    enabled: !!publicKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
