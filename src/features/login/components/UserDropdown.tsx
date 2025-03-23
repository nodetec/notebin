"use client";

import { useMemo } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { useProfileEvent } from "~/hooks/useProfileEvent";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { parseRelayMetadataEvent } from "~/lib/nostr/parseRelayMetadataEvent";
import { useRelayMetadataEvent } from "~/hooks/useRelayMetaDataEvent";
import type { UserWithKeys } from "~/types";
import { useSession } from "next-auth/react";
import { parseProfileEvent } from "~/lib/nostr/parseProfileEvent";

type Props = {
  publicKey: string;
};

export function UserDropdown({ publicKey }: Props) {
  const session = useSession();

  const user = session.data?.user as UserWithKeys;

  const senderPubkey = user?.publicKey;

  const relayMetadataEvent = useRelayMetadataEvent(senderPubkey);

  const relayMetadata = useMemo(
    () => parseRelayMetadataEvent(relayMetadataEvent.data),
    [relayMetadataEvent],
  );

  const profileEvent = useProfileEvent(senderPubkey, relayMetadata.writeRelays);

  const profile = useMemo(
    () => parseProfileEvent(profileEvent.data),
    [profileEvent],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full focus-visible:ring-muted"
        >
          {profileEvent.status === "pending" ? (
            <Skeleton className="aspect-square w-12 overflow-hidden rounded-full object-cover" />
          ) : (
            <Image
              className="aspect-square w-12 overflow-hidden rounded-full object-cover"
              //   src={profile?.content?.picture ?? getAvatar(publicKey)}
              src={profile?.content?.picture ?? ""}
              width={48}
              height={48}
              alt=""
              loading="lazy"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-1" align="end">
        {/* <DropdownMenuItem asChild> */}
        {/* <Link href={createProfileLink(profile, publicKey)}> */}
        {/* {profile?.content?.name ?? shortenNpub(publicKey)} */}
        {/* </Link> */}
        {/* </DropdownMenuItem> */}
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem> */}
        {/* <DropdownMenuItem asChild>
          <Link href="/relays">Relays</Link>
        </DropdownMenuItem> */}
        {/* <DropdownMenuItem className="my-2 cursor-pointer text-[1rem] font-medium"> */}
        {/*   Stacks */}
        {/* </DropdownMenuItem> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
