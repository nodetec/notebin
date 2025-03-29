import { Skeleton } from "~/components/ui/skeleton";

export function SnippetCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2">
      <h2 className="truncate font-mono font-semibold text-blue-400 text-sm">
        <Skeleton className="h-4 w-1/3" />
      </h2>

      <div className="flex h-[204px] flex-col gap-2 overflow-hidden rounded-md border bg-background p-4 text-md">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}
