"use client";
import { usePathname } from "next/navigation";
import { useNostrEvents } from "nostr-react";
import Note from "./Note";
import { Event } from "nostr-tools";

export default function NotePage() {
  const pathname = usePathname();
  let eventId = "";
  if (pathname) {
    eventId = pathname.split("/").pop() || "";
  }

  const { events } = useNostrEvents({
    filter: {
      ids: [eventId],
      kinds: [2222],
    },
  });

  const event: Event = events[0];

  if (event) {
    return <Note event={event} />;
  }
}
