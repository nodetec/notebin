"use client";
import Note from "./Note";

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
  }, [pathname, eventId]);

  return (
    <>
      <Note eventId={eventId} keys={keys} />
    </>
  );
}
