"use client";

import Link from "next/link";
import { useNostrEvents, useProfile } from "nostr-react";
import { useEffect, useState, useRef } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import Button from "../../Button";
import Editor from "../../Editor";
import Popup from "../../Popup";
import TextInput from "../../TextInput";
import { Event } from "../../utils/NostrService";
import { handleTip } from "../../utils/webln";

export default function Note({ eventId, keys }: any) {
  const { events } = useNostrEvents({
    filter: {
      ids: [eventId],
      since: 0,
      kinds: [2222],
    },
  });

  let pubkey = "";
  if (keys.publicKey) {
    pubkey = keys.publicKey;
  }

  const { data } = useProfile({
    pubkey,
  });
  console.log("events", events);
  const [markdown, setMarkdown] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [event, setEvent] = useState<Event>();
  const [isTipOpen, setIsTipOpen] = useState(false);
  const tipAmountRef = useRef<HTMLInputElement>(null);

  function setupMarkdown(event: string) {
    var md = require("markdown-it")();
    var result = md.render(event);
    setIsMarkdown(true);
    setMarkdown(result);
  }

  useEffect(() => {
    setEvent(events[0]);
    if (event?.tags[0][1] === "markdown") {
      setupMarkdown(event?.content);
    }
  }, [events]);

  const handleTip = async () => {
    // @ts-ignore
    if (typeof window.webln !== "undefined") {
      const nodeAddress = event?.tags[2][1];
      const customRecord = event?.tags[3][1];
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

  const shortenHash = (hash: string | undefined) => {
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
                  <Link
                    className="text-xl dark:text-zinc-400 text-neutral-800 hover:dark:text-zinc-500"
                    href={`/profile/` + pubkey}
                  >
                    <img className="rounded-full w-20" src={data?.picture} />
                  </Link>
                  <p className="text-lg font-bold pt-4 text-zinc-200">
                    @{data?.name}
                  </p>
                  <p className="text-lg text-zinc-400">
                    {shortenHash(data?.npub)}
                  </p>
                  <p className="text-sm text-zinc-400 pt-4">{data?.about}</p>
                  <Button
                    className="mt-4"
                    color="yellow"
                    variant="outline"
                    onClick={handleTip}
                    size="sm"
                    icon={<BsLightningChargeFill size="14" />}
                  >
                    tip
                  </Button>
                  {/* <p className="text-zinc-600">kind: {event?.kind}</p> */}
                  {/* <p className="text-zinc-600"> */}
                  {/*   pubkey: */}
                  {/*   {shortenHash(event?.pubkey)} */}
                  {/* </p> */}
                  {/* <p className="text-slate-600">tags: {event?.tags}</p> */}
                  {/* <p className="text-zinc-600"> */}
                  {/*   sig: */}
                  {/*   {shortenHash(event?.sig)} */}
                  {/* </p> */}
                  {/* <p className="text-zinc-600"> */}
                  {/*   event id: */}
                  {/*   {shortenHash(event?.id)} */}
                  {/* </p> */}
                  {/* <p className="text-zinc-600"> */}
                  {/*   created_at: {event?.created_at} */}
                  {/* </p> */}
                  <Button
                    className="w-full mt-4"
                    color="yellow"
                    onClick={() => setIsTipOpen(true)}
                    icon={<BsLightningChargeFill size="14" />}
                  >
                    tip
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Editor event={event} />
          ))}
      </div>
      <Popup title="Pay with Lightning" isOpen={isTipOpen} setIsOpen={setIsTipOpen}>
        <form 
          onSubmit={() => handleTip(event, tipAmountRef.current.value)}
          className="flex flex-col gap-4 items-center">
          <div className="flex items-center w-full py-2 px-4 rounded-md dark:bg-neutral-800 dark:text-zinc-300 ring-1 ring-yellow-500">
            <input
              type="number"
              ref={tipAmountRef}
              placeholder="Enter amount in sats"
              required
              min={1}
              className="w-full flex-1 focus:ring-0 border-0 bg-transparent dark:text-zinc-300"
            />
          <span className="text-yellow-400 text-sm font-bold">
            satoshis
          </span>
          </div>
          <Button
            className="w-full"
            color="yellow"
            icon={<BsLightningChargeFill size="14" />}
          >
            tip
          </Button>
        </form>
      </Popup>
    </div>
  );
}
