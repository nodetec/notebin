import Buttons from "../../Buttons";
import FollowButton from "./FollowButton";
import Truncate from "../../Truncate";

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
      <p className="flex items-center gap-1">
        <Truncate content={npub} color="transparent" size="sm" />
      </p>
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
