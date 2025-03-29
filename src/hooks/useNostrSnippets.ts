import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { SimplePool } from "nostr-tools";
import { createNostrSnippet } from "~/lib/nostr/createNostrSnippet";
import { useState, useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export const useNostrSnippets = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const limit = 10;

  // Initialize until from URL or undefined
  const [until, setUntil] = useState<number | undefined>(() => {
    const untilParam = searchParams.get("until");
    return untilParam ? Number.parseInt(untilParam, 10) : undefined;
  });

  // Initialize page history and current page index from URL or defaults
  const [pageHistory, setPageHistory] = useState<number[]>(() => {
    const historyParam = searchParams.get("history");
    return historyParam ? JSON.parse(decodeURIComponent(historyParam)) : [];
  });

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(() => {
    const indexParam = searchParams.get("pageIndex");
    return indexParam ? Number.parseInt(indexParam, 10) : 0;
  });

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (until === undefined) {
      params.delete("until");
    } else {
      params.set("until", until.toString());
    }

    if (pageHistory.length === 0) {
      params.delete("history");
    } else {
      params.set("history", encodeURIComponent(JSON.stringify(pageHistory)));
    }

    if (currentPageIndex === 0) {
      params.delete("pageIndex");
    } else {
      params.set("pageIndex", currentPageIndex.toString());
    }

    router.push(`?${params.toString()}`);
  }, [until, pageHistory, currentPageIndex, router, searchParams]);

  const fetchPage = async () => {
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

    if (snippets.length > 0) {
      console.log(
        "Newest snippet:",
        new Date(snippets[0].createdAt * 1000).toISOString(),
      );
      console.log(
        "Oldest snippet:",
        new Date(snippets[snippets.length - 1].createdAt * 1000).toISOString(),
      );

      // For the first page, initialize the page history
      if (
        until === undefined &&
        pageHistory.length === 0 &&
        snippets.length > 0
      ) {
        // Store the current page's newest timestamp
        setPageHistory([snippets[0].createdAt + 1]); // +1 to ensure we get this snippet in "newer" queries
        setCurrentPageIndex(0);
      }
    } else {
      console.log("No snippets found");
    }

    return snippets;
  };

  const queryResult = useQuery({
    queryKey: ["snippets", until],
    queryFn: fetchPage,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: Number.POSITIVE_INFINITY,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Function to load the next (older) page of events
  const loadOlderEvents = () => {
    if (queryResult.data && queryResult.data.length > 0) {
      // Get the oldest timestamp from the current page
      const oldestSnippet = queryResult.data[queryResult.data.length - 1];
      const newUntil = oldestSnippet.createdAt - 1; // -1 to avoid getting the same event again

      // Update the page history - remove any forward history if we're not at the end
      const newHistory =
        currentPageIndex < pageHistory.length - 1
          ? pageHistory.slice(0, currentPageIndex + 1)
          : pageHistory;

      // Add the new page to history
      const updatedHistory = [...newHistory, newUntil];
      setPageHistory(updatedHistory);
      setCurrentPageIndex(updatedHistory.length - 1);

      // Update the query
      setUntil(newUntil);
    }
  };

  // Function to load newer events (previous page)
  const loadNewerEvents = () => {
    if (currentPageIndex > 0) {
      // Move back one page in history
      const newIndex = currentPageIndex - 1;
      setCurrentPageIndex(newIndex);
      const previousPageUntil =
        newIndex === 0 ? undefined : pageHistory[newIndex];

      setUntil(previousPageUntil);
    }
  };

  // Reset to first page
  const resetToFirstPage = () => {
    toast("Refreshing...", {
      description: "Refreshing the snippet feed.",
      dismissible: true,
      invert: true,
      duration: 1500,
      position: "top-center",
    });

    setUntil(undefined);
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
  };
};
