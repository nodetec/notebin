import { useNostrEvents } from "nostr-react";
import Note from "./Note";

export default function LatestNotes({ pubkey }: any) {
  const { events } = useNostrEvents({
    filter: {
      kinds: [2222],
      authors: [pubkey],
      limit: 5,
    },
  });

  const shortenHash = (hash: string | undefined) => {
    if (hash) {
      return (
        " " + hash.substring(0, 4) + "..." + hash.substring(hash.length - 4)
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold pt-8 pb-4">Latest Notes</h1>
      <ul>
        {events.map((event, index) => (
          <Note
            index={index}
            id={event.id}
            content={event.content}
            tags={event.tags}
          />
        ))}
      </ul>
    </div>
  );
}
