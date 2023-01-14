"use client";

import Header from "../../Header";
import { EventContext } from "../../context/event-provider.jsx";
import { useContext } from "react";

export default function NotePage({ params }: any) {
  // @ts-ignore
  const { event } = useContext(EventContext);

  return (
    <div>
      <Header />
      <h1 className="text-slate-50 text-2xl">event id: {event?.id}</h1>
      <div className="">
        <p className="text-slate-300">pubkey: {event?.pubkey}</p>
        <p className="text-slate-300">content: {event?.content}</p>
        <p className="text-slate-300">kind: {event?.kind}</p>
        <p className="text-slate-300">tags: {event?.tags}</p>
        <p className="text-slate-300">sig: {event?.sig}</p>
        <p className="text-slate-300">created_at: {event?.created_at}</p>
      </div>
    </div>
  );
}
