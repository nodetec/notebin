// import ArchiveNotes from "./ArchiveNotes";

import Link from "next/link";
import { ns } from "../lib/nostr";

import type { Event } from "nostr-tools";
export const dynamic = "auto",
  dynamicParams = true,
  revalidate = 0,
  fetchCache = "auto",
  runtime = "nodejs",
  preferredRegion = "auto";

async function getNotes() {
  // console.log(ns.relays)
  console.log(ns.relays);
  console.log("hi");

  // console.log(ns.relays)
  // ns.connect()
  let eventArray: Event[] = [];

  ns.relays.forEach((relay) => {
    let sub = relay.sub([
      {
        kinds: [2222],
        limit: 10,
      },
    ]);
    sub.on("event", (event: Event) => {
      // console.log("event", event);
      eventArray.push(event);
    });
    sub.on("eose", () => {
      console.log("EOSE");
      sub.unsub();
    });
  });
  return eventArray;
}

export default async function ArchivePage() {
  const events = await getNotes();
  console.log("event", events[0]);

  return (
    <div className="flex flex-col justify-center gap-3">
      <h1 className="text-3xl">Note Archive</h1>
      {/* <ArchiveNotes /> */}

      {events.map((event) => {
        return (
          <div className="border border-gray-600 p-4 rounded-md">
            <Link href={`/u/` + event.pubkey}>
              <p className="text-lg text-zinc-300"> Event ID: {event.id}</p>
            </Link>
            <Link href={`/u/` + event.pubkey}>
              <p className="text-lg text-zinc-300">
                Public Key: {event.pubkey}
              </p>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
