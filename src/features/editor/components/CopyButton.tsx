"use client";

import { Copy } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { decodeBase64Content } from "~/lib/utils";
import { useSnippetEvent } from "../hooks/useSnippetEvent";

type Props = {
  eventId: string;
  kind?: number;
  author?: string;
  relays?: string[];
};

export function CopyButton({ eventId, kind, author, relays }: Props) {
  const { data: snippet } = useSnippetEvent(eventId, kind, author, relays);

  const content = useMemo(() => {
    if (!snippet?.content) return "";
    return decodeBase64Content(snippet.content).content;
  }, [snippet?.content]);

  const handleCopy = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
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
