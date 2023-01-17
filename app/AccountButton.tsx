"use client";

import Link from "next/link";
import { useProfile } from "nostr-react";

export default function AccountButton({ publicKey }: any) {
  console.log("profile publickey:", publicKey);

  let pubkey = "";

  if (publicKey) {
    pubkey = publicKey;
  }

  const { data } = useProfile({
    pubkey,
  });

  const shortenHash = (hash: string) => {
    if (hash) {
      return hash.substring(0, 4) + "..." + hash.substring(hash.length - 4);
    }
  };

  return (
    <>
      <Link href={`/profile/` + publicKey}>
        <span className="flex gap-2 dark:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full py-1 px-2">
          {data?.picture && (
            <img className="rounded-full w-6" src={data?.picture} />
          )}
          {shortenHash(publicKey)}
        </span>
      </Link>
    </>
  );
}
