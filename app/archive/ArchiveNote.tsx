import Link from "next/link";
import { useProfile } from "nostr-react";
import { Event } from "nostr-tools";
import { ReactNode } from "react";
import { FaCalendarAlt } from "react-icons/fa";

interface ArchiveNoteProps {
  event: Event;
}

export default function ArchiveNote({ event }: ArchiveNoteProps) {
  const { data } = useProfile({
    pubkey: event.pubkey,
  });

  return (
    <div className="border border-gray-600 p-4 rounded-md">
      <Link href={`/u/` + event.pubkey}>
        <p className="text-lg text-zinc-300"> Event ID: {event.id}</p>
      </Link>
      <Link href={`/u/` + event.pubkey}>
        <p className="text-lg text-zinc-300">Public Key: {event.pubkey}</p>
      </Link>
      <img
        alt="(fill in with autoimage)"
        className="rounded-full w-6"
        src={data?.picture}
      />
      {/* <p className="text-lg text-zinc-300">Created at: {event.created_at}</p> */}
      <DatePosted timestamp={event.created_at} />
      <p className="text-lg text-zinc-300">tags: {event.tags}</p>
    </div>
  );
}

const InfoContainer = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-2">{children}</div>
);

const DatePosted = ({ timestamp }: { timestamp: number }) => {
  const timeStampToDate = (timestamp: number) => {
    let date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <InfoContainer>
      <span>
        <FaCalendarAlt className="w-4 h-4 text-current" />
      </span>
      <span>{timeStampToDate(timestamp)}</span>
    </InfoContainer>
  );
};
