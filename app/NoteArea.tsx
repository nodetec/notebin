"use client";
import { useContext, useState } from "react";
import { useNostr } from "nostr-react";
import Button from "./Button";
import { NostrService } from "./utils/NostrService";
import { EventContext } from "./context/event-provider";
import { KeysContext } from "./context/keys-provider.jsx";
import { TipContext } from "./context/tip-provider.jsx";
import { useRouter } from "next/navigation";
import Editor from "./Editor";

const NoteArea = () => {
  // @ts-ignore
  const { keys } = useContext(KeysContext);
  // @ts-ignore
  const { setEvent } = useContext(EventContext);
  // @ts-ignore
  const { tipInfo } = useContext(TipContext);
  const { publish } = useNostr();
  const { connectedRelays } = useNostr();

  const router = useRouter();
  const [filetype, setFiletype] = useState("markdown");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tagInputValue, setTagInputValue] = useState<string>("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [{ postSending, postError }, setPost] = useState({
    postSending: false,
    postError: "",
  });

  const post = async (e: any) => {
    e.preventDefault();
    setPost({ postSending: true, postError: "" });

    const publicKey = keys.publicKey;

    let event = NostrService.createEvent(
      publicKey,
      text,
      title,
      filetype,
      tipInfo.noteAddress,
      tipInfo.customValue,
      tagsList
    );

    try {
      event = await NostrService.addEventData(event);
    } catch (err: any) {
      setPost({ postSending: false, postError: err.message });
      return;
    }
    console.log("gonna publish");

    let eventId: any = null;
    eventId = event?.id;

    connectedRelays.forEach((relay) => {
      console.log("HELLO")
      let sub = relay.sub([
        {
          ids: [eventId],
        },
      ]);
      sub.on("event", (event: Event) => {
        console.log("we got the event we wanted:", event);
        setEvent(event);
        router.push("/note/" + eventId);
      });
      sub.on("eose", () => {
        console.log("EOSE!!!!!!!")
        sub.unsub();
      });
    });

    const pubs = publish(event);

    // @ts-ignore
    for await (const pub of pubs) {
      pub.on("ok", () => {
        console.log("OUR EVENT WAS ACCEPTED");
        setPost({ postSending: false, postError: "" });
      });

      await pub.on("seen", async () => {
        console.log("OUR EVENT WAS SEEN");
        setEvent(event);
        router.push("/note/" + eventId);
      });

      pub.on("failed", (reason: any) => {
        setPost({ postSending: false, postError: reason });
        console.log("OUR EVENT HAS FAILED");
      });
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    post(e)
  }

  return (
    <div className="w-full mx-auto">
      <form onSubmit={handleSubmit}>
        <Editor
          filetype={filetype}
          setFiletype={setFiletype}
          text={text}
          setText={setText}
          title={title}
          setTitle={setTitle}
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
          >
            {postSending ? "Sending..." : postError ? postError : "Create Note"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NoteArea;
