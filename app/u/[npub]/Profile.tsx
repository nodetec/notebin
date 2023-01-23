import { useNostrEvents } from "nostr-react";
import { nip19 } from "nostr-tools";
import Contacts from "./Contacts";
import LatestNotes from "./LatestNotes";
import UserCard from "./UserCard";

import { useContext } from "react";
import { KeysContext } from "../../context/keys-provider.jsx";
import { DUMMY_PROFILE_API } from "../../utils/constants";

export default function Profile({ npub }: any) {
  const pubkey = nip19.decode(npub).data.valueOf();

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

  let name;
  let about;
  let picture;
  let lud06;
  let lud16;
  let nip05;
  let lnPubkey;
  let lnCustomValue;

  // console.log("PROFILE PUBLIC KEY", pubkey);

  const userMetaData = events.filter(
    (event) => event.kind === 0 && pubkey === event.pubkey
  );

  try {
    console.log("USER PROFILE PRE UPDATE:", userMetaData[0]);
    const content = userMetaData[0]?.content;
    console.log("CONTENT:", content);
    const contentObj = JSON.parse(content);
    name = contentObj?.name;
    nip05 = contentObj?.nip05;
    about = contentObj?.about;
    lnPubkey = contentObj?.ln_pubkey;
    lnCustomValue = contentObj?.ln_custom_value;
    lud06 = contentObj?.lud06;
    lud16 = contentObj?.lud16;
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
          npub={npub}
          nip05={nip05}
          about={about}
          picture={picture}
          lnPubkey={lnPubkey}
          lnCustomValue={lnCustomValue}
          lud06={lud06}
          lud16={lud16}
        />
        {currentContacts && <Contacts userContacts={currentContacts} />}
      </div>
    </div>
  ) : null;
}
