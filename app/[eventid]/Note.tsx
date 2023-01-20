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
    <div>
      {event &&
        (isMarkdown || tags[0][1] === "markdown" ? (
          <div className="border-t border-tertiary">
            <div className="flex justify-center">
              <div className="w-2/3 prose prose-zinc dark:prose-invert p-10 shrink-0 grow-0 basis-11/12">
                <div dangerouslySetInnerHTML={{ __html: markdown }}></div>
              </div>
              <div className="w-1/3 border-l border-tertiary grow-0 shrink-0 basis-1/12">
                <div className="p-10 overflow-hidden h-full">
                  <Link
                    className="text-xl dark:text-accent text-secondary hover:dark:text-tertiary"
                    href={`/u/` + pubkey}
                  >
                    <img className="rounded-full w-20" src={data?.picture} />
                  </Link>
                  <p className="text-lg font-bold pt-4 text-zinc-200">
                    @{data?.name}
                  </p>
                  <p className="text-lg text-accent">
                    {data && shortenHash(data.npub)}
                  </p>
                  <p className="text-sm text-accent pt-4">{data?.about}</p>
                  {/* </Button> */}
                  {/* <p className="text-zinc-600">kind: {event?.kind}</p> */}
                  {/* <p className="text-zinc-600"> */}
                  {/*   pubkey: */}
                  {/*   {shortenHash(event?.pubkey)} */}
                  {/* </p> */}
                  {/* <p className="text-slate-600">tags: {event?.tags}</p> */}
                  {/* <p className="text-zinc-600"> */}
                  {/*   sig: */}
                  {/*   {shortenHash(event?.sig)} */}
                  {/* </p> */}
                  {/* <p className="text-zinc-600"> */}
                  {/*   event id: */}
                  {/*   {shortenHash(event?.id)} */}
                  {/* </p> */}
                  {/* <p className="text-zinc-600"> */}
                  {/*   created_at: {event?.created_at} */}
                  {/* </p> */}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Editor event={event} />
        ))}
    </div>
  );
}
