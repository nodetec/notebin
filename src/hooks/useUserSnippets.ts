import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { SimplePool } from "nostr-tools";
import { createNostrSnippet } from "~/lib/nostr/createNostrSnippet";
import type { NostrSnippet } from "~/lib/nostr/createNostrSnippet";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export async function getUserSnippets(
  publicKey: string,
  limit = 5,
  until?: number,
) {
  if (!publicKey) return [];

  const pool = new SimplePool();

  try {
    // Query for events authored by the user
    const filter: any = {
      kinds: [1337], // Kind 1337 is for code snippets based on NIP-C0
      authors: [publicKey],
      limit,
    };

    if (until) {
      filter.until = until;
    }

    const events = await pool.querySync(DEFAULT_RELAYS, filter);

    // Convert events to snippets
    let snippets = events.map((event) => createNostrSnippet(event));

    // Limit to requested number of events
    snippets = snippets.slice(0, limit);

    // Sort by created_at in descending order (newest first)
    snippets.sort((a, b) => b.createdAt - a.createdAt);

    return snippets;
  } catch (error) {
    console.error("Error fetching user snippets:", error);
    return [];
  } finally {
    pool.close(DEFAULT_RELAYS);
  }
}

export const useUserSnippets = (publicKey: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const limit = 5;

  const [pageHistory, setPageHistory] = useState<number[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [until, setUntil] = useState<number | undefined>();

  // Initialize until from URL params or current time
  useEffect(() => {
    const untilParam = searchParams.get("until");
    if (untilParam) {
      setUntil(Number.parseInt(untilParam, 10));
    } else {
      setUntil(Math.floor(Date.now() / 1000));
    }
  }, [searchParams]);

  const fetchPage = async () => {
    if (!until || !publicKey) {
      return null;
    }

    return getUserSnippets(publicKey, limit, until);
  };

  const queryResult = useQuery({
    queryKey: ["userSnippets", publicKey, until, pageHistory, currentPageIndex],
    queryFn: fetchPage,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!publicKey && !!until,
  });

  // Function to load the next (older) page of events
  const loadOlderEvents = () => {
    if (queryResult.data && queryResult.data.length === limit) {
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

      if (previousPageUntil) {
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
    queryClient.invalidateQueries({ queryKey: ["userSnippets", publicKey] });
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
