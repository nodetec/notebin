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
    <div className="border border-zinc-700 rounded-md p-4 flex flex-row justify-between items-center gap-4">
      <div>
        <p className="text-4xl font-bold pt-4 text-zinc-200">
          <span className="text-red-500">@</span>
          {name}
        </p>
        <p className="text-lg text-zinc-400">{npub}</p>
        <p className="text-sm text-zinc-400">{about}</p>
        {showFollowButton && (
          <FollowButton
            action={action}
            loggedInUserPublicKey={loggedInUserPublicKey}
            currentContacts={loggedInUsersContacts}
            profilePublicKey={pubkey}
          />
        )}
      </div>
      <img className="rounded-full w-28" src={picture} />
    </div>
  );
}
