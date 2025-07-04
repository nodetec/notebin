import { getServerSession } from "next-auth";
import { nip19 } from "nostr-tools";
import { authOptions } from "~/auth";
import {
  CopyButton,
  Description,
  Filename,
  ReadEditor,
  SnippetActions,
} from "~/features/editor";
import { TagList } from "~/features/editor/components/TagList";
import { AuthorProfile } from "~/features/snippet-feed";
import { ZapButton } from "~/features/zap";
import type { UserWithKeys } from "~/types";

export default async function SnippetPage({
  params,
}: {
  params: Promise<{ nevent: string }>;
}) {
  const { nevent } = await params;

  // Normalize the nevent string to lowercase before decoding
  const normalizedNevent = nevent.toLowerCase();
  const decodeResult = nip19.decode(normalizedNevent);

  const session = await getServerSession(authOptions);

  const user = session?.user as UserWithKeys;

  if (decodeResult.type === "nevent") {
    const { kind, id, author, relays } = decodeResult.data;

    // TODO: refactor this nonsense
    return (
      <>
        {author && (
          <div className="mb-4">
            <AuthorProfile
              publicKey={author}
              showAvatar={true}
              showName={true}
              showNip05={true}
              avatarSize="lg"
            />
          </div>
        )}
        <Description eventId={id} kind={kind} author={author} relays={relays} />
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
              {user?.publicKey && author && (
                <ZapButton
                  eventId={id}
                  author={author}
                  senderPubkey={user.publicKey}
                />
              )}
              <SnippetActions
                eventId={id}
                kind={kind}
                author={author}
                relays={relays}
              />
            </div>
          </div>
          <ReadEditor
            kind={kind}
            eventId={id}
            author={author}
            relays={relays}
          />
        </div>
        <TagList eventId={id} kind={kind} author={author} relays={relays} />
      </>
    );
  }

  return <div>Invalid Nevent</div>;
}
