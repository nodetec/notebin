"use client";
import { usePathname } from "next/navigation";
import { useNostr } from "nostr-react";
import type { Event, Filter } from "nostr-tools";
import { useEffect, useState } from "react";
import Loading from "../Loading";
import Posts from "../Posts";
import ArchiveNotes from "./ArchiveNotes";

export default function ArchivePage() {
  const pathname = usePathname();
  const POSTS_PER_PAGE = 10;
  const { connectedRelays } = useNostr();
  const [events, setEvents] = useState<Event[]>([]);
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState<Filter>({
    kinds: [2222],
    limit: 100,
    authors: undefined,
    since: undefined,
    until: undefined
  });

  if (pathname) {
    console.log('pathname is:', pathname);
    // page = pathname.split("/").pop() || "1";
  }

  useEffect(() => {
    connectedRelays.forEach((relay) => {
      let sub = relay.sub([filter]);
      let eventArray: Event[] = [];
      sub.on('event', (event: Event) => {
        eventArray.push(event);
      });
      sub.on('eose', () => {
        console.log('EOSE');
        console.log('eventArray', eventArray);
        setEvents(eventArray);
        setIsLoading(false);
        if (eventArray.length) {
          const length = Math.ceil(eventArray.length / POSTS_PER_PAGE);
          if (length) {
            setNumPages(length);
          }
        }
        /* console.log("numPages", numPages); */
        sub.unsub();
      });
    });
  }, [filter, connectedRelays]);

  return (
    <Posts title="Note Archive" className="mx-auto">
      {isLoading ? (
        <Loading />
      ) : (
        <ArchiveNotes
          postPerPage={POSTS_PER_PAGE}
          events={events}
          numPages={numPages}
          filter={filter}
          setFilter={setFilter}
        />
      )}
    </Posts>
  );
}
