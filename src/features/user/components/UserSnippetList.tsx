"use client";

import { Button } from "~/components/ui/button";
import { SnippetCard } from "~/features/snippet-feed/components/SnippetCard";
import { SnippetCardSkeleton } from "~/features/snippet-feed/components/SnippetCardSkeleton";
import { useUserSnippets } from "~/hooks/useUserSnippets";

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
      <h2 className="font-semibold text-xl">Code Snippets</h2>

      <div className="flex flex-col gap-8">
        {isPending ? (
          <div className="flex flex-col gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <SnippetCardSkeleton key={i} hideAuthor={true} />
            ))}
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-muted-foreground">
            Error loading snippets
          </div>
        ) : !snippets || snippets.length === 0 ? (
          <div className="space-y-4 py-8 text-center">
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
                hideAuthor={true}
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
