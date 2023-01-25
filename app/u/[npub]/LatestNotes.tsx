import { useNostrEvents } from "nostr-react";
import Posts from "../../Posts";
import Card from "./Card";

export default function LatestNotes({ profilePubkey, name }: any) {
  const { events } = useNostrEvents({
    filter: {
      kinds: [2222],
      authors: [profilePubkey],
      limit: 5,
    },
  });

  return (
    <Posts
      title={
        events.length > 0
          ? `${name ? `${name}'s l` : "L"}atest notes`
          : `${name ? `${name} has no notes yet` : "No notes yet"}`
      }
      noPosts={events.length === 0}
    >
      <ul className="flex flex-col gap-4 text-center md:text-start">
        {events.map((event) => (
          <Card key={event.id} event={event} dateOnly />
        ))}
      </ul>
    </Posts>
  );
}
