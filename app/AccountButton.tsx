import Link from "next/link";
import { useProfile } from "nostr-react";
import { shortenHash } from "./lib/utils";

interface AccountButtonProps {
  pubkey: string;
}

export default function AccountButton({ pubkey }: AccountButtonProps) {
  const { data } = useProfile({
    pubkey,
  });

  return (
    <Link href={`/profile/` + pubkey}>
      <span className="flex gap-2 dark:bg-zinc-900 text-zinc-300 border border-zinc-700 rounded-full py-1 px-2">
        {data?.picture && (
          <img className="rounded-full w-6" src={data?.picture} />
        )}
        {shortenHash(pubkey)}
      </span>
    </Link>
  );
}
