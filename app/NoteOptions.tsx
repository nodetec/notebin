"use client";

import "websocket-polyfill";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NostrService } from "./utils/NostrService";

export default function NoteOptions({ text }: any) {
  const [syntax, setSyntax] = useState("");
  const [relayUrl, setRelayUrl] = useState("wss://nostr-pub.wellorder.net");
  const router = useRouter();

  const post = async (e: any) => {
    e.preventDefault();

    const relay = await NostrService.connect(relayUrl);
    const privateKey = NostrService.genPrivateKey();
    const publicKey = NostrService.genPublicKey(privateKey);
    const event = NostrService.createEvent(publicKey, text, syntax);
    const eventId = await NostrService.post(relay, privateKey, event);
    console.log(eventId);
    router.push("/note/" + eventId);
  };

  return (
    <form onSubmit={post}>
      <div className="text-xl dark:text-slate-300 p-3 rounded-md flex flex-col justify-between">
        Options
        <div className="flex flex-col gap-4 mb-4 py-5">
          {/* <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4"> */}
          {/*   <label>Filename</label> */}
          {/*   <input */}
          {/*     type="text" */}
          {/*     placeholder="Enter filename..." */}
          {/*     className="px-3 py-2 rounded w-full text-slate-300 bg-gray-600" */}
          {/*     onChange={(e) => setSyntax(e.target.value)} */}
          {/*   /> */}
          {/* </div> */}
          <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4">
            <label>Syntax</label>
            <select
              onChange={(e: any) => setSyntax(e.target.value)}
              className="px-3 py-2 rounded-md text-sm w-full text-slate-300 bg-gray-600 outline-none"
            >
              <option>JavaScript</option>
              <option>C++</option>
              <option>Python</option>
            </select>
          </div>
          {/* <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4"> */}
          {/*   <label>Kind</label> */}
          {/*   <select className="px-3 py-2 rounded-md text-sm w-full text-slate-300 bg-gray-600 outline-none"> */}
          {/*     <option>1</option> */}
          {/*     <option>2</option> */}
          {/*     <option>3</option> */}
          {/*   </select> */}
          {/* </div> */}
          <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4">
            <label>Tags</label>
            <input
              type="text"
              placeholder="Enter Tags..."
              className="px-3 py-2 rounded w-full text-slate-300 bg-gray-600"
            />
          </div>
          <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4">
            <label>Relay</label>
            <select
              onChange={(e: any) => setRelayUrl(e.target.value)}
              className="px-3 py-2 rounded-md text-sm w-full text-slate-300 bg-gray-600 outline-none"
            >
              <option>wss://nostr-pub.wellorder.net</option>
              <option>wss://nostr.onsats.org</option>
              <option>wss://nostr.bitcoiner.social</option>
              <option>wss://nostr-relay.wlvs.space</option>
              <option>wss://nostr.zebedee.cloud</option>
              <option>wss://relay.damus.io</option>
              <option>wss://relay.nostr.info</option>
            </select>
          </div>
          <div className="flex flex-row gap-2 justify-start items-center mb-4">
            <input
              type="checkbox"
              className="focus:ring-offset-0 focus:ring-0 rounded text-pink-500 bg-gray-200 focus:outline-none"
              id="flexCheckChecked"
            />
            {/* TODO: fix this hack, having troubling aligning center */}
            <label className="text-sm pb-1" htmlFor="flexCheckChecked">
              encrypt
            </label>
          </div>
          <span className="text-sm">▶ Advanced</span>
        </div>
        <button
          className="font-bold flex flex-row justify-center items-center bg-blue-400 hover:bg-blue-500 text-sm dark:text-slate-900 py-1 px-2 rounded-md w-2/5 self-center"
          type="submit"
        >
          Send
        </button>
      </div>
    </form>
  );
}
