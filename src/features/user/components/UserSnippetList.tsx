"use client";

import { useUserSnippets } from "~/hooks/useUserSnippets";
import { SnippetCard } from "~/features/snippet-feed/components/SnippetCard";
import { SnippetCardSkeleton } from "~/features/snippet-feed/components/SnippetCardSkeleton";
import { Button } from "~/components/ui/button";

interface UserSnippetListProps {
  publicKey: string;
}

export function UserSnippetList({ publicKey }: UserSnippetListProps) {
  const {
    data: snippets,
    isLoading: isPending,
    error: isError,
    loadOlderEvents,
    loadNewerEvents,
    resetToFirstPage,
    hasOlderEvents,
    hasNewerEvents,
    currentPageIndex,
  } = useUserSnippets(publicKey);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Code Snippets</h2>

      <div className="flex flex-col gap-8">
        {isPending ? (
          <div className="flex flex-col gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <SnippetCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-muted-foreground">
            Error loading snippets
          </div>
        ) : !snippets || snippets.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-muted-foreground">No snippets found</div>
            <div className="flex justify-center gap-2">
              {hasNewerEvents ? (
                <Button
                  className="font-mono"
                  onClick={loadNewerEvents}
                  disabled={isPending}
                >
                  Go Back
                </Button>
              ) : (
                <Button
                  className="font-mono"
                  onClick={resetToFirstPage}
                  disabled={isPending}
                >
                  Refresh
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {snippets.map((snippet, index) => (
              <SnippetCard
                key={`${snippet.event.id}-${index}`}
                snippet={snippet}
              />
            ))}
          </div>
        )}

        {snippets && snippets.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
