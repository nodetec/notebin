"use client";

import { useNostrProfile } from "~/hooks/useNostrProfile";
import { UserSnippetList } from "./UserSnippetList";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ExternalLink, Globe, MapPin, Github, Twitter } from "lucide-react";
import Link from "next/link";
import { getAvatar } from "~/lib/utils";

interface UserProfileProps {
  publicKey: string;
  npub: string;
}

export function UserProfile({ publicKey, npub }: UserProfileProps) {
  const { data: profile, isLoading, error } = useNostrProfile(publicKey, true);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-muted rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Error loading profile
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = profile?.name || profile?.shortNpub || "Anonymous";
  const shortNpub = npub ? `${npub.slice(0, 8)}...${npub.slice(-8)}` : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage 
                src={profile?.picture || getAvatar(publicKey)} 
                alt={displayName} 
              />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <p className="text-sm text-muted-foreground font-mono">
                  {shortNpub}
                </p>
                {profile?.nip05 && (
                  <Badge variant="secondary" className="mt-2">
                    ✓ {profile.nip05}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        {(profile?.about ||
          profile?.location ||
          profile?.website ||
          profile?.github ||
          profile?.twitter) && (
          <CardContent className="space-y-4">
            {profile?.about && (
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-muted-foreground">{profile.about}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {profile?.location && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin size={16} />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile?.website && (
                <Link
                  href={
                    profile.website.startsWith("http")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe size={16} />
                  <span>{profile.website}</span>
                  <ExternalLink size={12} />
                </Link>
              )}

              {profile?.github && (
                <Link
                  href={
                    profile.github.startsWith("http")
                      ? profile.github
                      : `https://github.com/${profile.github}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github size={16} />
                  <span>{profile.github}</span>
                  <ExternalLink size={12} />
                </Link>
              )}

              {profile?.twitter && (
                <Link
                  href={
                    profile.twitter.startsWith("http")
                      ? profile.twitter
                      : `https://twitter.com/${profile.twitter}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter size={16} />
                  <span>{profile.twitter}</span>
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <UserSnippetList publicKey={publicKey} />
    </div>
  );
}
