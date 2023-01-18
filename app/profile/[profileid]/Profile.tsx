import { useNostrEvents } from "nostr-react";
import { nip19 } from "nostr-tools";
import Contacts from "./Contacts";
import LatestNotes from "./LatestNotes";
import UserCard from "./UserCard";

export default function Profile({ pubkey }: any) {
  const { events } = useNostrEvents({
    filter: {
      kinds: [0, 3],
      authors: [pubkey],
    },
  });

  const npub = nip19.npubEncode(pubkey);
  let contentObj;
  let name;
  let about;
  let picture;

  const userMetaData = events.filter((event) => event.kind === 0);

  try {
    const content = userMetaData[0]?.content;
    contentObj = JSON.parse(content);
    name = contentObj?.name;
    about = contentObj?.about;
    picture = contentObj?.picture;
  } catch (e) {
    console.log("Error parsing content");
  }

  const userContactEvent = events.filter((event) => event.kind === 3);
  const userContacts = userContactEvent[0]?.tags;

  // console.log()

  console.log("CONTACTS:", userContacts);

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
    <div className="flex flex-row gap-8">
      <LatestNotes pubkey={pubkey} />
      <div className="flex flex-col">
        <UserCard
          name={name}
          npub={shortenHash(npub)}
          about={about}
          picture={picture}
        />
        {userContacts && <Contacts userContacts={userContacts} />}
      </div>
    </div>
  );
}
