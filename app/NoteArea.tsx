"use client";
import { useContext, useState } from "react";
import { LANGUAGES, RELAYS } from "./constants";
import Button from "./Button";
import { RelayContext } from "./context/relay-provider";
import { NostrService } from "./utils/NostrService";
import { EventContext } from "./context/event-provider";
import { useRouter } from "next/navigation";
import TextInput from "./TextInput";
import Editor from "./Editor";

const NoteArea = () => {
  const [syntax, setSyntax] = useState("markdown");
  const [text, setText] = useState("");
  const [tagInputValue, setTagInputValue] = useState<string>("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [postLoading, setPostLoading] = useState(false);
  // @ts-ignore
  const { setEvent } = useContext(EventContext);
  // @ts-ignore
  const { relay, setRelay } = useContext(RelayContext);
  const router = useRouter();
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
      <Editor
        syntax={syntax}
        setSyntax={setSyntax}
        text={text}
        setText={setText}
        tagsList={tagsList}
        setTagsList={setTagsList}
        tagInputValue={tagInputValue}
        setTagInputValue={setTagInputValue}
      />
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
