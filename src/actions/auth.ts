"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "~/auth";
import type { UserWithKeys } from "~/types";

export async function getUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as UserWithKeys | undefined;
  return user;
}

export async function redirectIfNotLoggedIn() {
  const session = await getServerSession(authOptions);
  const user = session?.user as UserWithKeys | undefined;
  if (!user) {
    redirect("/login");
  }
}
