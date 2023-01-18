import Link from "next/link";
import { useNostrEvents } from "nostr-react";
import { nip19 } from "nostr-tools";
import Note from "./Note";

export default function LatestNotes({ pubkey }: any) {
  const { events } = useNostrEvents({
    filter: {
      kinds: [2222],
      authors: [pubkey],
      limit: 8,
    },
  });

  const content = events[0]?.content;
  // const npub = nip19.npubEncode(pubkey);

  // let contentObj;
  // let name;
  // let about;
  // let picture;

  // try {
  //   contentObj = JSON.parse(content);
  //   // console.log(contentObj);
  //   name = contentObj?.name;
  //   about = contentObj?.about;
  //   picture = contentObj?.picture;
  // } catch (e) {
  //   console.log("Error parsing content");
  // }

  const shortenHash = (hash: string | undefined) => {
    if (hash) {
      return (
        " " + hash.substring(0, 4) + "..." + hash.substring(hash.length - 4)
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ul>
        {events.map((event, index) => (
          <Note index={index} id={event.id} title={event.content} />
        ))}
      </ul>
    </div>
  );
}
