"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useNostrSnippets } from "~/hooks/useNostrSnippets";
import { useAppState } from "~/store";
import { SnippetCard } from "./SnippetCard";
import { SnippetCardSkeleton } from "./SnippetCardSkeleton";
export function SnippetFeed() {
  const until = useAppState((state) => state.until);
  const setUntil = useAppState((state) => state.setUntil);
  const searchParams = useSearchParams();

  useEffect(() => {
    const untilParam = searchParams.get("until");
    if (untilParam) {
      setUntil(Number.parseInt(untilParam, 10));
    } else {
      setUntil(Math.floor(Date.now() / 1000));
    }
  }, [setUntil, searchParams]);

  const {
    data,
    isPending,
    isError,
    error,
    loadOlderEvents,
    loadNewerEvents,
    resetToFirstPage,
    hasOlderEvents,
    hasNewerEvents,
    currentPageIndex,
  } = useNostrSnippets();
  return (
    <div className="flex flex-col gap-8">
      {isPending ? (
        <>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index}>
              <SnippetCardSkeleton />
            </div>
          ))}
        </>
      ) : (
        data?.map((snippet) => (
          <div key={snippet.event.id}>
            <SnippetCard snippet={snippet} />
          </div>
        ))
      )}
      <div className="flex items-center justify-between gap-4">
        {hasNewerEvents ? (
          <Button
            className="font-mono"
            onClick={loadNewerEvents}
            disabled={isPending || !hasNewerEvents}
          >
            {isPending ? "Loading..." : "Newer"}
          </Button>
        ) : (
          <Button className="font-mono" onClick={resetToFirstPage}>
            Refresh
          </Button>
        )}
        <span className="font-mono text-muted-foreground">
          Page: {currentPageIndex + 1}
        </span>
        <Button
          className="font-mono"
          onClick={loadOlderEvents}
          disabled={isPending || !hasOlderEvents}
          type="button"
        >
          {isPending ? "Loading..." : "Older"}
        </Button>
      </div>
    </div>
  );
}
