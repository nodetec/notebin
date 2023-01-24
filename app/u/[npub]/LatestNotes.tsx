import { useNostrEvents } from "nostr-react";
import Posts from "../../Posts";
import Card from "./Card";

export default function LatestNotes({ pubkey, name }: any) {
  const { events } = useNostrEvents({
    filter: {
      kinds: [2222],
      authors: [pubkey],
      limit: 5,
    },
  });

        
  return (
    <Posts title={`${name ? `${name}'s l` : "L"}atest notes`}>
      <ul className="flex flex-col gap-4 text-center md:text-start">
        {events.map((event) => (
          <Card key={event.id} event={event} dateOnly />
        ))}
      </ul>
    </Posts>
  );
}
