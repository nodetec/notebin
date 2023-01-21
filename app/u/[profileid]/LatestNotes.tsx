import { useNostrEvents } from "nostr-react";
import Note from "./Note";

export default function LatestNotes({ pubkey, name }: any) {
  const { events } = useNostrEvents({
    filter: {
      kinds: [2222],
      authors: [pubkey],
      limit: 5,
    },
  });

  return (
    <div className="flex flex-col gap-4 flex-1">
      <h1 className="text-3xl font-bold pb-4">
        {name ? `${name}'s l` : "L"}atest notes
      </h1>
      <ul className="flex flex-col gap-4">
        {events.map((event) => (
          <Note
            key={event.id}
            noteId={event.id!}
            content={event.content}
            tags={event.tags}
            createdAt={event.created_at}
          />
        ))}
      </ul>
    </div>
  );
}
