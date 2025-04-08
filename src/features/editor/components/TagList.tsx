"use client";

import { useSnippetEvent } from "../hooks/useSnippetEvent";

type TagListProps = {
  eventId: string;
  kind?: number;
  author?: string;
  relays?: string[];
};

export function TagList({ eventId, kind, author, relays }: TagListProps) {
  const { data: snippet } = useSnippetEvent(eventId, kind, author, relays);

  const tags = snippet?.tags
    .filter((tag) => tag[0] === "t")
    .map((tag) => tag[1]);

  if (!tags) {
    return null;
  }

  return (
    <>
      {tags.length > 0 && (
        <div className="mx-1 mt-8 flex flex-wrap gap-2 font-mono text-sm">
          {tags.map((tag) => (
            <div
              key={tag}
              className="group flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-sm"
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
