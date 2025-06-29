import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "~/auth";
import { AccountProfile } from "~/features/account";
import type { UserWithKeys } from "~/types";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as UserWithKeys;

  if (!user?.publicKey) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 font-bold text-3xl">Account Settings</h1>
        <AccountProfile publicKey={user.publicKey} secretKey={user.secretKey} />
      </div>
    </div>
  );
}
