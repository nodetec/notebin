"use client";

import "websocket-polyfill";
import { useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NostrService } from "./utils/NostrService";
import { RelayContext } from "./context/relay-provider.jsx";
import { EventContext } from "./context/event-provider.jsx";
import Button from "./Button";
import Select from "./Select";
import { LANGUAGES, RELAYS } from "./constants";
import TextInput from "./TextInput";
import { BsLightningChargeFill } from "react-icons/bs";
import { IoMdCloseCircleOutline } from "react-icons/io";

export default function NoteOptions({ text, onSetSyntaxOption }: any) {
  const [syntax, setSyntax] = useState("markdown");
  const [postLoading, setPostLoading] = useState(false);
  /* const relayUrlInput = useRef<HTMLSelectElement>(null); */
  const router = useRouter();
  // @ts-ignore
  const { relay, setRelay } = useContext(RelayContext);
  const [isOpen, setIsOpen] = useState(false);
  // @ts-ignore
  const { setEvent } = useContext(EventContext);
  const [tipInfo, setTipInfo] = useState({
    noteAddress: "",
    customValue: "",
  });
  const [tagInputValue, setTagInputValue] = useState<string>("");
  const [tagsList, setTagsList] = useState<string[]>([]);

  const post = async (e: any) => {
    e.preventDefault();
    setPostLoading(true);

    let localRelay = relay;

    if (!localRelay) {
      localRelay = await NostrService.connect("wss://nostr-pub.wellorder.net");
      setRelay(localRelay);
    }

    const privateKey = null;
    // const publicKey = null;
    // @ts-ignore
    const publicKey = await nostr.getPublicKey();
    let event = NostrService.createEvent(
      publicKey,
      text,
      syntax,
      tipInfo.noteAddress,
      tipInfo.customValue,
      tagsList
    );
    event = await NostrService.addEventData(event);

    let pub = localRelay.publish(event);
    pub.on("ok", () => {
      console.debug(`${localRelay.url} has accepted our event`);
    });

    pub.on("seen", async () => {
      console.debug(`we saw the event on ${localRelay.url}`);
      // @ts-ignore
      const retrieved_event = await NostrService.getEvent(event.id, localRelay);
      await setEvent(retrieved_event);
      router.push("/note/" + event.id);
    });

    pub.on("failed", (reason: any) => {
      console.error(`failed to publish to ${localRelay.url}: ${reason}`);
    });
  };

  const handleClick = async () => {
    setIsOpen(true);
  };

  function handleSelect(e: any) {
    onSetSyntaxOption(e.target.value);
    setSyntax(e.target.value);
  }

  const validateTagsInputKeyDown = (event: any) => {
    const TAG_KEYS = ["Enter", ",", " "];
    if (TAG_KEYS.some((key) => key === event.key)) {
      event.preventDefault();
      if (tagInputValue) {
        setTagsList(Array.from(new Set([...tagsList, tagInputValue])));
        setTagInputValue("");
      }
    }
  };

  return (
    <div>
      <form onSubmit={post}>
        <div className="text-xl dark:text-slate-300 p-3 rounded-md flex flex-col justify-between">
          Options
          <div className="flex flex-col gap-4 py-4">
            <Select
              label="Syntax"
              options={LANGUAGES}
              onChange={handleSelect}
              defaultValue="markdown"
            />
            <TextInput
              label="Tags"
              placeholder="Enter tags..."
              onKeyDown={validateTagsInputKeyDown}
              value={tagInputValue}
              onChange={(e) => setTagInputValue(e.target.value)}
              tagsList={tagsList}
              setTagsList={setTagsList}
            />
            <label>Relay</label>
            <span className="px-3 py-2 rounded-md text-sm w-full text-neutral-700 dark:text-zinc-300 bg-zinc-300 dark:bg-neutral-700 overflow-scroll">
              wss://nostr-pub.wellorder.net
            </span>
          </div>
          <Button loading={postLoading} type="submit">
            {postLoading ? "Sending..." : "Send"}
          </Button>
          <Button
            color={"yellow"}
            className={"mt-4"}
            icon={<BsLightningChargeFill size="14" />}
            onClick={handleClick}
            type="button"
          >
            Accept Tip
          </Button>
        </div>
      </form>
      {isOpen && (
        <>
          <div className="z-50 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 border-2 border-neutral-500 rounded-md h-1/4">
            <Button
              icon={<IoMdCloseCircleOutline size={24} />}
              className="absolute w-fit right-0 top-0 text-neutral-400"
              onClick={() => setIsOpen(false)}
              color="transparent"
            />
            <div className="bg-neutral-900 flex flex-col justify-center items-stretch gap-4 p-6 rounded-md shadow-overlay">
              <h3 className="text-xl text-neutral-400 text-center pb-4">
                Tip Info
              </h3>
              <TextInput
                value={tipInfo.noteAddress}
                onChange={(e) =>
                  setTipInfo((current) => ({
                    ...current,
                    noteAddress: e.target.value,
                  }))
                }
                label="Note Address"
              />
              <TextInput
                value={tipInfo.customValue}
                onChange={(e) =>
                  setTipInfo((current) => ({
                    ...current,
                    customValue: e.target.value,
                  }))
                }
                label="Custom Record (if applicable)"
              />
              <Button onClick={() => setIsOpen(false)}>Done</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
