import Link from "next/link";
import { useProfile } from "nostr-react";
import { Event, nip19 } from "nostr-tools";
import { ReactNode } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { DUMMY_PROFILE_API } from "../utils/constants";

interface ArchiveNoteProps {
  event: Event;
}

export default function ArchiveNote({ event }: ArchiveNoteProps) {
  const { data } = useProfile({
    pubkey: event.pubkey,
  });

  const npub = nip19.npubEncode(event.pubkey);

  return (
    <div className="border border-gray-600 p-4 rounded-md">
      <Link href={`/` + nip19.noteEncode(event.id || "")}>
        <p className="text-lg text-zinc-300">
          Event ID: {nip19.noteEncode(event.id || "")}
        </p>
      </Link>
      <Link href={`/u/` + nip19.npubEncode(event.pubkey)}>
        <p className="text-lg text-zinc-300">
          Public Key: {nip19.npubEncode(event.pubkey)}
        </p>
      </Link>
      <img
        className="rounded-full w-6"
        src={data?.picture || DUMMY_PROFILE_API(data?.name || npub)}
        alt={data?.name}
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
