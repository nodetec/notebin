"use client";

import { EventContext } from "../../context/event-provider.jsx";
import { useContext, useEffect, useState } from "react";
import Button from "../../Button";
import { BsLightningChargeFill } from "react-icons/bs";

export default function NotePage({ params }: any) {
  // @ts-ignore
  const { event } = useContext(EventContext);

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
      {/* <Header /> */}
      <h1 className="text-slate-50 text-2xl">event id: {event?.id}</h1>
      <div className="">
        <p className="text-slate-300">pubkey: {event?.pubkey}</p>
        <p className="text-slate-300">content: {event?.content}</p>
        <p className="text-slate-300">kind: {event?.kind}</p>
        <p className="text-slate-300">tags: {event?.tags}</p>
        <p className="text-slate-300">sig: {event?.sig}</p>
        <p className="text-slate-300">created_at: {event?.created_at}</p>
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
