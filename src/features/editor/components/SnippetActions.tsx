"use client";

import { Download, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getExtensionForLanguage } from "~/lib/languageExtensions";
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
  const { data: event } = useSnippetEvent(eventId, kind, author, relays);

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

    toast.success(`Downloaded ${fullFilename}`);
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
