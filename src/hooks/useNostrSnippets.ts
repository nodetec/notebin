import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { SimplePool } from "nostr-tools";
import { createNostrSnippet } from "~/lib/nostr/createNostrSnippet";
import { useAppState } from "~/store";
import { useRouter, useSearchParams } from "next/navigation";

export const useNostrSnippets = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const limit = 10;

  const pageHistory = useAppState((state) => state.pageHistory);
  const setPageHistory = useAppState((state) => state.setPageHistory);
  const currentPageIndex = useAppState((state) => state.currentPageIndex);
  const setCurrentPageIndex = useAppState((state) => state.setCurrentPageIndex);
  const until = useAppState((state) => state.until);
  const setUntil = useAppState((state) => state.setUntil);

  const fetchPage = async () => {
    if (!until) {
      return null;
    }
    const pool = new SimplePool();

    // Query for events
    const events = await pool.querySync(DEFAULT_RELAYS, {
      kinds: [1337],
      limit,
      until,
    });

    console.log("Fetching with until:", until);

    // Convert events to snippets
    let snippets = events.map((event) => createNostrSnippet(event));

    // Close the pool connection
    pool.close(DEFAULT_RELAYS);

    // Limit to requested number of events
    snippets = snippets.slice(0, limit);

    // Sort the events by created_at in descending order (newest first)
    snippets.sort((a, b) => b.createdAt - a.createdAt);

    return snippets;
  };

  const queryResult = useQuery({
    queryKey: ["snippets", until, pageHistory, currentPageIndex],
    queryFn: fetchPage,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Function to load the next (older) page of events
  const loadOlderEvents = () => {
    if (queryResult.data && queryResult.data.length > 0) {
      // Get the oldest timestamp from the current page
      const oldestSnippet = queryResult.data[queryResult.data.length - 1];
      const newUntil = oldestSnippet.createdAt - 1; // -1 to avoid getting the same event again

      if (until) {
        setPageHistory([...pageHistory, until]);
      }
      setUntil(newUntil);
      const params = new URLSearchParams(searchParams.toString());
      params.set("until", newUntil.toString());
      router.push(`?${params.toString()}`);
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  // Function to load newer events (previous page)
  const loadNewerEvents = () => {
    if (currentPageIndex > 0) {
      // Move back one page in history
      setCurrentPageIndex(currentPageIndex - 1);

      const previousPageUntil =
        currentPageIndex === 0 ? undefined : pageHistory[currentPageIndex - 1];

      console.log("previousPageUntil", previousPageUntil);

      if (previousPageUntil) {
        console.log(
          "setting page history",
          pageHistory.slice(0, currentPageIndex - 1),
        );
        setPageHistory(pageHistory.slice(0, currentPageIndex - 1));
        setUntil(previousPageUntil);
        const params = new URLSearchParams(searchParams.toString());
        params.set("until", previousPageUntil.toString());
        router.push(`?${params.toString()}`);
      }
    }
  };

  // Reset to first page
  const resetToFirstPage = () => {
    setUntil(Math.floor(Date.now() / 1000));
    setPageHistory([]);
    setCurrentPageIndex(0);
    queryClient.invalidateQueries({ queryKey: ["snippets"] });
  };

  return {
    ...queryResult,
    loadOlderEvents,
    loadNewerEvents,
    resetToFirstPage,
    hasOlderEvents: queryResult.data && queryResult.data.length === limit,
    hasNewerEvents: currentPageIndex > 0,
    currentPageIndex,
  };
};
