"use client";

import { Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useNostrProfile } from "~/hooks/useNostrProfile";
import { ZapDialog } from "./ZapDialog";

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
