"use client";

import "websocket-polyfill";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NostrService } from "./utils/NostrService";
import Button from "./Button";

export default function NoteOptions({ text, onSetSyntaxOption }: any) {
  const [syntax, setSyntax] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const relayUrlInput = useRef<HTMLSelectElement>(null);
  const router = useRouter();

  const post = async (e: any) => {
    e.preventDefault();
    setPostLoading(true);

    const relay = await NostrService.connect(relayUrlInput.current?.value  || "wss://nostr-pub.wellorder.net");
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
              <option value="abap">abap</option>
              <option value="aes">aes</option>
              <option value="apex">apex</option>
              <option value="azcli">azcli</option>
              <option value="bat">bat</option>
              <option value="bicep">bicep</option>
              <option value="c">c</option>
              <option value="cameligo">cameligo</option>
              <option value="clike">clike</option>
              <option value="clojure">clojure</option>
              <option value="coffeescript">coffeescript</option>
              <option value="cpp">cpp</option>
              <option value="csharp">csharp</option>
              <option value="csp">csp</option>
              <option value="css">css</option>
              <option value="dart">dart</option>
              <option value="dockerfile">dockerfile</option>
              <option value="ecl">ecl</option>
              <option value="elixir">elixir</option>
              <option value="erlang">erlang</option>
              <option value="flow9">flow9</option>
              <option value="freemarker2">freemarker2</option>
              <option value="fsharp">fsharp</option>
              <option value="go">go</option>
              <option value="graphql">graphql</option>
              <option value="handlebars">handlebars</option>
              <option value="hcl">hcl</option>
              <option value="html">html</option>
              <option value="ini">ini</option>
              <option value="java">java</option>
              <option value="javascript">javascript</option>
              <option value="json">json</option>
              <option value="jsx">jsx</option>
              <option value="julia">julia</option>
              <option value="kotlin">kotlin</option>
              <option value="less">less</option>
              <option value="lex">lex</option>
              <option value="lexon">lexon</option>
              <option value="liquid">liquid</option>
              <option value="livescript">livescript</option>
              <option value="lua">lua</option>
              <option value="m3">m3</option>
              <option selected value="markdown">markdown</option>
              <option value="mips">mips</option>
              <option value="msdax">msdax</option>
              <option value="mysql">mysql</option>
              <option value="nginx">nginx</option>
              <option value="objective-c">objective-c</option>
              <option value="pascal">pascal</option>
              <option value="pascaligo">pascaligo</option>
              <option value="perl">perl</option>
              <option value="pgsql">pgsql</option>
              <option value="php">php</option>
              <option value="pla">pla</option>
              <option value="plaintext">plaintext</option>
              <option value="postiats">postiats</option>
              <option value="powerquery">powerquery</option>
              <option value="powershell">powershell</option>
              <option value="proto">proto</option>
              <option value="pug">pug</option>
              <option value="python">python</option>
              <option value="qsharp">qsharp</option>
              <option value="r">r</option>
              <option value="razor">razor</option>
              <option value="redis">redis</option>
              <option value="redshift">redshift</option>
              <option value="restructuredtext">restructuredtext</option>
              <option value="ruby">ruby</option>
              <option value="rust">rust</option>
              <option value="sb">sb</option>
              <option value="scala">scala</option>
              <option value="scheme">scheme</option>
              <option value="scss">scss</option>
              <option value="shell">shell</option>
              <option value="sol">sol</option>
              <option value="sparql">sparql</option>
              <option value="sql">sql</option>
              <option value="st">st</option>
              <option value="stylus">stylus</option>
              <option value="swift">swift</option>
              <option value="systemverilog">systemverilog</option>
              <option value="tcl">tcl</option>
              <option value="toml">toml</option>
              <option value="tsx">tsx</option>
              <option value="twig">twig</option>
              <option value="typescript">typescript</option>
              <option value="vb">vb</option>
              <option value="vbscript">vbscript</option>
              <option value="verilog">verilog</option>
              <option value="vue">vue</option>
              <option value="xml">xml</option>
              <option value="yaml">yaml</option>
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
          <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4">
            <label>Relay</label>
            <select
              ref={relayUrlInput}
              className="px-3 py-2 rounded-md text-sm w-full text-slate-300 bg-neutral-700 outline-none"
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
        <Button loading={postLoading} type="submit">{postLoading ? "Sending..." : "Send"}</Button>
      </div>
    </form>
  );
}
