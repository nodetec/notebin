import { getServerSession } from "next-auth";
import { authOptions } from "~/auth";
import { AccountProfile } from "~/features/account";
import type { UserWithKeys } from "~/types";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as UserWithKeys;

  if (!user?.publicKey) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        <AccountProfile publicKey={user.publicKey} secretKey={user.secretKey} />
      </div>
    </div>
  );
}
