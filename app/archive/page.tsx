// import ArchiveNotes from "./ArchiveNotes";

import { ns } from "../lib/nostr";

export async function getNotes() {
  // console.log(ns.relays)
  // console.log(ns.relays)

  ns.relays.forEach((relay) => {
    let sub = relay.sub([
      {
        kinds: [2222],
        limit: 10,
      },
    ]);
    let eventArray: Event[] = [];
    sub.on("event", (event: Event) => {
      console.log("event", event);
      eventArray.push(event);
    });
    sub.on("eose", () => {
      console.log("EOSE");
      sub.unsub();
    });
  });
}

export default async function ArchivePage() {
  await getNotes();
  return (
    <div className="flex flex-col justify-center gap-3">
      <h1 className="text-3xl">Note Archive</h1>
      {/* <ArchiveNotes /> */}
    </div>
  );
}
