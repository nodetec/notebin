import { useNostrEvents } from "nostr-react";
import { nip19 } from "nostr-tools";

export default function Profile({ pubkey }: any) {
  const { events } = useNostrEvents({
    filter: {
      kinds: [0],
      authors: [pubkey],
    },
  });

  const content = events[0]?.content;
  const npub = nip19.npubEncode(pubkey);

  let contentObj;
  let name;
  let about;
  let picture;

  try {
    contentObj = JSON.parse(content);
    console.log(contentObj);
    name = contentObj?.name;
    about = contentObj?.about;
    picture = contentObj?.picture;
  } catch (e) {
    console.log("Error parsing content:", e);
  }

  // npub: string;
  // name?: string | undefined;
  // display_name?: string | undefined;
  // picture?: string | undefined;
  // about?: string | undefined;
  // website?: string | undefined;
  // lud06?: string | undefined;
  // lud16?: string | undefined;
  // nip06?: string | undefined;

  const shortenHash = (hash: string | undefined) => {
    if (hash) {
      return (
        " " + hash.substring(0, 4) + "..." + hash.substring(hash.length - 4)
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row items-center gap-4">
        <img className="rounded-full w-28" src={picture} />
        <p className="text-4xl font-bold pt-4 text-zinc-200">@{name}</p>
      </div>
      <div className="border border-zinc-500 rounded-md p-4">
        <p className="text-lg text-zinc-400">{shortenHash(npub)}</p>
        <p className="text-sm text-zinc-400">{about}</p>
      </div>
    </div>
  );
}
