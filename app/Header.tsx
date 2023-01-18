"use client";

import { NostrProvider } from "nostr-react";
import UserDataProvider from "./context/userdata-provider.jsx";
import HeaderContent from "./HeaderContent";
import { RelayContext } from "./context/relay-provider";
import { useContext } from "react";

export default function Header() {
  const { relays } = useContext(RelayContext)!;
  return (
    <NostrProvider relayUrls={relays} debug={true}>
      <UserDataProvider>
        <HeaderContent />
      </UserDataProvider>
    </NostrProvider>
  );
}
