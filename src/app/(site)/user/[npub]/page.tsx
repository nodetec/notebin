import { nip19 } from "nostr-tools";
import { UserProfile } from "~/features/user";
import { resolveNip05 } from "~/lib/nostr/resolveNip05";

export default async function UserPage({
  params,
}: {
  params: Promise<{ npub: string }>;
}) {
  const { npub: identifier } = await params;

  // Decode the URL parameter (handles %40 -> @)
  const decodedIdentifier = decodeURIComponent(identifier);

  // Check if it's a NIP-05 identifier (contains @)
  if (decodedIdentifier.includes("@")) {
    try {
      const resolution = await resolveNip05(decodedIdentifier);

      if (resolution.error || !resolution.publicKey || !resolution.npub) {
        return (
          <div className="p-4 text-center">
            <p>Unable to resolve NIP-05 identifier</p>
            <p className="mt-2 text-muted-foreground text-sm">
              {resolution.error || "Unknown error"}
            </p>
          </div>
        );
      }

      return (
        <div className="container mx-auto px-4 py-8">
          <UserProfile
            publicKey={resolution.publicKey}
            npub={resolution.npub}
          />
        </div>
      );
    } catch (error) {
      return (
        <div className="p-4 text-center">
          <p>Error resolving NIP-05 identifier</p>
          <p className="mt-2 text-muted-foreground text-sm">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      );
    }
  }

  // Otherwise, treat it as an npub
  try {
    // Decode the npub to get the public key
    const decodeResult = nip19.decode(decodedIdentifier);

    if (decodeResult.type !== "npub") {
      return <div className="p-4 text-center">Invalid npub format</div>;
    }

    const publicKey = decodeResult.data;

    return (
      <div className="container mx-auto px-4 py-8">
        <UserProfile publicKey={publicKey} npub={decodedIdentifier} />
      </div>
    );
  } catch (_error) {
    return <div className="p-4 text-center">Invalid npub format</div>;
  }
}
