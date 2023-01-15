"use client";

import { EventContext } from "../../context/event-provider.jsx";
import { useContext, useEffect, useState } from "react";
import Button from "../../Button";
import { BsLightningChargeFill } from "react-icons/bs";
import { usePathname } from "next/navigation.js";
import { RelayContext } from "../../context/relay-provider.jsx";
import { NostrService } from "../../utils/NostrService";

export default function NotePage({ params }: any) {
  // @ts-ignore
  const { event, setEvent } = useContext(EventContext);
  // @ts-ignore
  const { relay, setRelay } = useContext(RelayContext);

  const pathname = usePathname();

  useEffect(() => {
    async function getEvent() {
      if (!relay) {
        const new_relay = await NostrService.connect(
          "wss://nostr-pub.wellorder.net"
        );
        if (pathname) {
          const eventId = pathname.split("/").pop() || "";
          console.log("eventId from path name", eventId);
          await setRelay(new_relay);
          const retrieved_event = await NostrService.getEvent(
            eventId,
            new_relay
          );
          await setEvent(retrieved_event);
        }
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
        <h1 className="text-slate-400 text-2xl">Event ID: {event?.id}</h1>
        <p className="p-4 text-neutral-300 bg-neutral-800 rounded-md">
          {event?.content}
        </p>
        <Button
          color="yellow"
          onClick={handleTip}
          size="sm"
          icon={<BsLightningChargeFill size="14" />}
        >
          tip
        </Button>
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
