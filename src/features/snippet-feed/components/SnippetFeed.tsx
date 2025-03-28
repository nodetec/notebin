"use client";

import { useNostrSnippets } from "~/hooks/useNostrSnippets";

import { useTheme } from "next-themes";
import { SnippetCard } from "./SnippetCard";
import { Button } from "~/components/ui/button";

export function SnippetFeed() {
  const { resolvedTheme } = useTheme();

  const { data, isLoading, isError, fetchNextPage, hasNextPage } =
    useNostrSnippets();

  return (
    <div className="flex flex-col gap-8">
      {data?.pages.map((page) => (
        <div key={page.nextCursor} className="flex flex-col gap-8">
          {page.snippets.map((snippet) => (
            <div key={snippet.event.id}>
              <SnippetCard snippet={snippet} />
            </div>
          ))}
        </div>
      ))}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button onClick={() => fetchNextPage()} type="button">
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
