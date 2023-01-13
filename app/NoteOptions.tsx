"use client";

import "websocket-polyfill";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NostrService } from "./utils/NostrService";
import Button from "./Button";
import Select from "./Select";
import { LANGUAGES, RELAYS } from "./constants";
import TextInput from "./TextInput";

export default function NoteOptions({ text, onSetSyntaxOption }: any) {
  const [syntax, setSyntax] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const relayUrlInput = useRef<HTMLSelectElement>(null);
  const router = useRouter();

  const post = async (e: any) => {
    e.preventDefault();
    setPostLoading(true);

    const relay = await NostrService.connect(relayUrlInput.current?.value || "wss://nostr-pub.wellorder.net");
    const privateKey = NostrService.genPrivateKey();
    const publicKey = NostrService.genPublicKey(privateKey);
    const event = NostrService.createEvent(publicKey, text, syntax);
    const eventId = await NostrService.post(relay, privateKey, event);
    console.log(eventId);
    router.push("/note/" + eventId);
  };

  function handleSelect(e: any) {
    onSetSyntaxOption(e.target.value);
    setSyntax(e.target.value);
  }

  return (
    <form onSubmit={post}>
      <div className="text-xl dark:text-slate-300 p-3 rounded-md flex flex-col justify-between">
        Options
        <div className="flex flex-col gap-4 py-4">
          {/* <TextInput */}
          {/*   label="Filename" */}
          {/*   placeholder="Enter filename..." */}
          {/*   onChange={(e) => setSyntax(e.target.value)} */}
          {/* /> */}
          <Select
            label="Syntax"
            options={LANGUAGES}
            onChange={(e: any) => handleSelect(e)}
            defaultValue="markdown"
          />
          {/* <Select */}
          {/*   label="Kind" */}
          {/*   options={["1", "2", "3"]} */}
          {/* /> */}
          <TextInput
            label="Tags"
            placeholder="Enter tags..."
          />
          <Select
            label="Relay"
            ref={relayUrlInput}
            options={RELAYS}
          />
          <div>
            <input
              type="checkbox"
              className="focus:ring-offset-0 focus:ring-0 rounded text-pink-500 bg-gray-200 focus:outline-none"
              id="flexCheckChecked"
            />
            {/* TODO: fix this hack, having troubling aligning center */}
            <label className="text-sm pl-2 pb-1" htmlFor="flexCheckChecked">
              encrypt
            </label>
          </div>
          <span className="text-sm">▶ Advanced</span>
        </div>
        <Button loading={postLoading} type="submit">{postLoading ? "Sending..." : "Send"}</Button>
      </div>
    </form >
  );
}
