"use server";

import { redirect } from "next/navigation";

export async function redirectToSnippet(eventId: string) {
  redirect(`/snippet/${eventId}`);
}
