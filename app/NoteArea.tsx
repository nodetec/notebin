"use client";
import { useContext, useState } from "react";
import { useNostr } from "nostr-react";
import Button from "./Button";
import { NostrService } from "./utils/NostrService";
/* import { EventContext } from "./context/event-provider"; */
import { KeysContext } from "./context/keys-provider.jsx";
import { TipContext } from "./context/tip-provider.jsx";
import { useRouter } from "next/navigation";
import Editor from "./Editor";

const NoteArea = () => {
  // @ts-ignore
  const { keys } = useContext(KeysContext);
  // @ts-ignore
  /* const { setEvent } = useContext(EventContext); */
  // @ts-ignore
  const { tipInfo } = useContext(TipContext);
  const { publish } = useNostr();
  /* const { connectedRelays } = useNostr(); */

  const router = useRouter();
  const [filetype, setFiletype] = useState("markdown");
  const [text, setText] = useState("");
  const [tagInputValue, setTagInputValue] = useState<string>("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [{postSending, postError}, setPost] = useState({postSending: false, postError: ""});

  const post = async (e: any) => {
    e.preventDefault();
    setPost({postSending: true, postError: ""});

    const publicKey = keys.publicKey;

    let event = NostrService.createEvent(
      publicKey,
      text,
      filetype,
      tipInfo.noteAddress,
      tipInfo.customValue,
      tagsList
    );

    try {
      event = await NostrService.addEventData(event);
    } catch(err: any) {
      setPost({postSending: false, postError: err.message});
      return;
    }
    console.log("gonna publish");

    const pubs = publish(event);

    console.log("RETVAL:", pubs);

    /* let eventSeen = false; */

    // @ts-ignore
    for await (const pub of pubs) {
      pub.on("ok", () => {
        console.log("OUR EVENT WAS ACCEPTED");
        setPost({postSending: false, postError: ""});
      });

      pub.on("seen", async () => {
        let eventId: any = null;
        eventId = event?.id;
        console.log("OUR EVENT WAS SEEN");
        router.push("/note/" + eventId);
        setPost({postSending: false, postError: ""});
      });

      pub.on("failed", (reason: any) => {
        setPost({postSending: false, postError: reason});
        console.log("OUR EVENT HAS FAILED");
      });
    }
  };

  return (
    <div className="w-full mx-auto">
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
          loading={postSending}
          onClick={post}
        >
          {postSending ? "Sending..." : postError ? postError : "Create Note"}
        </Button>
      </div>
    </div>
  );
};

export default NoteArea;
