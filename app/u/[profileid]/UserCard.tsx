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

  let showFollowButton = true;
  let action = "follow";

  if (loggedInUserPublicKey === pubkey) {
    showFollowButton = false;
  } else if (contacts.includes(pubkey)) {
    action = "unfollow";
  }

  return (
    <div className="flex flex-col items-center md:items-start gap-4">
      <img className="rounded-full mb-4 w-36" src={picture} alt={name} />
      <p className="text-2xl font-bold text-zinc-200">
        <span className="text-red-500">@</span>
        {name}
      </p>
      <p className="flex items-center gap-1">
        <Truncate
          content={npub}
          color="transparent"
          size="sm"
        />
      </p>
      <p className="text-sm text-accent">{about}</p>
        {showFollowButton && (
          <FollowButton
            action={action}
            loggedInUserPublicKey={loggedInUserPublicKey}
            currentContacts={loggedInUsersContacts}
            profilePublicKey={pubkey}
          />
        )}
      </div>
  );
}
