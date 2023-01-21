import { useNostrEvents } from "nostr-react";
import { nip19 } from "nostr-tools";
import { shortenHash } from "../../lib/utils";
import Contacts from "./Contacts";
import LatestNotes from "./LatestNotes";
import UserCard from "./UserCard";

import { useContext } from "react";
import { KeysContext } from "../../context/keys-provider.jsx";
import { DUMMY_PROFILE_API } from "../../utils/constants";

export default function Profile({ pubkey }: any) {
  // @ts-ignore
  const { keys: loggedInUserPublicKey } = useContext(KeysContext);

  const { events } = useNostrEvents({
    filter: {
      kinds: [0, 3],
      authors: [pubkey, loggedInUserPublicKey?.publicKey],
      // authors: [pubkey],
      // limit: 5,
    },
  });

  console.log("EVENTS:", events);

  const npub = nip19.npubEncode(pubkey);
  let name;
  let about;
  let picture;

  // console.log("PROFILE PUBLIC KEY", pubkey);

  const userMetaData = events.filter(
    (event) => event.kind === 0 && pubkey === event.pubkey
  );

  try {
    const content = userMetaData[0]?.content;
    const contentObj = JSON.parse(content);
    name = contentObj?.name;
    about = contentObj?.about;
    picture = contentObj?.picture || DUMMY_PROFILE_API(name || npub);
  } catch {
    console.log("Error parsing content");
  }

  const userContactEvent = events.filter(
    (event) => event.kind === 3 && event.pubkey === pubkey
  );
  const currentContacts = userContactEvent[0]?.tags;

  const loggedInUserEvent = events.filter(
    (event) =>
      event.kind === 3 && event.pubkey === loggedInUserPublicKey?.publicKey
  );
  const loggedInUsersContacts = loggedInUserEvent[0]?.tags;

  // console.log("CONTACTS:", userContacts);

  // npub: string;
  // name?: string | undefined;
  // display_name?: string | undefined;
  // picture?: string | undefined;
  // about?: string | undefined;
  // website?: string | undefined;
  // lud06?: string | undefined;
  // lud16?: string | undefined;
  // nip06?: string | undefined;

  return loggedInUsersContacts ? (
    <div className="flex flex-col md:flex-row items-center md:items-start md:gap-10 lg:gap-30 lg:px-20 flex-1">
      <LatestNotes name={name} pubkey={pubkey} />
      <div className="flex flex-col flex-shrink md:sticky top-4 w-auto md:w-[25%] max-w-[22rem]">
        <UserCard
          loggedInUserPublicKey={loggedInUserPublicKey.publicKey}
          loggedInUsersContacts={loggedInUsersContacts}
          currentContacts={currentContacts}
          pubkey={pubkey}
          name={name}
          npub={shortenHash(npub)}
          about={about}
          picture={picture}
        />
        {currentContacts && <Contacts userContacts={currentContacts} />}
      </div>
    </div>
  ) : null;
}
