"use client";

import { Button } from "~/components/ui/button";
import { Zap } from "lucide-react";
import { ZapDialog } from "./ZapDialog";
import { useProfileEvent } from "~/hooks/useProfileEvent";
import { parseProfileEvent } from "~/lib/nostr/parseProfileEvent";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import type { UserWithKeys } from "~/types";
import { useRelayMetadataEvent } from "~/hooks/useRelayMetaDataEvent";
import { parseRelayMetadataEvent } from "~/lib/nostr/parseRelayMetadataEvent";
type Props = {
  eventId: string;
};

export function ZapButton({ eventId }: Props) {
  const session = useSession();

  const user = session.data?.user as UserWithKeys;

  const senderPubkey = user?.publicKey;

  const relayMetadataEvent = useRelayMetadataEvent(senderPubkey);

  const relayMetadata = useMemo(
    () => parseRelayMetadataEvent(relayMetadataEvent.data),
    [relayMetadataEvent]
  );

  const { data: profileEvent } = useProfileEvent(
    senderPubkey,
    relayMetadata.writeRelays
  );

  const profile = useMemo(
    () => parseProfileEvent(profileEvent),
    [profileEvent]
  );

  if (!profile?.content.lud16 || !senderPubkey) {
    return null;
  }

  return (
    <ZapDialog
      recipientProfileEvent={profileEvent}
      senderPubkey={senderPubkey}
      eventId={eventId}
    >
      <Button variant="outline" size="icon">
        <Zap className="size-4 text-orange-500 dark:text-yellow-400" />
      </Button>
    </ZapDialog>
  );
}
