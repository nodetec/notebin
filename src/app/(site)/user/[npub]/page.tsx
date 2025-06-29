import { nip19 } from "nostr-tools";
import { UserProfile } from "~/features/user";

export default async function UserPage({
  params,
}: {
  params: Promise<{ npub: string }>;
}) {
  const { npub } = await params;

  try {
    // Decode the npub to get the public key
    const decodeResult = nip19.decode(npub);

    if (decodeResult.type !== "npub") {
      return <div className="p-4 text-center">Invalid npub format</div>;
    }

    const publicKey = decodeResult.data;

    return (
      <div className="container mx-auto px-4 py-8">
        <UserProfile publicKey={publicKey} npub={npub} />
      </div>
    );
  } catch (_error) {
    return <div className="p-4 text-center">Invalid npub format</div>;
  }
}
