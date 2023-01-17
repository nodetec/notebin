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

  return (
    <>
      <p>Name: {data?.name}</p>
      <p>Public key: {data?.npub}</p>
      <p>About: {data?.about}</p>
      <img src={data?.picture} />
    </>
  );
};

export default Profile;
