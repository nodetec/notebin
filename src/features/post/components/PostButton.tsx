"use client";

import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useNostrProfile } from "~/hooks/useNostrProfile";
import { cn } from "~/lib/utils";
import { useAppState } from "~/store";
import { usePostMutation } from "../hooks/usePostMutation";

type PostButtonProps = {
  publicKey: string;
  secretKey?: string;
};

export function PostButton({ publicKey, secretKey }: PostButtonProps) {
  const content = useAppState((state) => state.content);
  const filename = useAppState((state) => state.filename);
  const lang = useAppState((state) => state.lang);
  const description = useAppState((state) => state.description);
  const tags = useAppState((state) => state.tags);

  const nostrProfile = useNostrProfile(publicKey, true);
  const { mutate: postSnippet, isPending } = usePostMutation();

  const handlePost = async () => {
    if (!filename) {
      toast.error("Please enter a filename");
      return;
    }

    postSnippet({
      content,
      filename,
      lang,
      description,
      publicKey,
      secretKey,
      writeRelays: nostrProfile.data?.writeRelays,
      tags,
    });
  };

  return (
    <Button
      className={cn(
        "mt-8 w-full py-6 font-mono font-semibold text-base md:w-auto md:py-2 md:text-sm",
        isPending && "cursor-progress",
      )}
      type="submit"
      onClick={handlePost}
      disabled={isPending}
    >
      {isPending ? "Posting..." : "Post Snippet"}
    </Button>
  );
}
