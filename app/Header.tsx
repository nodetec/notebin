"use client";

import { NostrProvider } from "nostr-react";
import UserDataProvider from "./context/userdata-provider.jsx";
import HeaderContent from "./HeaderContent";
import { RELAYS } from "./utils/constants";

export default function Header() {
  return (
    <NostrProvider relayUrls={RELAYS} debug={true}>
      <UserDataProvider>
        <HeaderContent />
      </UserDataProvider>
    </NostrProvider>
  );
}
