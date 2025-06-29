"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { nip19 } from "nostr-tools";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { useBatchedNostrProfile } from "~/hooks/useBatchedNostrProfile";
import { cn, getAvatar } from "~/lib/utils";

interface AuthorProfileProps {
  publicKey: string;
  className?: string;
  showAvatar?: boolean;
  showName?: boolean;
  showNip05?: boolean;
  avatarSize?: "sm" | "md" | "lg";
}

const avatarSizes = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function AuthorProfile({
  publicKey,
  className,
  showAvatar = true,
  showName = true,
  showNip05 = false,
  avatarSize = "md",
}: AuthorProfileProps) {
  const { data: profile, isLoading } = useBatchedNostrProfile(publicKey);
  const npub = nip19.npubEncode(publicKey);
  const displayName =
    profile?.name || `${npub.slice(0, 8)}...${npub.slice(-4)}`;

  return (
    <Link
      href={`/user/${npub}`}
      className={cn(
        "flex items-center gap-2 transition-opacity hover:opacity-80",
        className,
      )}
    >
      {showAvatar &&
        (isLoading ? (
          <div
            className={cn(
              "animate-pulse rounded-full bg-muted",
              avatarSizes[avatarSize],
            )}
          />
        ) : (
          <Avatar className={avatarSizes[avatarSize]}>
            {profile?.picture ? (
              <AvatarImage
                src={profile.picture}
                alt={displayName}
                loading="lazy"
              />
            ) : (
              <AvatarImage src={getAvatar(publicKey)} alt={displayName} />
            )}
            <AvatarFallback>
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      <div className="flex flex-col">
        {showName &&
          (isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <span className="font-medium text-sm">{displayName}</span>
          ))}
        {showNip05 && profile?.nip05 && (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground text-xs">
              {profile.nip05}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
