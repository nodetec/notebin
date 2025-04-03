"use client";
import { useNostrSnippets } from "~/hooks/useNostrSnippets";
import { Button } from "~/components/ui/button";
import { SnippetCardSkeleton } from "./SnippetCardSkeleton";
import { SnippetCard } from "./SnippetCard";
import { useAppState } from "~/store";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
      <div className="flex justify-between gap-4">
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
