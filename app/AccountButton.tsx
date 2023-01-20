import Link from "next/link";
import { useProfile } from "nostr-react";
import { shortenHash } from "./lib/utils";
import { DUMMY_PROFILE_API } from "./utils/constants";

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
        <img
          className="rounded-full w-6"
          src={data?.picture || DUMMY_PROFILE_API(data?.name || data?.npub!)}
        />
        {shortenHash(pubkey)}
      </span>
    </Link>
  );
}
