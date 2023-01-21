"use client";
import { usePathname } from "next/navigation";
import { useNostrEvents } from "nostr-react";
import { Event } from "nostr-tools";
import { EventContext } from "../context/event-provider";
import { useContext } from "react";
import Profile from "./Profile";

export default function NotePage() {
  const pathname = usePathname();
  let eventId = "";
  if (pathname) {
    eventId = pathname.split("/").pop() || "";
  }

  // @ts-ignore
  const { event: cachedEvent, setEvent } = useContext(EventContext);

  if (cachedEvent && eventId === cachedEvent.id) {
    console.log("using cached event");
    return <Profile event={cachedEvent} />;
    // return <Note event={cachedEvent} />;
  }

  const { events } = useNostrEvents({
    filter: {
      ids: [eventId],
      kinds: [2222],
    },
  });

  const event: Event = events[0];

  if (event) {
    setEvent(event);
    return <Profile event={event} />;
  }
}
