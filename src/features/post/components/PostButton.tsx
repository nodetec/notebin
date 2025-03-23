"use client";

import { Button } from "~/components/ui/button";
import { useAppState } from "~/store";
import type { UserWithKeys } from "~/types";
import { usePostMutation } from "../hooks/usePostMutation";
import { toast } from "sonner";
import { useRelayMetadataEvent } from "~/hooks/useRelayMetaDataEvent";
import { cn } from "~/lib/utils";

type PostButtonProps = {
  user: UserWithKeys;
};

export function PostButton({ user }: PostButtonProps) {
  const content = useAppState((state) => state.content);
  const filename = useAppState((state) => state.filename);
  const lang = useAppState((state) => state.lang);
  const description = useAppState((state) => state.description);

  const relayMetadataEvent = useRelayMetadataEvent(user?.publicKey);

  const { mutate: postSnippet, isPending } = usePostMutation();

  const handlePost = async () => {
    if (!filename) {
      toast.error("Please enter a filename");
      return;
    }

    if (!user.publicKey || !user.secretKey) {
      toast.error("Please login to post");
      return;
    }

    postSnippet({
      content,
      filename,
      lang,
      description,
      publicKey: user.publicKey,
      secretKey: user.secretKey,
      relayMetadataEvent: relayMetadataEvent.data,
    });
  };

  return (
    <Button
      className={cn(
        "w-full py-6 font-bold font-semibold text-base md:w-auto md:py-2 md:text-sm",
        isPending && "cursor-progress"
      )}
      type="submit"
      onClick={handlePost}
      disabled={isPending}
    >
      {isPending ? "Posting..." : "Post Snippet"}
    </Button>
  );
}
