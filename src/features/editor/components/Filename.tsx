"use client";

import { getTagValue } from "~/lib/nostr/getTagValue";
import { useSnippetEvent } from "../hooks/useSnippetEvent";

type FilenameProps = {
  eventId: string;
  kind?: number;
  author?: string;
  relays?: string[];
};

export function Filename({ eventId, kind, author, relays }: FilenameProps) {
  const { data: snippet } = useSnippetEvent(eventId, kind, author, relays);

  return (
    <span className="truncate pl-1 font-bold font-mono text-muted-foreground text-sm">
      {getTagValue(snippet, "name")}
    </span>
  );
}
