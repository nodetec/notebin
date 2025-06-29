import { Skeleton } from "~/components/ui/skeleton";

interface SnippetCardSkeletonProps {
  hideAuthor?: boolean;
}

export function SnippetCardSkeleton({
  hideAuthor = false,
}: SnippetCardSkeletonProps = {}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm">
          {!hideAuthor && (
            <>
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <span className="text-muted-foreground">/</span>
            </>
          )}
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="flex h-[204px] flex-col gap-2 overflow-hidden rounded-md border bg-background p-4 text-md">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}
