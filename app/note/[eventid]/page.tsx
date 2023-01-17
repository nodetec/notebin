"use client";
import Note from "./Note";

import { NostrProvider } from "nostr-react";
import { PROFILE_RELAYS } from "../../utils/constants";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotePage() {
  const pathname = usePathname();
  const [eventId, setEventId] = useState("");

  useEffect(() => {
    if (pathname) {
      setEventId(pathname.split("/").pop() || "");
      console.log("eventId from path name", eventId);
    }
  }, [pathname, eventId]);

  return (
    <>
      <NostrProvider relayUrls={PROFILE_RELAYS} debug={true}>
        <Note eventId={eventId} />
      </NostrProvider>
    </>
  );
}
