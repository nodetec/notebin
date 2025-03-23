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
    <div className="flex items-center gap-2">
      <p className="pl-1 font-bold font-mono text-muted-foreground text-sm">
        {getTagValue(snippet, "f")}
      </p>
    </div>
  );
}
