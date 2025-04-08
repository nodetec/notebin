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
    <div className="my-8">
      <div className="flex w-full cursor-text items-center break-all rounded-md border border-input bg-transparent p-3 text-base text-muted-foreground shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm disabled:opacity-50 md:text-sm dark:bg-input/30">
        {getTagValue(snippet, "description")}
      </div>
    </div>
  );
}
