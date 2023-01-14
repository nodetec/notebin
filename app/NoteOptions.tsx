"use client";

import "websocket-polyfill";
import { useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NostrService } from "./utils/NostrService";
import { RelayContext } from "./context/relay-provider.jsx";
import { EventContext } from "./context/event-provider.jsx";
import Button from "./Button";

export default function NoteOptions({ text, onSetSyntaxOption }: any) {
  const [syntax, setSyntax] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const relayUrlInput = useRef<HTMLSelectElement>(null);
  const router = useRouter();
  // @ts-ignore
  const { relay, setRelay } = useContext(RelayContext);
  // @ts-ignore
  const { setEvent } = useContext(EventContext);

  const post = async (e: any) => {
    e.preventDefault();
    setPostLoading(true);

    // if (!relay) {
    //   const new_relay = await NostrService.connect(
    //     relayUrlInput.current?.value || "wss://nostr-pub.wellorder.net"
    //   );
    //   await setRelay(new_relay);
    // }
    console.log("gonna post")
    console.log(relay)

    const privateKey = NostrService.genPrivateKey();
    console.log(privateKey)
    const publicKey = NostrService.genPublicKey(privateKey);
    console.log(publicKey)
    const event = NostrService.createEvent(publicKey, text, syntax);
    console.log("event:", event)
    const eventId = await NostrService.post(relay, privateKey, event);
    console.log("eventID:", eventId)
    const retrieved_event = await NostrService.getEvent(eventId, relay);
    console.log("got event:", retrieved_event)
    await setEvent(retrieved_event);
    console.log("did it")
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
              defaultValue="markdown"
              onChange={(e: any) => handleSelect(e)}
              className="
                py-2 
                px-3
                dark:text-slate-300 bg-neutral-700 hover:bg-blue-500
                font-medium
                w-full
                text-sm
                leading-tight
                rounded-md
                transition
                duration-150
                ease-in-out
                outline-none
                whitespace-nowrap"
            >
              {[
                "abap",
                "aes",
                "apex",
                "azcli",
                "bat",
                "bicep",
                "c",
                "cameligo",
                "clike",
                "clojure",
                "coffeescript",
                "cpp",
                "csharp",
                "csp",
                "css",
                "dart",
                "dockerfile",
                "ecl",
                "elixir",
                "erlang",
                "flow9",
                "freemarker2",
                "fsharp",
                "go",
                "graphql",
                "handlebars",
                "hcl",
                "html",
                "ini",
                "java",
                "javascript",
                "json",
                "jsx",
                "julia",
                "kotlin",
                "less",
                "lex",
                "lexon",
                "liquid",
                "livescript",
                "lua",
                "m3",
                "markdown",
                "mips",
                "msdax",
                "mysql",
                "nginx",
                "objective-c",
                "pascal",
                "pascaligo",
                "perl",
                "pgsql",
                "php",
                "pla",
                "plaintext",
                "postiats",
                "powerquery",
                "powershell",
                "proto",
                "pug",
                "python",
                "qsharp",
                "r",
                "razor",
                "redis",
                "redshift",
                "restructuredtext",
                "ruby",
                "rust",
                "sb",
                "scala",
                "scheme",
                "scss",
                "shell",
                "sol",
                "sparql",
                "sql",
                "st",
                "stylus",
                "swift",
                "systemverilog",
                "tcl",
                "toml",
                "tsx",
                "twig",
                "typescript",
                "vb",
                "vbscript",
                "verilog",
                "vue",
                "xml",
                "yaml",
              ].map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
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
              className="px-3 py-2 rounded w-full text-slate-300 bg-neutral-700"
            />
          </div>
          {/* <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4"> */}
          {/*   <label>Relay</label> */}
          {/*   <select */}
          {/*     ref={relayUrlInput} */}
          {/*     className="px-3 py-2 rounded-md text-sm w-full text-slate-300 bg-neutral-700 outline-none" */}
          {/*   > */}
          {/*     {[ */}
          {/*       "wss://nostr-pub.wellorder.net", */}
          {/*       "wss://nostr.onsats.org", */}
          {/*       "wss://nostr.bitcoiner.social", */}
          {/*       "wss://nostr-relay.wlvs.space", */}
          {/*       "wss://nostr.zebedee.cloud", */}
          {/*       "wss://relay.damus.io", */}
          {/*       "wss://relay.nostr.info", */}
          {/*     ].map((relay) => ( */}
          {/*       <option key={relay} value={relay}> */}
          {/*         {relay} */}
          {/*       </option> */}
          {/*     ))} */}
          {/*   </select> */}
          {/* </div> */}
          {/* <div className="flex flex-row gap-2 justify-start items-center mb-4"> */}
          {/*   <input */}
          {/*     type="checkbox" */}
          {/*     className="focus:ring-offset-0 focus:ring-0 rounded text-pink-500 bg-gray-200 focus:outline-none" */}
          {/*     id="flexCheckChecked" */}
          {/*   /> */}
          {/*   <label className="text-sm pb-1" htmlFor="flexCheckChecked"> */}
          {/*     encrypt */}
          {/*   </label> */}
          {/* </div> */}
          {/* <span className="text-sm">▶ Advanced</span> */}
        </div>
        <Button loading={postLoading} type="submit">
          {postLoading ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
}
