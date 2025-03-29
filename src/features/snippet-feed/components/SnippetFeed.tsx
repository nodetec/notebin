"use client";
import { useNostrSnippets } from "~/hooks/useNostrSnippets";
import { SnippetCard } from "./SnippetCard";
import { Button } from "~/components/ui/button";

export function SnippetFeed() {
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
      {data?.map((snippet) => (
        <div key={snippet.event.id}>
          <SnippetCard snippet={snippet} />
        </div>
      ))}
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
