import { FilenameInput, LanguageSelect } from "~/features/editor";
import { DescriptionInput } from "~/features/editor";
import { getServerSession } from "next-auth";
import { authOptions } from "~/auth";
import type { UserWithKeys } from "~/types";
import { PostButton } from "~/features/post";
import { ActiveEditor } from "~/features/editor";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const user = session?.user as UserWithKeys;

  return (
    <>
      <div className="overflow-hidden rounded-md border border-border bg-background">
        <div className="flex w-full items-center justify-between gap-4 border-b bg-muted/50 px-2 py-3 align-start dark:bg-muted/30">
          <FilenameInput />
          <LanguageSelect />
        </div>
        <ActiveEditor />
      </div>
      <DescriptionInput />
      <div className="flex w-full items-center justify-end">
        <PostButton user={user} />
      </div>
    </>
  );
}
