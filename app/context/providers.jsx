"use client";

import EventProvider from "./event-provider.jsx";
import KeysProvider from "./keys-provider.jsx";
import { CustomThemeProvider } from "./theme-provider";
import RelayProvider from "./relay-provider.jsx";
import { NostrProvider } from "nostr-react";
import { RELAYS } from "../utils/constants";

export default function Providers({ children }) {
  return (
    <NostrProvider relayUrls={RELAYS} debug={false}>
      <RelayProvider>
        <EventProvider>
          <KeysProvider>
            <CustomThemeProvider>{children}</CustomThemeProvider>
          </KeysProvider>
        </EventProvider>
      </RelayProvider>
    </NostrProvider>
  );
}
