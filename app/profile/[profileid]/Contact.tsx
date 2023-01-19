import Link from "next/link";
import { nip19 } from "nostr-tools";
import { shortenHash } from "../../lib/utils";

export default function Contact({ contact }: any) {
  let contentObj;
  let name;
  let about;
  let picture;

  const pubkey = contact.pubkey;
  const npub = shortenHash(nip19.npubEncode(contact.pubkey));

  try {
    const content = contact?.content;
    contentObj = JSON.parse(content);
    name = contentObj?.name;
    about = contentObj?.about;
    picture = contentObj?.picture;
  } catch (e) {
    console.log("Error parsing content");
  }

  // console.log("CONTACT:", contact);

  return (
    <li className="pb-3 mb-3">
      <Link href={`/profile/${pubkey}`}>
        <div className="flex flex-row gap-4 hover:scale-101 items-center ease-in-out duration-300">
          <img className="rounded-full w-8 mr-3" src={picture} />
          <span className="dark:text-zinc-500 mr-3 text-xl">{npub}</span>
          <span className="dark:text-zinc-500 mr-3 text-xl">{name}</span>
        </div>
      </Link>
    </li>
  );
}
