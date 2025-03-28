"use client";

import { Button } from "~/components/ui/button";
import { Zap } from "lucide-react";
import { ZapDialog } from "./ZapDialog";
import { useNostrProfile } from "~/hooks/useNostrProfile";

type Props = {
  eventId: string;
  author: string;
  senderPubkey: string;
};

export function ZapButton({ eventId, author, senderPubkey }: Props) {
  const nostrProfile = useNostrProfile(author, false);

  if (!nostrProfile?.data?.lud16 || !senderPubkey) {
    return null;
  }

  return (
    <ZapDialog
      recipientProfileEvent={nostrProfile.data.event}
      senderPubkey={senderPubkey}
      eventId={eventId}
    >
      <Button variant="outline" size="icon">
        <Zap className="size-4 text-orange-500 dark:text-yellow-400" />
      </Button>
    </ZapDialog>
  );
}
