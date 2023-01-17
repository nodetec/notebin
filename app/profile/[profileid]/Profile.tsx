import { useProfile } from "nostr-react";

const Profile = ({ pubkey }: any) => {
  console.log("profile publickey:", pubkey);

  const { data } = useProfile({
    pubkey,
  });

  // npub: string;
  // name?: string | undefined;
  // display_name?: string | undefined;
  // picture?: string | undefined;
  // about?: string | undefined;
  // website?: string | undefined;
  // lud06?: string | undefined;
  // lud16?: string | undefined;
  // nip06?: string | undefined;

  console.log("profile data", data);

  const shortenHash = (hash: string | undefined) => {
    if (hash) {
      return (
        " " + hash.substring(0, 4) + "..." + hash.substring(hash.length - 4)
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row items-center gap-4">
        <img className="rounded-full w-28" src={data?.picture} />
        <p className="text-4xl font-bold pt-4 text-zinc-200">@{data?.name}</p>
      </div>
      <div className="border border-zinc-500 rounded-md p-4">
        <p className="text-lg text-zinc-400">{shortenHash(data?.npub)}</p>
        <p className="text-sm text-zinc-400">{data?.about}</p>
      </div>
    </div>
  );
};

export default Profile;
