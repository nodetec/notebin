"use client";
import Note from "./Note";

import { NostrProvider } from "nostr-react";
import { PROFILE_RELAYS } from "../../constants";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { KeysContext } from "../../context/keys-provider.jsx";

export default function NotePage() {
  // @ts-ignore
  const { keys } = useContext(KeysContext);
  const pathname = usePathname();
  const [eventId, setEventId] = useState("");

  useEffect(() => {
    if (pathname) {
      setEventId(pathname.split("/").pop() || "");
      console.log("eventId from path name", eventId);
    }
  }, []);
  return (
    <>
      <NostrProvider relayUrls={PROFILE_RELAYS} debug={true}>
        <Note eventId={eventId} keys={keys} />
      </NostrProvider>
    </>
  );
}
