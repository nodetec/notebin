"use client";
import Profile from "./Profile";

import { usePathname } from "next/navigation";

export default function ProfilePage() {
  const pathname = usePathname();

  if (pathname) {
    const pubkey = pathname.split("/").pop() || "";
    return <Profile pubkey={pubkey} />;
  } else {
    return <p>Profile not found</p>;
  }
}
