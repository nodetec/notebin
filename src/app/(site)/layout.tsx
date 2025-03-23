import { Button } from "~/components/ui/button";
import { Github } from "lucide-react";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Login } from "~/features/login/components/Login";
import { shortenNpub } from "~/lib/nostr/shortNpub";
import type { UserWithKeys } from "~/types";
import { getServerSession } from "next-auth";
import { authOptions } from "~/auth";
import Link from "next/link";
import { UserDropdown } from "~/features/login";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const user = session?.user as UserWithKeys;

  const shortNpub = shortenNpub(user?.publicKey);

  return (
    <main className="my-8 flex h-full w-full flex-col items-center justify-center gap-4 bg-background px-4">
      <div className="flex w-full max-w-4xl flex-col">
        <div className="mb-8 flex w-full items-start justify-between gap-4">
          <Link href="/" className="no-underline">
            <h1 className="font-bold font-mono text-3xl">
              Notebin<span className="text-red-500">.</span>io
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <a
              className="hidden sm:block"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/nodetec/notebin"
            >
              <Button variant="outline" size="icon">
                <Github className="size-4" />
              </Button>
            </a>
            <ModeToggle />
            {user?.publicKey ? (
              <UserDropdown publicKey={user?.publicKey} />
            ) : (
              <Login>{shortNpub ?? "Login"}</Login>
            )}
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
