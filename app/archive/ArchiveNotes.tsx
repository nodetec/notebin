"use client";
import ArchiveNote from "./ArchiveNote";

import { useNostr } from "nostr-react";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { KeysContext } from "../context/keys-provider";

import type { Event, Filter } from "nostr-tools";

export default function ArchiveNotes() {
  // @ts-ignore
  const { keys: loggedInUserKeys } = useContext(KeysContext);

  const [filter, setFilter] = useState<Filter>({
    kinds: [2222],
    limit: 10,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const { connectedRelays } = useNostr();

  useEffect(() => {
    connectedRelays.forEach((relay) => {
      let sub = relay.sub([filter]);
      let eventArray: Event[] = [];
      sub.on("event", (event: Event) => {
        eventArray.push(event);
      });
      sub.on("eose", () => {
        console.log("EOSE");
        setEvents(eventArray);
        sub.unsub();
      });
    });
  }, [filter, connectedRelays]);

  function handleFollowFilter(e: any) {
    e.preventDefault();

    // let followedAuthors: Set<string> = new Set();
    let followedAuthors: string[];

    connectedRelays.forEach((relay) => {
      let sub = relay.sub([
        {
          authors: [loggedInUserKeys.publicKey],
          kinds: [3],
          limit: 10,
        },
      ]);
      sub.on("event", (event: Event) => {
        // eventArray.push(event);
        // TODO: we could go through each event and add each lis of followers to a set, but for now we'll just use one
        followedAuthors = event.tags.map((pair: string[]) => pair[1]);
        console.log("followedAuthors", followedAuthors);
      });
      sub.on("eose", () => {
        console.log("EOSE");
        setFilter({
          kinds: [2222],
          authors: followedAuthors,
          limit: 10,
        });
        sub.unsub();
      });
    });
  }

  function handleExploreFilter(e: any) {
    e.preventDefault();
    setFilter({
      kinds: [2222],
      limit: 10,
    });
  }

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={handleExploreFilter}
          className="bg-blue-400 rounded-md text-xl w-40"
        >
          explore
        </button>
        <button
          onClick={handleFollowFilter}
          className="bg-blue-400 rounded-md text-xl w-40"
        >
          following
        </button>
      </div>
      {events.map((event) => {
        return <ArchiveNote event={event} />;
      })}
    </>
  );
}
