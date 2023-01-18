"use client";
import NoteArea from "./NoteArea";

import { NostrProvider } from "nostr-react";
import { RELAYS } from "./utils/constants";

export default function HomePage() {
  return (
    <>
      <NostrProvider relayUrls={RELAYS} debug={true}>
        <NoteArea />
      </NostrProvider>
    </>
  );
}
