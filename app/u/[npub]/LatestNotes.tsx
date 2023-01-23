import { useNostrEvents } from "nostr-react";
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
    <div className="flex flex-col gap-4 w-full max-w-[75%]">
      <h1 className="text-3xl font-bold pb-4 text-center md:text-start">
        {name ? `${name}'s l` : "L"}atest notes
      </h1>
      <ul className="flex flex-col gap-4 text-center md:text-start">
        {events.map((event) => (
          <Card
            key={event.id}
            event={event}
          />
        ))}
      </ul>
    </div>
  );
}
