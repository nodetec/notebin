"use client";

import Header from "../../Header";
import { EventContext } from "../../context/event-provider.jsx";
import { useContext, useEffect, useState } from "react";
import { NostrService } from "../../utils/NostrService";
import Button from "../../Button";
import { BsLightningChargeFill } from "react-icons/bs";

export default function NotePage({ params }: any) {
  // const { event, setEvent } = useContext(EventContext);
  const [event, setEvent] = useState(null);
  const [tip, setTip] = useState({
    nodeAddress: null,
    custom_value: null,
  });

  useEffect(() => {
    async function idk() {
      const new_relay = await NostrService.connect(
        "wss://nostr-pub.wellorder.net"
      );
      const id =
        "3a789a77b4d4f89c6e05e06950937b21e8af9adab491acf7f48daa4f9150e944";
      const event = await NostrService.getEvent(id, new_relay);
      setEvent(event);

      // console.log("Node Address:", event.tags[2]);
      // console.log("Custom Value:", event.tags[3]);
      setTip({
        nodeAddress: event.tags[2][1],
        custom_value: event.tags[3][1],
      });
    }

    idk();
  }, []);

  const handleTip = async () => {
    // @ts-ignore
    if (typeof window.webln !== "undefined") {
      // @ts-ignore
      console.log("tip");
      const result = await webln.keysend({
        destination: tip.nodeAddress,
        amount: 1,
        customRecords: {
          696969: tip.custom_value,
        },
      });
    }
  };

  return (
    <div>
      {/* <Header /> */}
      <h1 className="text-slate-50 text-2xl">event id: {event?.id}</h1>
      <div className="">
        {/* <p className="text-slate-300">pubkey: {event?.pubkey}</p> */}
        <p className="text-slate-300">content: {event?.content}</p>
        {/* <p className="text-slate-300">kind: {event?.kind}</p> */}
        {/* <p className="text-slate-300">tags: {event?.tags}</p> */}
        {/* <p className="text-slate-300">sig: {event?.sig}</p> */}
        {/* <p className="text-slate-300">created_at: {event?.created_at}</p> */}
        <p className="text-slate-300">node_address {tip.nodeAddress}</p>
        <p className="text-slate-300">custom_value: {tip.custom_value}</p>
        <Button
          color="yellow"
          onClick={handleTip}
          size="sm"
          icon={<BsLightningChargeFill size="14" />}
        >
          tip
        </Button>
      </div>
    </div>
  );
}
