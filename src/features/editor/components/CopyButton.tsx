"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useSnippetEvent } from "../hooks/useSnippetEvent";

type Props = {
  eventId: string;
  kind?: number;
  author?: string;
  relays?: string[];
};

export function CopyButton({ eventId, kind, author, relays }: Props) {
  const { data: snippet } = useSnippetEvent(eventId, kind, author, relays);

  const handleCopy = async () => {
    if (!snippet?.content) return;

    try {
      await navigator.clipboard.writeText(snippet.content);
      toast("Copied to clipboard", {
        description: "The snippet has been copied to your clipboard.",
      });
    } catch (error) {
      toast("Failed to copy", {
        description: "There was an error copying to your clipboard.",
      });
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleCopy}>
      <Copy className="size-4" />
    </Button>
  );
}
