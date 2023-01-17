"use client";

import { NostrProvider } from "nostr-react";
import HeaderContent from "./HeaderContent";
import { RELAYS } from "./constants";

export default function Header() {
  return (
    <NostrProvider relayUrls={RELAYS} debug={true}>
      <HeaderContent />
    </NostrProvider>
  );
}
