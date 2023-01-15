"use client";
import { useContext, useState } from "react";
import "@uiw/react-textarea-code-editor/dist.css";
import dynamic from "next/dynamic";
import { LANGUAGES, RELAYS } from "./constants";
import Button from "./Button";
import { RelayContext } from "./context/relay-provider";
import { NostrService } from "./utils/NostrService";
import { EventContext } from "./context/event-provider";
import { useRouter } from "next/navigation";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);

const NoteArea = () => {
  const [text, setText] = useState("");
  const [syntax, setSyntax] = useState("markdown");
  const [postLoading, setPostLoading] = useState(false);
  // @ts-ignore
  const { setEvent } = useContext(EventContext);
  // @ts-ignore
  const { relay, setRelay } = useContext(RelayContext);
  const router = useRouter();
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tipInfo, setTipInfo] = useState({
    noteAddress: "",
    customValue: "",
  });

  const post = async (e: any) => {
    e.preventDefault();
    setPostLoading(true);

    let localRelay = relay;

    if (!localRelay) {
      localRelay = await NostrService.connect(RELAYS[0]);
      setRelay(localRelay);
    }

    // const privateKey = null;
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
      console.log("got event:", retrieved_event);
      await setEvent(retrieved_event);
      console.log("did it");
      router.push("/note/" + event.id);
    });

    pub.on("failed", (reason: any) => {
      setPostLoading(false);
      console.error(`failed to publish to ${localRelay.url}: ${reason}`);
    });
  };

  return (
    <div className="w-full lg:w-2/3 mx-auto">
      <div className="rounded-md border-2 border-zinc-400 dark:border-neutral-700">
        <div className="bg-zinc-300 dark:bg-neutral-800 p-2">
          <input className="bg-zinc-200 text-neutral-900 dark:bg-neutral-900 dark:text-zinc-300 border-0 outline-0 focus:ring-0 text-sm rounded-md"
            type="text"
            list="syntax-languages"
            placeholder="syntax"
            value={syntax}
            onChange={(e) => setSyntax(e.target.value)}
          />
          <datalist id="syntax-languages">
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </datalist>
        </div>
        <div className="overflow-auto h-[34rem]">
          <CodeEditor
            className="w-full focus:border focus:border-blue-500 p-3 outline-none"
            value={text}
            language={syntax}
            placeholder="Enter your note..."
            autoCapitalize="none"
            onChange={(evn) => setText(evn.target.value)}
            padding={25}
            style={{
              fontSize: 15,
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          color="blue"
          variant="solid"
          size="sm"
          className="ml-auto"
          loading={postLoading}
          onClick={post}
        >
          {postLoading ? "Sending..." : "Create Note"}
        </Button>
      </div>
    </div>
  );
}

export default NoteArea;
