import Buttons from "../../Buttons";
import FollowButton from "./FollowButton";

export default function UserCard({
  name,
  npub,
  about,
  picture,
  pubkey,
  loggedInUsersContacts,
  loggedInUserPublicKey,
}: any) {
  const contacts = loggedInUsersContacts.map((pair: string) => pair[1]);

  /* (contacts.includes(pubkey) */

  return (
    <div className="flex flex-col items-center lg:items-start gap-4">
      <img className="rounded-full mb-4 w-36" src={picture} alt={name} />
      <p className="text-2xl font-bold text-zinc-200">
        <span className="text-red-500">@</span>
        {name}
      </p>
      <p className="text-lg text-accent">{npub}</p>
      <p className="text-sm text-accent">{about}</p>
      {loggedInUserPublicKey === pubkey ? null : (
        <Buttons>
          <FollowButton
            loggedInUserPublicKey={loggedInUserPublicKey}
            currentContacts={loggedInUsersContacts}
            profilePublicKey={pubkey}
            contacts={contacts}
          />
        </Buttons>
      )}
    </div>
  );
}
