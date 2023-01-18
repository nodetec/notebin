import { useNostrEvents } from "nostr-react";
import Contact from "./Contact";

export default function Contacts({ userContacts }: any) {
  const contactPublicKeys = userContacts.map((contact: any) => {
    return contact[1];
  });

  const { events: contacts } = useNostrEvents({
    filter: {
      kinds: [0],
      authors: contactPublicKeys,
    },
  });

  // const npub = nip19.npubEncode(pubkey);
  // let contentObj;
  // let name;
  // let about;
  // let picture;

  // const userMetaData = events.filter((event) => event.kind === 0);

  let uniqueContacts = contacts.filter(
    (obj, index, self) =>
      index === self.findIndex((t) => t.pubkey === obj.pubkey)
  );

  // console.log("UNIQUE CONTACTS:", uniqueContacts);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold pt-8 pb-4">Following</h1>
      <ul>
        {uniqueContacts &&
          uniqueContacts
            .slice(0, 5)
            .map((contact: any) => <Contact contact={contact} />)}
      </ul>
    </div>
  );
}
