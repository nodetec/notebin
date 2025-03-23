import { nip19 } from "nostr-tools";
import { Description, Filename, CopyButton } from "~/features/editor";
import { ReadEditor } from "~/features/editor/components/ReadEditor";
import { ZapButton } from "~/features/zap";

export default async function SnippetPage({
  params,
}: {
  params: { nevent: string };
}) {
  const { nevent } = await params;

  const decodeResult = nip19.decode(nevent);

  if (decodeResult.type === "nevent") {
    const { kind, id, author, relays } = decodeResult.data;

    return (
      <>
        <div className="overflow-hidden rounded-md border border-border bg-background">
          <div className="flex min-h-[61px] w-full items-center justify-between gap-4 border-b bg-muted/50 px-2 py-3 align-start dark:bg-muted/30">
            <Filename
              eventId={id}
              kind={kind}
              author={author}
              relays={relays}
            />
            <div className="flex items-center gap-2">
              <CopyButton
                eventId={id}
                kind={kind}
                author={author}
                relays={relays}
              />
              <ZapButton eventId={id} />
            </div>
          </div>
          <ReadEditor
            kind={kind}
            eventId={id}
            author={author}
            relays={relays}
          />
        </div>
        <Description eventId={id} kind={kind} author={author} relays={relays} />
        {/* <div className="flex w-full items-center justify-end">
        <PostButton user={user} />
      </div> */}
      </>
    );
  }

  return <div>Invalid Nevent</div>;
}
