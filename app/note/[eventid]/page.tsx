"use client";

import { EventContext } from "../../context/event-provider.jsx";
import { useContext, useEffect } from "react";
import { usePathname } from "next/navigation.js";
import { RelayContext } from "../../context/relay-provider.jsx";
import { NostrService } from "../../utils/NostrService";
import Editor from "../../Editor";
import { RELAYS } from "../../constants";

export default function NotePage() {
  // @ts-ignore
  const { event, setEvent } = useContext(EventContext);
  // @ts-ignore
  const { relays, setRelays } = useContext(RelayContext);

  const pathname = usePathname();

  useEffect(() => {
    let eventId = "";
    if (pathname) {
      eventId = pathname.split("/").pop() || "";
      console.log("eventId from path name", eventId);
    }

    async function getEvent() {
      if (!relays) {
        const new_relays = await NostrService.connect(RELAYS);
        await setRelays(new_relays);
        const retrieved_event = await NostrService.getEvent(
          eventId,
          new_relays[0]
        );
        await setEvent(retrieved_event);
      } else {
        const retrieved_event = await NostrService.getEvent(eventId, relays[0]);
        await setEvent(retrieved_event);
      }
    }

    if (!event) {
      getEvent();
    }
  }, []);

  const handleTip = async () => {
    // @ts-ignore
    if (typeof window.webln !== "undefined") {
      const nodeAddress = event.tags[2][1];
      const customRecord = event.tags[3][1];
      // @ts-ignore
      const result = await webln.keysend({
        destination: nodeAddress,
        amount: 1,
        customRecords: {
          696969: customRecord,
        },
      });
      console.log("Tip Result:", result);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 justify-start">
        {/* <h1 className="text-slate-400 text-2xl">Event ID: {event?.id}</h1> */}
        <Editor event={event} />
      </div>
      {/* <p className="text-slate-600">pubkey: {event?.pubkey}</p> */}
      {/* <p className="text-slate-600">kind: {event?.kind}</p> */}
      {/* <p className="text-slate-600">tags: {event?.tags}</p> */}
      {/* <p className="text-slate-600">sig: {event?.sig}</p> */}
      {/* <p className="text-slate-600">created_at: {event?.created_at}</p> */}
      {/* <p className="text-slate-600 text-2xl">event id: {event?.id}</p> */}
    </div>
  );
}
function sleep(arg0: number) {
  throw new Error("Function not implemented.");
}
