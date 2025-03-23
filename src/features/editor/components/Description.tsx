"use client";
import { getTagValue } from "~/lib/nostr/getTagValue";
import { useSnippetEvent } from "../hooks/useSnippetEvent";

type DescriptionProps = {
  eventId: string;
  kind?: number;
  author?: string;
  relays?: string[];
};

export function Description({
  eventId,
  kind,
  author,
  relays,
}: DescriptionProps) {
  const { data: snippet } = useSnippetEvent(eventId, kind, author, relays);

  return (
    <div className="mt-8">
      <div className="flex h-9 w-full min-w-0 cursor-text items-center overflow-x-scroll rounded-md border border-input bg-transparent px-3 py-5 text-base text-muted-foreground shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm disabled:opacity-50 md:text-sm dark:bg-input/30">
        {getTagValue(snippet, "description")}
      </div>
    </div>
  );
}
