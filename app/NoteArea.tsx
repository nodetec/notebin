"use client";
import { useContext, useState } from "react";
import { useNostr, useNostrEvents } from "nostr-react";
import Button from "./Button";
import { NostrService } from "./utils/NostrService";
import { EventContext } from "./context/event-provider";
import { KeysContext } from "./context/keys-provider.jsx";
import { useRouter } from "next/navigation";
import Editor from "./Editor";

const NoteArea = () => {
  // @ts-ignore
  const { keys } = useContext(KeysContext);
  // @ts-ignore
  const { setEvent } = useContext(EventContext);
  const { publish } = useNostr();
  const { connectedRelays } = useNostr();

  const router = useRouter();
  const [filetype, setFiletype] = useState("markdown");
  const [text, setText] = useState("");
  const [tagInputValue, setTagInputValue] = useState<string>("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [postLoading, setPostLoading] = useState(false);
  const [tipInfo, setTipInfo] = useState({
    noteAddress: "",
    customValue: "",
  });

  const post = async (e: any) => {
    e.preventDefault();
    setPostLoading(true);

    const publicKey = keys.publicKey;

    let event = NostrService.createEvent(
      publicKey,
      text,
      filetype,
      tipInfo.noteAddress,
      tipInfo.customValue,
      tagsList
    );

    event = await NostrService.addEventData(event);

    console.log("gonna publish");

    publish(event);

    let eventId: any = null;
    eventId = event?.id;

    router.push("/note/" + eventId);
  };

  return (
    <div className="w-full lg:w-2/3 mx-auto">
      <Editor
        filetype={filetype}
        setFiletype={setFiletype}
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
};

export default NoteArea;
