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
    hasNewerEvents,
    hasOlderEvents,
  } = useNostrSnippets();
  return (
    <div className="flex flex-col gap-8">
      {data?.map((snippet) => (
        <div key={snippet.event.id}>
          <SnippetCard snippet={snippet} />
        </div>
      ))}
      <div className="flex justify-center gap-4">
        <Button
          onClick={loadNewerEvents}
          disabled={isPending || !hasNewerEvents}
        >
          {isPending ? "Loading..." : "Load Newer"}
        </Button>
        <Button
          onClick={loadOlderEvents}
          disabled={isPending || !hasOlderEvents}
          type="button"
        >
          {isPending ? "Loading..." : "Load Older"}
        </Button>
      </div>
    </div>
  );
}
