import { useQuery } from "@tanstack/react-query";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { SimplePool } from "nostr-tools";
import { createNostrSnippet } from "~/lib/nostr/createNostrSnippet";
import { useState } from "react";

export const useNostrSnippets = (initialPage: number) => {
  const [page, setPage] = useState(initialPage);
  const [since, setSince] = useState<number | undefined>(undefined);

  const fetchPage = async () => {
    const pool = new SimplePool();

    const limit = 10;
    const events = await pool.querySync(DEFAULT_RELAYS, {
      kinds: [1337],
      limit,
      until: page === 0 ? undefined : page,
      since,
    });

    let snippets = events.map((event) => createNostrSnippet(event));

    pool.close(DEFAULT_RELAYS);

    // slice events to limit
    snippets = snippets.slice(0, limit);

    // Sort the events by created_at in descending order
    snippets.sort((a, b) => b.createdAt - a.createdAt);

    return snippets;
  };

  const queryResult = useQuery({
    queryKey: ["snippets", page, since],
    queryFn: fetchPage,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: Number.POSITIVE_INFINITY,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Navigation helper functions
  const navigateToOlder = (): void => {
    if (!queryResult.data || queryResult.data.length === 0) return;
    const oldestEvent = [...queryResult.data].sort(
      (a, b) => a.createdAt - b.createdAt,
    )[0];
    setPage(oldestEvent.createdAt);
    setSince(undefined);
  };

  const navigateToNewer = (): void => {
    if (!queryResult.data || queryResult.data.length === 0) return;
    const newestEvent = [...queryResult.data].sort(
      (a, b) => b.createdAt - a.createdAt,
    )[0];
    setSince(newestEvent.createdAt);
    setPage(0);
  };

  return {
    ...queryResult,
    currentSnippets: queryResult.data || [],
    navigateToOlder,
    navigateToNewer,
  };
};
