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

  let showFollowButton = true;
  let action = "follow";

  if (loggedInUserPublicKey === pubkey) {
    showFollowButton = false;
  } else if (contacts.includes(pubkey)) {
    action = "unfollow";
  }

  return (
    <div className="flex flex-col items-center md:items-start gap-4">
      <img className="rounded-full mb-4 w-36 h-36 object-cover" src={picture} alt={name} />
      <p className="text-2xl font-bold text-zinc-200">
        <span className="text-red-500">@</span>
        {name}
      </p>
      <p className="text-lg text-accent">{npub}</p>
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
