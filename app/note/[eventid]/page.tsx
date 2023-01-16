"use client";

import { EventContext } from "../../context/event-provider.jsx";
import { useContext, useEffect, useState } from "react";
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
  const [markdown, setMarkdown] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(false);

  const pathname = usePathname();

  function setupMarkdown(event: string) {
    var md = require("markdown-it")();
    var result = md.render(event);
    setIsMarkdown(true);
    setMarkdown(result);
  }

  useEffect(() => {
    if (event?.tags[0][1] === "markdown") {
      setupMarkdown(event?.content);
    }

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

        if (retrieved_event?.tags[0][1] === "markdown") {
          setupMarkdown(retrieved_event?.content);
        }
      } else {
        const retrieved_event = await NostrService.getEvent(eventId, relays[0]);
        if (retrieved_event?.tags[0][1] === "markdown") {
          setupMarkdown(retrieved_event?.content);
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

  const shortenHash = (hash: string) => {
    if (hash) {
      return (
        " " + hash.substring(0, 4) + "..." + hash.substring(hash.length - 4)
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 justify-start items-stretch flex-1">
        {event &&
          (isMarkdown || event?.tags[0][1] === "markdown" ? (
            <div className="container flex flex-row w-full justify-between border-t border-zinc-700">
              <div className="basis-2/3 w-2/3 prose prose-zinc dark:prose-invert p-10 flex-shrink-0">
                <div dangerouslySetInnerHTML={{ __html: markdown }}></div>
              </div>
              <div className="flex flex-col basis-1/3 w-1/3">
                <div className="p-10 border-l overflow-hidden border-zinc-700 h-full">
                  <p className="text-zinc-600">kind: {event?.kind}</p>
                  <p className="text-zinc-600">
                    pubkey:
                    {shortenHash(event?.pubkey)}
                  </p>
                  {/* <p className="text-slate-600">tags: {event?.tags}</p> */}
                  <p className="text-zinc-600">
                    sig:
                    {shortenHash(event?.sig)}
                  </p>
                  <p className="text-zinc-600">
                    event id:
                    {shortenHash(event?.id)}
                  </p>
                  <p className="text-zinc-600">
                    created_at: {event?.created_at}
                  </p>
                </div>
                <div></div>
              </div>
            </div>
          ) : (
            <Editor event={event} />
          ))}
      </div>
    </div>
  );
}
