"use client";
import { useNostrEvents } from "nostr-react";
import ArchiveNote from "./ArchiveNote";

export default function ArchivePage() {
  const { events } = useNostrEvents({
    filter: {
      kinds: [2222],
      limit: 10,
    },
  });

  console.log("EVENTS:", events);

  return (
    <div className="flex flex-col justify-center gap-3">
      <h1 className="text-3xl">Note Archive</h1>
      {events.map((event) => {
        return <ArchiveNote event={event} />;
      })}
    </div>
  );
}
