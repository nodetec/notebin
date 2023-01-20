import Link from "next/link";
import { useProfile } from "nostr-react";
import Editor from "../Editor";
import { shortenHash } from "../lib/utils";
import { Event } from "nostr-tools";

interface NoteProps {
  event: Event;
}

export default function Note({ event }: NoteProps) {
  // TODO: get event from context if available instead of using hook everytime

  const id = event.id || "";
  const pubkey = event.pubkey;
  const content = event.content;
  const createdAt = event.created_at || 0;
  const tags = event.tags;

  // TODO: cache this
  const { data } = useProfile({
    pubkey,
  });

  let markdown = "";

  function setupMarkdown(content: string) {
    var md = require("markdown-it")();
    var result = md.render(content);
    return result;
  }

  let isMarkdown = false;

  if (tags[0][1] === "markdown") {
    markdown = setupMarkdown(content);
    isMarkdown = true;
  }

  return (
    <>
      {event &&
        (isMarkdown || tags[0][1] === "markdown" ? (
          <div className="border-tertiary border-r w-full prose prose-xl prose-zinc dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: markdown }}></div>
          </div>
        ) : (
          <div className="w-full">
            <Editor event={event} />
          </div>
        ))}
    </>
  );
}
