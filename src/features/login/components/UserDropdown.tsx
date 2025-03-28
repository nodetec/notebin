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
import { getAvatar } from "~/lib/utils";
import { shortenNpub } from "~/lib/nostr/shortNpub";

type Props = {
  publicKey: string;
};

export function UserDropdown({ publicKey }: Props) {
  const nostrProfile = useNostrProfile(publicKey, true);

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
          {/* <Link href={createProfileLink(profile, publicKey)}> */}
          <span className="truncate">
            {nostrProfile.data?.name ?? shortenNpub(publicKey)}
          </span>
          {/* </Link> */}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
