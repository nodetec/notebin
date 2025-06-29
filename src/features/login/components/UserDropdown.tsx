"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { useNostrProfile } from "~/hooks/useNostrProfile";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { getAvatar } from "~/lib/utils";
import { shortenNpub } from "~/lib/nostr/shortNpub";
import { nip19 } from "nostr-tools";

type Props = {
  publicKey: string;
};

export function UserDropdown({ publicKey }: Props) {
  const nostrProfile = useNostrProfile(publicKey, true);
  const npub = nip19.npubEncode(publicKey);

  console.log(nostrProfile.data);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full focus-visible:ring-muted"
        >
          {nostrProfile.status === "pending" ? (
            <Skeleton className="aspect-square w-12 overflow-hidden rounded-full object-cover" />
          ) : (
            <Image
              className="aspect-square w-12 overflow-hidden rounded-full object-cover"
              src={nostrProfile.data?.picture ?? getAvatar(publicKey)}
              width={48}
              height={48}
              alt=""
              loading="lazy"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-1" align="end">
        <DropdownMenuItem className="truncate" asChild>
          <Link href={`/user/${npub}`} className="truncate">
            {nostrProfile.data?.name ?? shortenNpub(publicKey)}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
