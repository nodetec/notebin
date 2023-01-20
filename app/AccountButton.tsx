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
    <Link href={`/u/` + pubkey}>
      <span className="flex gap-2 dark:bg-primary text-accent border border-tertiary rounded-full py-2 px-3 hover:border-current">
        {data?.picture && (
          <img className="rounded-full w-6" src={data?.picture} />
        )}
        {shortenHash(pubkey)}
      </span>
    </Link>
  );
}
