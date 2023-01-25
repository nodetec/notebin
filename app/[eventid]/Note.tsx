import { Event } from "nostr-tools";
import { getTagValues } from "../lib/utils";
import NoteDisplay from "../NoteDisplay";

interface NoteProps {
  event: Event;
}

export default function Note({ event }: NoteProps) {
  // TODO: get event from context if available instead of using hook everytime

  const content = event.content;
  const tags = event.tags;

  let markdown = "";

  const title = getTagValues("subject", event.tags);
  const filetypeTag = getTagValues("filetype", tags);

  function setupMarkdown(content: string) {
    var md = require("markdown-it")();
    var result = md.render(content);
    return result;
  }

  let isMarkdown = false;

  if (filetypeTag === "markdown") {
    markdown = setupMarkdown(content);
    isMarkdown = true;
  }

  return (
    <>
      {event &&
        (isMarkdown ? (
          <div className="border-tertiary border-r pr-10 w-full prose prose-xl prose-invert">
            <h1>{title}</h1>
            <div dangerouslySetInnerHTML={{ __html: markdown }}></div>
          </div>
        ) : (
          <div className="w-full">
            <NoteDisplay event={event} filetype={filetypeTag} />
          </div>
        ))}
    </>
  );
}
