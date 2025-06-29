"use client";

import { Download, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { EventTemplate } from "nostr-tools";
import { SimplePool } from "nostr-tools";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { getExtensionForLanguage } from "~/lib/languageExtensions";
import { finishEvent } from "~/lib/nostr/finishEvent";
import { parseUint8Array } from "~/lib/nostr/parseUint8Array";
import type { UserWithKeys } from "~/types";
import { useSnippetEvent } from "../hooks/useSnippetEvent";

interface SnippetActionsProps {
  eventId: string;
  kind?: number;
  author?: string;
  relays?: string[];
}

export function SnippetActions({
  eventId,
  kind,
  author,
  relays,
}: SnippetActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: event } = useSnippetEvent(eventId, kind, author, relays);

  const user = session?.user as UserWithKeys | undefined;
  const isAuthor = user?.publicKey === author;

  const handleDownload = () => {
    if (!event) {
      toast.error("Unable to download snippet");
      return;
    }

    // Get filename from tags or create a default one
    const filename =
      event.tags.find((tag) => tag[0] === "name")?.[1] || "snippet";

    // Get extension from the filename if it already has one
    let fullFilename: string;
    if (filename.includes(".")) {
      fullFilename = filename;
    } else {
      // Try to get extension from tags, then from language, then default to txt
      const extensionFromTag = event.tags.find(
        (tag) => tag[0] === "extension",
      )?.[1];
      const language = event.tags.find((tag) => tag[0] === "l")?.[1];
      const extension =
        extensionFromTag || getExtensionForLanguage(language) || "txt";
      fullFilename = `${filename}.${extension}`;
    }

    // Create a blob with the content
    const blob = new Blob([event.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = fullFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!event || !user?.secretKey) {
      toast.error("Unable to delete snippet");
      return;
    }

    try {
      // Create a deletion event template (kind 5) according to NIP-09
      const deletionEventTemplate: EventTemplate = {
        kind: 5,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["e", eventId], // Reference the event to delete
        ],
        content: "Deleted via notebin",
      };

      // Parse the secret key and sign the event (same as posting)
      const secretKey = parseUint8Array(user.secretKey);
      const deletionEvent = await finishEvent(deletionEventTemplate, secretKey);

      if (!deletionEvent) {
        toast.error("Failed to sign deletion event");
        return;
      }

      // Publish to relays
      const pool = new SimplePool();
      const pubs = pool.publish(DEFAULT_RELAYS, deletionEvent);

      await Promise.all(pubs);
      pool.close(DEFAULT_RELAYS);

      toast.success("Snippet deleted successfully");

      // Redirect to home page after deletion
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Failed to delete snippet:", error);
      toast.error("Failed to delete snippet");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        {isAuthor && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
