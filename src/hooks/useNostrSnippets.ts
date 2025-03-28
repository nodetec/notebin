import { useInfiniteQuery } from "@tanstack/react-query";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { SimplePool } from "nostr-tools";
import { createNostrSnippet } from "~/lib/nostr/createNostrSnippet";

const fetchPage = async ({ pageParam }: { pageParam: number }) => {
  const pool = new SimplePool();

  let limit = 5;

  if (pageParam === 0) {
    limit = 10;
  }

  const events = await pool.querySync(DEFAULT_RELAYS, {
    kinds: [1337],
    limit,
    until: pageParam === 0 ? undefined : pageParam - 1,
  });

  let snippets = events.map((event) => createNostrSnippet(event));

  pool.close(DEFAULT_RELAYS);

  if (!snippets) {
    return { snippets: [], nextCursor: pageParam };
  }

  // slice events to limit
  snippets = snippets.slice(0, limit);

  // Sort the events by created_at in descending order
  snippets.sort((a, b) => b.createdAt - a.createdAt);

  let nextCursor = pageParam;
  if (snippets.length > 0) {
    const lastEvent = snippets[snippets.length - 1];
    if (lastEvent) {
      nextCursor = lastEvent.createdAt;
    }
  }

  return {
    snippets,
    nextCursor,
  };
};

export const useNostrSnippets = () => {
  return useInfiniteQuery({
    queryKey: ["snippets"],
    queryFn: ({ pageParam }) =>
      fetchPage({
        pageParam,
      }),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: Number.POSITIVE_INFINITY,
    staleTime: Number.POSITIVE_INFINITY,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
