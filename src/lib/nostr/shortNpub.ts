import { nip19 } from "nostr-tools";

export const shortenNpub = (pubkey: string | undefined, length = 4) => {
  if (!pubkey) return undefined;

  try {
    const npub = nip19.npubEncode(pubkey);
    return `npub...${npub.substring(npub.length - length)}`;
  } catch (error) {
    console.error("Failed to encode npub:", error);
  }

  return undefined;
};
