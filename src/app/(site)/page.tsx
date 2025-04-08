import { FilenameInput, LanguageSelect } from "~/features/editor";
import { DescriptionInput } from "~/features/editor";
import { getServerSession } from "next-auth";
import { authOptions } from "~/auth";
import type { UserWithKeys } from "~/types";
import { PostButton } from "~/features/post";
import { ActiveEditor } from "~/features/editor";
import { TagsInput } from "~/features/editor";
import { InputTagList } from "~/features/editor";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const user = session?.user as UserWithKeys;

  return (
    <>
      <DescriptionInput />
      <div className="overflow-hidden rounded-md border border-border">
        <div className="flex w-full items-center justify-between gap-4 border-b bg-muted/50 px-2 py-3 align-start dark:bg-muted/30">
          <FilenameInput />
          <LanguageSelect />
        </div>
        <ActiveEditor />
        <TagsInput />
      </div>
      <InputTagList />
      <div className="flex w-full items-center justify-end">
        {user?.publicKey && (
          <PostButton publicKey={user.publicKey} secretKey={user.secretKey} />
        )}
      </div>
    </>
  );
}
