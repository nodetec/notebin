"use client";
import Profile from "./Profile";

import { NostrProvider } from "nostr-react";
import { PROFILE_RELAYS } from "../../utils/constants";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const pathname = usePathname();
  const [pubkey, setPubkey] = useState("");

  useEffect(() => {
    if (pathname) {
      setPubkey(pathname.split("/").pop() || "");
      console.log("pubkey from path name", pubkey);
    }
  }, []);
  return (
    <>
      <NostrProvider relayUrls={PROFILE_RELAYS} debug={true}>
        <Profile pubkey={pubkey} />
      </NostrProvider>
    </>
  );
}
