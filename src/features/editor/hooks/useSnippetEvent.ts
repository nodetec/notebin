import { useQuery } from "@tanstack/react-query";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { SimplePool } from "nostr-tools";

export async function getSnippet(
  eventId: string,
  relays?: string[],
  kind?: number,
  author?: string | undefined
) {
  if (!author) {
    return null;
  }

  const pool = new SimplePool();

  const snippetEvent = await pool.get(relays ?? DEFAULT_RELAYS, {
    kinds: [kind ?? 1337],
    authors: [author],
    ids: [eventId],
  });

  pool.close(relays ?? DEFAULT_RELAYS);

  return snippetEvent;
}

export const useSnippetEvent = (
  eventId: string,
  kind?: number,
  author?: string | undefined,
  relays?: string[]
) => {
  return useQuery({
    queryKey: ["snippet", kind, eventId, author],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: Number.POSITIVE_INFINITY,
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: () => getSnippet(eventId, relays, kind, author),
  });
};
