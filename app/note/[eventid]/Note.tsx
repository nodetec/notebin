"use client";

import Link from "next/link";
import { useNostrEvents, useProfile } from "nostr-react";
import { useEffect, useState } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import Button from "../../Button";
import Editor from "../../Editor";
import { Event } from "../../utils/NostrService";

export default function Note({ eventId, keys }: any) {
  // TODO: get event from context if available instead of using hook everytime
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
      {event &&
        (isMarkdown || event?.tags[0][1] === "markdown" ? (
          <div className="border-t border-zinc-700">
            <div className="flex justify-center">
              <div className="w-2/3 prose prose-zinc dark:prose-invert p-10 shrink-0 grow-0 basis-11/12">
                <div dangerouslySetInnerHTML={{ __html: markdown }}></div>
              </div>
              <div className="w-1/3 border-l border-zinc-700 grow-0 shrink-0 basis-1/12">
                <div className="p-10 overflow-hidden h-full">
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
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Editor event={event} />
        ))}
    </div>
  );
}
