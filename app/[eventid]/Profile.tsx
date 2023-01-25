import { useNostrEvents } from "nostr-react";
import { nip19 } from "nostr-tools";

import { useContext } from "react";
import { KeysContext } from "../context/keys-provider.jsx";
import UserCard from "../u/[npub]/UserCard";
import Note from "./Note";
import { DUMMY_PROFILE_API } from "../utils/constants";
import Contacts from "../u/[npub]/Contacts";

export default function Profile({ event }: any) {
  // @ts-ignore
  const { keys } = useContext(KeysContext);
  const loggedInPubkey = keys?.publicKey;

  const profilePubkey = event?.pubkey;
  const authors = [profilePubkey];

  if (loggedInPubkey) {
    authors.push(loggedInPubkey);
  }

  const { events } = useNostrEvents({
    filter: {
      kinds: [0, 3],
      authors,
    },
  });

  const npub = nip19.npubEncode(profilePubkey);
  let contentObj;
  let name;
  let about;
  let picture;
  let lud06;
  let lud16;
  let nip05;

  const userMetaData = events.filter(
    (event) => event.kind === 0 && profilePubkey === event.pubkey
  );

  try {
    const content = userMetaData[0]?.content;
    contentObj = JSON.parse(content);
    name = contentObj?.name;
    about = contentObj?.about;
    picture = contentObj?.picture || DUMMY_PROFILE_API(name || npub);
    nip05 = contentObj?.nip05;
    lud06 = contentObj?.lud06;
    lud16 = contentObj?.lud16;
  } catch (e) {
    console.log("Error parsing content");
  }

  // contacts for the profile you're visiting
  const profileContactEvents = events.filter(
    (event) => event.kind === 3 && event.pubkey === profilePubkey
  );
  const profileContactList = profileContactEvents[0]?.tags;

  // contacts for the logged in user
  const loggedInContactEvents = events.filter(
    (event) => event.kind === 3 && event.pubkey === loggedInPubkey
  );
  const loggedInContactList = loggedInContactEvents[0]?.tags;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center md:items-start gap-10 md:gap-20 flex-1">
      <Note event={event} />
      <div className="flex flex-col flex-shrink md:sticky top-4 w-full md:w-auto max-w-[22rem]">
        <UserCard
          loggedInPubkey={loggedInPubkey}
          loggedInContactList={loggedInContactList}
          profileContactList={profileContactList}
          profilePubkey={profilePubkey}
          name={name}
          npub={npub}
          nip05={nip05}
          about={about}
          picture={picture}
          lud06={lud06}
          lud16={lud16}
        />
        {profileContactList && <Contacts userContacts={profileContactList} />}
      </div>
    </div>
  );
}
