"use client";

import EventProvider from "./event-provider.jsx";
import KeysProvider from "./keys-provider.jsx";
import { CustomThemeProvider } from "./theme-provider";
import RelayProvider from "./relay-provider.jsx";
import { NostrProvider } from "nostr-react";
import UserDataProvider from "./userdata-provider.jsx";
import { RELAYS } from "../utils/constants";

export default function Providers({ children }) {
  return (
    <NostrProvider relayUrls={RELAYS} debug={true}>
      <RelayProvider>
        <EventProvider>
          <KeysProvider>
            <UserDataProvider>
              <CustomThemeProvider>{children}</CustomThemeProvider>
            </UserDataProvider>
          </KeysProvider>
        </EventProvider>
      </RelayProvider>
    </NostrProvider>
  );
}
