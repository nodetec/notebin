"use client";
import { useNostrSnippets } from "~/hooks/useNostrSnippets";
import { SnippetCard } from "./SnippetCard";
import { Button } from "~/components/ui/button";
import { useState } from "react";

export function SnippetFeed() {
  const [currentPage, setCurrentPage] = useState(0);
  const {
    currentSnippets,
    navigateToOlder,
    navigateToNewer,
    isPending,
    isError,
    error,
  } = useNostrSnippets(currentPage);

  return (
    <div className="flex flex-col gap-8">
      {currentSnippets?.map((snippet) => (
        <div key={snippet.event.id}>
          <SnippetCard snippet={snippet} />
        </div>
      ))}
      <div className="flex justify-center gap-4">
        <Button
          onClick={navigateToNewer}
          disabled={isPending || currentSnippets.length === 0}
        >
          {isPending ? "Loading..." : "Load Newer"}
        </Button>
        <Button
          onClick={navigateToOlder}
          disabled={isPending || currentSnippets.length === 0}
          type="button"
        >
          {isPending ? "Loading..." : "Load Older"}
        </Button>
      </div>
    </div>
  );
}
