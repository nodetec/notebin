"use client";
import { useContext, useState } from "react";
import { useNostr } from "nostr-react";
import Button from "./Button";
import { NostrService } from "./utils/NostrService";
import { EventContext } from "./context/event-provider";
import { KeysContext } from "./context/keys-provider.jsx";
import { useRouter } from "next/navigation";
import { nip19 } from "nostr-tools";

interface CreatePostButtonProps {
  filetype: string;
  text: string;
  title: string;
  tagsList: string[];
  onSubmit: Function;
}

const CreatePostButton = ({
  filetype,
  text,
  title,
  tagsList,
  onSubmit,
}: CreatePostButtonProps) => {
  // @ts-ignore
  const { keys } = useContext(KeysContext);
  // @ts-ignore
  const { setEvent } = useContext(EventContext);
  const { publish } = useNostr();
  const { connectedRelays } = useNostr();

  const router = useRouter();
  const [{ postSending, postError }, setPost] = useState({
    postSending: false,
    postError: "",
  });

  const post = async (e: any) => {
    e.preventDefault();

    if (title.trim().length) {
      onSubmit(true);

      setPost({ postSending: true, postError: "" });

      const publicKey = keys.publicKey;

      const tags = [
        ["filetype", filetype],
        ["client", "notebin"],
        ["node_address", ""],
        ["custom_value", ""],
        ["tags", tagsList.join(",")],
        ["subject", title],
      ];

      let event = NostrService.createEvent(2222, publicKey, text, tags);

      try {
        event = await NostrService.addEventData(event);
      } catch (err: any) {
        setPost({ postSending: false, postError: err.message });
        return;
      }

      let eventId: any = null;
      eventId = event?.id;

      connectedRelays.forEach((relay) => {
        let sub = relay.sub([
          {
            ids: [eventId],
          },
        ]);
        sub.on("event", (event: Event) => {
          console.log("we got the event we wanted:", event);
          setEvent(event);
          router.push("/" + nip19.noteEncode(eventId));
        });
        sub.on("eose", () => {
          console.log("EOSE");
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
          router.push("/" + nip19.noteEncode(eventId));
        });

        pub.on("failed", (reason: any) => {
          setPost({ postSending: false, postError: reason });
          console.log("OUR EVENT HAS FAILED");
        });
      }
    } else {
      onSubmit(false);
    }
  };

  return (
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
  );
};

export default CreatePostButton;
