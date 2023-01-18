"use client";

import Link from "next/link";
import { useProfile } from "nostr-react";
import { useContext, useEffect } from "react";
import { UserDataContext } from "./context/userdata-provider.jsx";

export default function AccountButton({ publicKey }: any) {
  // @ts-ignore
  const { setUserData } = useContext(UserDataContext);
  console.log("profile publickey:", publicKey);

  let pubkey = "";

  if (publicKey) {
    pubkey = publicKey;
  }

  const { data } = useProfile({
    pubkey,
  });

  useEffect(() => {
    setUserData(data);
  }, []);

  const shortenHash = (hash: string) => {
    if (hash) {
      return hash.substring(0, 4) + "..." + hash.substring(hash.length - 4);
    }
  };

  return (
    <>
      <Link href={`/profile/` + publicKey}>
        <span className="flex gap-2 dark:bg-zinc-900 text-zinc-300 border border-zinc-700 rounded-full py-1 px-2">
          {data?.picture && (
            <img className="rounded-full w-6" src={data?.picture} />
          )}
          {shortenHash(publicKey)}
        </span>
      </Link>
    </>
  );
}
